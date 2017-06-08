define(['durandal/system', 'knockout', 'jsRuntime/dataManager', 'jsRuntime/workflowManager',
    'durandal/app', 'plugins/dialog', 'jsRuntime/resourceManager', 'jsRuntime/utility',
    'jsRuntime/eventAggregator', 'jsRuntime/configManager', 'jsRuntime/styleManager', 'jsRuntime/actionManager',
    'udl/share', 'udl/vmProvider'],
    function (system, ko, dm, wm, app, dialog, rm, utility, evtAggtor, cm, styleManager, am, share, vmp) {
        var viewAreas = {};
        var vm = {
            //页面Tab显示区域 格式{ 'tabId': guid, 'tabName': '', runWfInstance: wfinstance, "tabArea": ko.observable() };
            tabViewAreas: ko.observableArray(),
            //记录所以运行时ViewModes  格式｛wfInstanceId:{vmInstanceId:mode,vmInstanceId:mode}｝
            viewModes: {},

            //注册View区域
            registerViewArea: function (viewAreaName, config) {
                if (vm.isViewAreaRegistered(viewAreaName)) {
                    utility.log('viewArea ' + viewAreaName + ' is already registered');
                    throw new Error('viewArea ' + viewAreaName + ' is already registered');
                }
                if (!config) {
                    var config = cm.client;
                    var baseUrl = config.shellsBaseUrl;
                    config = { model: baseUrl + viewAreaName, view: baseUrl + viewAreaName + '.html' };

                    if (config.view.indexOf(cm.client.defaultArea) >= 0 && config.view.indexOf(cm.client.shellsBaseUrl) >= 0)
                        config.model.__modelId__ = cm.client.defaultArea;
                }

                viewAreas[viewAreaName] = ko.observable(config);

                vm.registerDialog(viewAreaName);

                return viewAreas[viewAreaName];
            },

            //注册Dialog
            registerDialog: function (viewAreaName) {
                dialog.addContext(viewAreaName, {
                    blockoutOpacity: 0.7,
                    removeDelay: 200,
                    /**
                     * In this function, you are expected to add a DOM element to the tree which will serve as the "host" for the modal's composed view. You must add a property called host to the modalWindow object which references the dom element. It is this host which is passed to the composition module.
                     * @method addHost
                     * @param {Dialog} theDialog The dialog model.
                     */
                    addHost: function (theDialog) {
                        var viewArea = $("div[satm-attr='" + viewAreaName + "']");
                        viewArea.addClass('customModalParent');
                        var blockout = $('<div class="customModalBlockout"></div>')
                            .css({ 'z-index': dialog.getNextZIndex(), 'opacity': this.blockoutOpacity })
                            .appendTo(viewArea);

                        if (viewArea[0].scrollWidth > viewArea.innerWidth())
                            blockout.width(viewArea[0].scrollWidth);

                        var host = $('<div class="customModalHost"></div>')
                            .css({ 'z-index': dialog.getNextZIndex() })
                            .appendTo(viewArea);
                        var calculateTop = viewArea.offset().top + (viewArea.outerHeight() / 2);
                        //由于mainView底部被遮罩了部分高度，需要<div class='tile-cont'>重新计算mainView的实际高度。
                        if (viewAreaName == cm.client.defaultArea) {
                            var tileContent = $("div[satm-attr='tileContent']");
                            // 如果mainView的父级div有溢出，说明mainView被遮盖部分高度，需要重新计算实际高度。
                            if (tileContent[0] != null && (tileContent[0].scrollHeight > tileContent.innerHeight()))
                                calculateTop = viewArea.offset().top + ((tileContent.outerHeight() - (viewArea.offset().top - tileContent.offset().top)) / 2);

                            if (tileContent[0] == null) {
                                utility.log("layout.html not exists tileContent");
                                console.log("layout.html not exists tileContent");
                            }
                        }
                        host.css('top', calculateTop + 'px');

                        theDialog.host = host.get(0);
                        theDialog.blockout = blockout.get(0);
                    },
                    /**
                     * This function is expected to remove any DOM machinery associated with the specified dialog and do any other necessary cleanup.
                     * @method removeHost
                     * @param {Dialog} theDialog The dialog model.
                     */
                    removeHost: function (theDialog) {
                        $(theDialog.host).css('opacity', 0);
                        $(theDialog.blockout).css('opacity', 0);

                        setTimeout(function () {
                            ko.removeNode(theDialog.host);
                            ko.removeNode(theDialog.blockout);
                            var viewArea = $("div[satm-attr='" + viewAreaName + "']");
                            if (viewArea.find('div[class="customModalBlockout"]').length == 0)
                                viewArea.removeClass('customModalParent');
                        }, this.removeDelay);
                    },
                    attached: function (view) {
                        //To prevent flickering in IE8, we set visibility to hidden first, and later restore it
                        $(view).css("visibility", "hidden");
                    },
                    /**
                     * This function is called after the modal is fully composed into the DOM, allowing your implementation to do any final modifications, such as positioning or animation. You can obtain the original dialog object by using `getDialog` on context.model.
                     * @method compositionComplete
                     * @param {DOMElement} child The dialog view.
                     * @param {DOMElement} parent The parent view.
                     * @param {object} context The composition context.
                     */
                    compositionComplete: function (child, parent, context) {
                        var theDialog = dialog.getDialog(context.model);
                        var $child = $(child);
                        var loadables = $child.find("img").filter(function () {
                            //Remove images with known width and height
                            var $this = $(this);
                            return !(this.style.width && this.style.height) && !($this.attr("width") && $this.attr("height"));
                        });

                        $child.data("predefinedWidth", $child.get(0).style.width);

                        var setDialogPosition = function (childView, objDialog) {
                            //Setting a short timeout is need in IE8, otherwise we could do this straight away
                            setTimeout(function () {
                                var $childView = $(childView);

                                objDialog.context.reposition(childView);

                                $(objDialog.host).css('opacity', 1);
                                $childView.css("visibility", "visible");

                                $childView.find('.autofocus').first().focus();
                            }, 1);
                        };

                        setDialogPosition(child, theDialog);
                        loadables.load(function () {
                            setDialogPosition(child, theDialog);
                        });

                        if ($child.hasClass('autoclose') || context.model.autoclose) {
                            $(theDialog.blockout).click(function () {
                                theDialog.close();
                            });
                        }
                    },
                    /**
                     * This function is called to rgeposition the model view.
                     * @method reposition
                     * @param {DOMElement} view The dialog view.
                     */
                    reposition: function (view) {
                        var $view = $(view),
                            viewArea = $("div[satm-attr='" + viewAreaName + "']");

                        //We will clear and then set width for dialogs without width set 
                        if (!$view.data("predefinedWidth")) {
                            $view.css({ width: '' }); //Reset width
                        }
                        var width = $view.outerWidth(false),
                            height = $view.outerHeight(false),
                            viewAreaHeight = viewArea.height() - 20; //leave at least 20 pixels free
                        if (viewAreaName == cm.client.defaultArea) {
                            var tileContent = $("div[satm-attr='tileContent']");
                            // 如果mainView的父级div有溢出，说明mainView被遮盖部分高度，需要重新计算实际高度。
                            if (tileContent[0] != null && (tileContent[0].scrollHeight > tileContent.innerHeight()))
                                viewAreaHeight = tileContent.height() - (viewArea.offset().top - tileContent.offset().top) - 20;

                            if (tileContent[0] == null) {
                                utility.log("layout.html not exists tileContent");
                                console.log("layout.html not exists tileContent");
                            }
                        }
                        var viewAreaWidth = viewArea.width() - 10, //leave at least 10 pixels free
                            constrainedHeight = Math.min(height, viewAreaHeight),
                            constrainedWidth = Math.min(width, viewAreaWidth);

                        $view.css({
                            'margin-top': (-constrainedHeight / 2).toString() + 'px',
                            'margin-left': (-constrainedWidth / 2).toString() + 'px'
                        });

                        if (height > viewAreaHeight) {
                            $view.css("overflow-y", "auto").outerHeight(viewAreaHeight);
                        } else {
                            $view.css({
                                "overflow-y": "",
                                "height": ""
                            });
                        }

                        if (width > viewAreaWidth) {
                            $view.css("overflow-x", "auto").outerWidth(viewAreaWidth);
                        } else {
                            $view.css("overflow-x", "");

                            if (!$view.data("predefinedWidth")) {
                                //Ensure the correct width after margin-left has been set
                                $view.outerWidth(constrainedWidth);
                            } else {
                                $view.css("width", $view.data("predefinedWidth"));
                            }
                        }
                    }
                });
            },
            //册除View区域
            unRegisterViewArea: function (viewAreaName) {
                delete viewAreas[viewAreaName];
            },
            //View区域是否注册
            isViewAreaRegistered: function (viewAreaName) {
                return viewAreas.hasOwnProperty(viewAreaName);
            },
            //获取或注册View区域
            getOrRegisterViewArea: function (viewAreaName, config) {
                if (!vm.isViewAreaRegistered(viewAreaName)) {
                    return vm.registerViewArea(viewAreaName, config);
                }
                return viewAreas[viewAreaName];
            },

            //重设显示区域显示默认的页面.
            resetViewArea: function (viewArea) {
                var baseUrl = cm.client.shellsBaseUrl + cm.client.shell + '/';
                system.acquire(baseUrl + viewArea).then(function (module) {
                    var model;
                    if (system.isFunction(module)) {
                        model = new module();
                    }
                    else {
                        if (module.reset) {
                            module.reset();
                        }
                        model = module;
                    }
                    if (viewArea == cm.client.defaultArea)
                        model.__modelId__ = cm.client.defaultArea;

                    vm.setViewArea(viewArea, {
                        model: model,
                        view: baseUrl + viewArea + '.html'
                    });
                });
            },

            //重设多个显示区域显示默认的页面.不传参既是所有。
            resetViewAreas: function (vas) {
                if (vas) {
                    $.each(vas, function (index, viewArea) {
                        vm.resetViewArea(viewArea);
                    });
                }
                else {
                    $.each(viewAreas, function (key) {
                        vm.resetViewArea(key);
                    });
                }
            },

            //设置ViewArea显示区域
            setViewArea: function (viewAreaName, config) {
                if (!vm.isViewAreaRegistered(viewAreaName)) {
                    utility.log('viewArea ' + viewAreaName + ' is not registered');
                    throw new Error('viewArea ' + viewAreaName + ' is not registered');
                }
                if (config.view.indexOf(cm.client.defaultArea) >= 0 && config.view.indexOf(cm.client.shellsBaseUrl) >= 0)
                    config.model.__modelId__ = cm.client.defaultArea;
                viewAreas[viewAreaName](config);
            },

            //单独显示某个页面
            showPage: function (vmContext) {
                var _vmContext = {
                    page: null,         //page：页面modelID;
                    area: null,         //area：页面显示区域
                    viewState: null,    //viewState:是否退回
                };
                $.extend(_vmContext, vmContext);

                var modelId = _vmContext.page;
                var viewAreaName = _vmContext.area;
                var viewState = _vmContext.viewState;


                if (!vm.isViewAreaRegistered(viewAreaName)) {
                    utility.log('viewArea ' + viewAreaName + ' is not registered')
                    throw new Error('viewArea ' + viewAreaName + ' is not registered');
                }
                return system.defer(function (dfd) {
                    system.acquire(modelId).then(function (module) {
                        var model, vmInstanceId;
                        if (system.isFunction(module))
                            model = new module();
                        else
                            model = module;

                        viewAreas[viewAreaName]({
                            'model': model,
                            'view': modelId + '.html'
                        });
                    }).fail(function (err) {
                        utility.log('Failed to load  module (' + modelId + '). Details: ' + err.message)
                        system.error('Failed to load  module (' + modelId + '). Details: ' + err.message);
                        if (dfd) dfd.reject(err);
                    });
                }).promise();
            },

            /*工作流Show页面
              参数:vmContext:{}
            */
            show: function (vmContext) {
                var _vmContext = {
                    page: null,         //page：页面modelID;
                    area: null,         //area：工作流页面显示区域
                    showData: null,     //showData:工作流输出参数
                    viewState: null,    //viewState:是否退回
                    instanceId: null,   //instanceId：工作流实例ID
                    activityInstanceId: null,//activityInstanceId：工作流当前活动实例ID
                    owner: null,        //owner:硬件回传参数
                    isDialog: false,    //isDialog：是否显示为对话框
                    flowId: null,        //交易场景号：如"CS1010"
                    isTab: false,
                    tabId: null,
                };
                $.extend(_vmContext, vmContext);

                var modelId = _vmContext.page;
                var viewAreaName = _vmContext.area;
                var wfOutput = _vmContext.showData;
                var viewState = _vmContext.viewState;
                var wfinstanceId = _vmContext.instanceId;

                if (!_vmContext.isTab)
                    if (!vm.isViewAreaRegistered(viewAreaName)) {
                        throw new Error('viewArea ' + viewAreaName + ' is not registered');
                    }

                return system.defer(function (dfd) {
                    system.acquire(modelId)
                        .then(function (module) {
                            var model;
                            if (viewState != 'back') {
                                //ViewMode 实例ID
                                var vmInstanceId = system.guid();

                                //工作流实例dfd
                                wm.instance[wfinstanceId].dfd = dfd;
                                wm.instance[wfinstanceId].currentVmInstanceId = vmInstanceId;

                                //合并工作流输出值
                                if (wfOutput != undefined) {
                                    dm.mergeValue(wfinstanceId, wfOutput);
                                }


                                if (!share.trans.hasOwnProperty(wfinstanceId)) {
                                    Object.defineProperty(share.trans, wfinstanceId, { value: {} })
                                }

                                var cx = {
                                    instanceId: wfinstanceId,
                                    currentViewArea: viewAreaName,
                                    flowID: _vmContext.flowId,
                                    tabId: _vmContext.tabId,
                                    rm: rm.instance[wfinstanceId],
                                    wm: wm.instance[wfinstanceId],
                                    dm: dm.instance[wfinstanceId],
                                    shareTrans: share.trans[wfinstanceId]
                                };



                                if (system.isFunction(module)) {
                                    model = new module(cx);

                                    if (dm.instance[wfinstanceId] != null) {
                                        $.each(model, function (key) {
                                            if (ko.isObservable(model[key]) && ko.isWriteableObservable(model[key])) {
                                                if (dm.instance[wfinstanceId].hasOwnProperty(key)) {
                                                    model[key](dm.instance[wfinstanceId][key]);
                                                }
                                            }
                                        });
                                    }

                                    //ViewMode 实例ID
                                    model.__vmInstanceId__ = vmInstanceId;
                                    //ViewMode modelId
                                    model.__modelId__ = modelId;
                                    //工作流实例ID
                                    model.__wfinstanceId__ = wfinstanceId;
                                    //工作流ActivityID实例ID
                                    model.__actInstanceId__ = _vmContext.activityInstanceId;

                                    //是否对话框
                                    if (_vmContext.isDialog != null && _vmContext.isDialog)
                                        model.__isDialog__ = true;
                                    //todo: skip
                                    //model.cx["wm"].currentViewModel = model;
                                    vm.registerView(model);
                                } else {
                                    model = module;
                                    model.__vmInstanceId__ = vmInstanceId;
                                    model.__modelId__ = modelId;
                                    model.__wfinstanceId__ = wfinstanceId;
                                    model.__actInstanceId__ = _vmContext.activityInstanceId;
                                    if (_vmContext.isDialog != null && _vmContext.isDialog)
                                        model.__isDialog__ = true;
                                    vm.registerView(model);
                                }

                            }
                            else {
                                model = vm.getViewModelFromHistory(_vmContext.activityInstanceId, wfinstanceId);
                                if (model == undefined)
                                    utility.log("GetView error:" + _vmContext.modelId);
                                else {
                                    model.cx['wm'].dfd = dfd;
                                    model.cx["wm"].currentViewModel = model;
                                    model.cx["wm"].currentVmInstanceId = model.__vmInstanceId__;
                                }

                                setTimeout(function () {
                                    $(".tabsInput").removeAttr("disabled")
                                }, 1000);
                            }

                            if (_vmContext.isDialog != null && _vmContext.isDialog) {
                                require(["jsRuntime/actionManager"], function (am1) {
                                    am1.global.closeMaskLayer(viewAreaName);
                                    am1.global.closeMaskLayer('full');
                                });

                                model['viewUrl'] = modelId + '.html';
                                dialog.show(model, null, viewAreaName || 'default').then(function (result) {

                                }).fail(function (data) {
                                    dfd.resolve();
                                });
                            }
                            else {
                                //移除等待
                                require(["jsRuntime/actionManager"], function (am1) {
                                    //am1.global.closeMaskLayer(viewAreaName, false);
                                    //am1.global.closeMaskLayer('full');

                                    //显示页面
                                    utility.log("show " + modelId);
                                    console.log("show " + modelId);
                                    //viewAreas[viewAreaName]({
                                    //    'model': model,
                                    //    'view': modelId + '.html'
                                    //});

                                    //var newmodel = new vmp(model);


                                    var mvConfig = {
                                        'model': model,
                                        'view': modelId + '.html',
                                        'wfId': _vmContext.instanceId
                                    };



                                    if (!_vmContext.isTab)
                                        viewAreas[viewAreaName](mvConfig);
                                    else {
                                        var tabs = vm.getTabInstance(_vmContext.tabId);
                                        if (tabs.length != 0) {
                                            tabs[0].tabArea(mvConfig);
                                        }
                                        else {
                                            system.error("tabId:Note Exists.");
                                            vm.log("tabId:Note Exists.");
                                        }
                                    }
                                });
                            }

                        }).fail(function (err) {
                            system.error('Failed to load  module (' + modelId + '). Details: ' + err.message);
                            dfd.reject(err);
                        });
                }).promise();
            },

            //工作流Show对话框页面
            showDialog: function (vmContext) {
                var _vmContext = {
                    page: null,         //page：页面modelID;
                    area: null,         //area：工作流页面显示区域
                    showData: null,     //showData:工作流输出参数
                    viewState: null,    //viewState:是否退回
                    instanceId: null,   //instanceId：工作流实例ID
                    isDialog: true,     //isDialog：是否显示为对话框
                    flowId: null,       //交易场景号：如"CS1010"
                    pageTimeOut: 0,     //int型 设置页面超时时间
                    dialogTimeOut: 0,   //int型 设置页面超时后对话框超时时间
                    dialogMessage: "",  //string型 设置页面超时后对话框显示信息
                    forPadMessage: "",  //string型 设置对话框超时后发Pad信息
                };
                $.extend(_vmContext, vmContext);

                return vm.show(_vmContext);
            },

            //工作流无promise Show页面
            showAsync: function (vmContext) {
                var _vmContext = {
                    page: null,         //page：页面modelID;
                    area: null,         //area：工作流页面显示区域
                    showData: null,     //showData:工作流输出参数
                    viewState: null,    //viewState:是否退回
                    instanceId: null,   //instanceId：工作流实例ID
                    flowId: null        //交易场景号：如"CS1010"
                };
                $.extend(_vmContext, vmContext);

                var modelId = _vmContext.page;
                var viewAreaName = _vmContext.area;
                var wfOutput = _vmContext.showData;
                var viewState = _vmContext.viewState;
                var instanceId = _vmContext.instanceId;

                //返回子菜单
                if (_vmContext.hasOwnProperty("backSubMenu")) {
                    if (vm.views.hasOwnProperty("_mainView_")) {
                        var model = vm.views["_mainView_"];
                        model.cachedMenus = model.menus();
                        model.menus([]);
                        viewAreas[viewAreaName]({
                            'model': model,
                            'view': modelId + '.html'
                        });
                        delete vm.views["_mainView_"];
                        return;
                    }
                }

                if (!vm.isViewAreaRegistered(viewAreaName)) {
                    utility.log('viewArea ' + viewAreaName + ' is not registered');
                    throw new Error('viewArea ' + viewAreaName + ' is not registered');
                }

                system.acquire(modelId)
                    .then(function (module) {
                        var model;

                        if (wfOutput != undefined) {
                            dm.mergeValue(instanceId, wfOutput);
                        }

                        var cx = {
                            instanceId: instanceId,
                            flowID: _vmContext.flowId,
                            rm: rm.instance[instanceId],
                            dm: dm.instance[instanceId]
                        };

                        if (system.isFunction(module)) {
                            model = new module(cx);

                            if (dm.instance[instanceId] != null) {

                                $.each(model, function (key) {
                                    if (ko.isObservable(model[key]) && ko.isWriteableObservable(model[key])) {
                                        if (dm.instance[instanceId].hasOwnProperty(key)) {
                                            model[key](dm.instance[instanceId][key]);
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            model = module;
                        }

                        if (_vmContext.page.indexOf(cm.client.defaultArea) >= 0 && _vmContext.page.indexOf(cm.client.shellsBaseUrl) >= 0)
                            model.__modelId__ = cm.client.defaultArea;

                        //移除等待
                        require(['jsRuntime/actionManager'], function (am) {
                            am.global.closeMaskLayer(viewAreaName, true);

                            //显示页面
                            utility.log("show " + modelId);
                            console.log("show " + modelId);

                            if (model.hasOwnProperty("menus")) {
                                model.menus([]);
                                model.isChildMenu(false);
                                model.cachedMenus = [];
                            }

                            viewAreas[viewAreaName]({
                                'model': model,
                                'view': modelId + '.html'
                            });
                        });
                    }).fail(function (err) {
                        var msg = 'Failed to load  module (' + modelId + '). Details: ' + err.message;
                        utility.log.error(msg, err);
                        system.error(msg);
                    });
            },

            //显示堆栈ViewModel
            showStack: function (viewModel, viewAreaName, tabId) {
                var modelId = viewModel.__modelId__;

                if (tabId != null) {
                    return system.defer(function (dfd) {
                        system.acquire(modelId).then(function (module) {
                            dfd = viewModel.cx['wm'].dfd
                            var mvConfig = {
                                'model': viewModel,
                                'view': modelId + '.html'
                            };

                            var tabs = vm.getTabInstance(tabId);
                            if (tabs.length != 0) {
                                tabs[0].tabArea(mvConfig);
                            }
                            else {
                                system.error("TabName:Note Exists.");
                                vm.log("TabName:Note Exists.");
                            }
                        })
                    }).promise();
                }
                else {//支持SATM
                    vm.CurrentViewInstance[viewAreaName].wfInstanceID = viewModel.__wfinstanceId__;
                    vm.CurrentViewInstance[viewAreaName].vmInstanceId = viewModel.__vmInstanceId__;

                    return system.defer(function (dfd) {
                        system.acquire(modelId).then(function (module) {
                            dfd = viewModel.cx['wm'].dfd
                            viewAreas[viewAreaName]({
                                'model': viewModel,
                                'view': modelId + '.html'
                            });
                        })
                    }).promise();;
                }
            },

            //获取Tab实例
            getTabInstance: function (tabId) {
                var tabs = Enumerable.From(vm.tabViewAreas()).Where("$.tabId=='" + tabId + "'").ToArray();
                return tabs;
            },

            //记录ViewMode
            registerView: function (model) {
                var wfinstanceId = model.__wfinstanceId__;
                if (!vm.viewModes[wfinstanceId])
                    vm.viewModes[wfinstanceId] = {};

                vm.viewModes[wfinstanceId][model.__vmInstanceId__] = model;
            },
            //从运行时ViewMode  中获取实例
            getViewModelFromHistory: function (actInstanceId, wfInstanceId) {
                var result;
                var keys = Object.keys(vm.viewModes[wfInstanceId]);
                var itemViews = vm.viewModes[wfInstanceId];
                for (var i in keys) {
                    var item = itemViews[keys[i]];
                    if (item.__actInstanceId__ == actInstanceId && item.__wfinstanceId__ == wfInstanceId) {
                        result = item;
                        break;
                    }
                }
                if (result == null)
                    utility.log("未在views历史中找到 actInstanceId:" + actInstanceId + " 的数据")

                return result;
            },

            //清除ViewMode历史
            clearHistoryViews: function (wfInstanceId) {
                delete vm.viewModes[wfInstanceId];
            },

            //日志
            log: function (logStr) {
                utility.trace(logStr);
                console.log(logStr);
            },
        };

        //监听工作流结束，删除ViewModel历史
        evtAggtor.on('workflow:end', function (wfInstanceId) {
            utility.log('workflow:end');
            vm.clearHistoryViews(wfInstanceId)
        })
        return vm;
    });