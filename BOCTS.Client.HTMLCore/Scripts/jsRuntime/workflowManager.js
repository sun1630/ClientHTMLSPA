'use strict';
define(['durandal/system', 'durandal/app', 'jsRuntime/dataManager', 'jsRuntime/resourceManager', 'jsRuntime/configManager',
    'plugins/dialog', 'jsRuntime/utility', 'jsRuntime/eventAggregator', 'jsRuntime/styleManager', 'jquery'],
    function (system, app, dm, rm, cm, dialog, utility, aggregator, styleManager, $) {
        //保证配置的唯一性，只读取一次
        var cached = (window.__BOC_Cache || (window.__BOC_Cache = {}));
        if (cached.workflowManager) return cached.workflowManager;

        var getFlowChart = function (fileName) {
            return $.Deferred(function (dfd) {
                var charts = [fileName];
                require(charts, function (model) {
                    dfd.resolve(model);
                }, function () {
                    dfd.reject(arguments);
                    utility.log("##err", arguments[0]);
                })
            }).promise();
        };


        //工作流实例
        //参数flowId、 wfInstanceId工作流实例ID、viewArea显示区域
        var wfInstance = function (flowId, wfInstanceId, viewArea) {
            var self = this;
            this.flowId = flowId;
            this.wfInstanceId = wfInstanceId;
            this.currentViewModel = {};
            this.currentViewArea = viewArea;
            this.currentVmInstanceId = null;
            this.dfd = {};
            this.collectData = null;
            this.startPath = null;
            this.tabId = null;

            //继续流程
            this.continueFlow = function (para) {
                var _para = {
                    customData: {},//类型：json对象，将于viewModel中的KO数据合并,存入DM区,可不传，默认值为空对象
                    isContinue: true,//类型：function方法，根据方法的返回值（true,false）判断是否继续执行continueFlow方法，可不传，默认值为true
                    isDispMaskLayer: true,//类型：bool, true显示过场动画遮罩层,false不显示,可不传，默认值为true
                    isFullMask: false,//类型：bool,是否全屏遮罩，可不传，默认值为false
                    maskLayerMessge: rm.global.message.waiteMessage(),//类型:string ,过场动画遮罩层显示信息，可不传，便用默认值。
                };

                var viewModel = self.currentViewModel;
                var predResult = true;

                if (para == null || para.__modelId__ == null) {
                    $.extend(_para, para);
                    if ($.isFunction(_para.isContinue))
                        predResult = _para.isContinue();
                }
                var customData = _para.customData;

                if (predResult) {
                    var validationData = {}, resultData = {};
                    Object.keys(viewModel).forEach(function (key) {
                        var item = viewModel[key];
                        if (ko.isObservable(item) && ko.isWriteableObservable(item)) {
                            resultData[key] = item();
                            if (system.isArray(item())) {
                                //验证ko数组里的ko变量.
                                $.each(item(), function (index, value) {
                                    if (ko.isObservable(value) && ko.isWriteableObservable(value)) {
                                        validationData[key + index] = value;
                                    }
                                });
                            }
                            else if (system.isObject(item()) && Object.keys(item())) {
                                // //验证ko JSON里的ko变量.
                                $.each(item(), function (childKey) {
                                    var child = item()[childKey];
                                    if (ko.isObservable(child) && ko.isWriteableObservable(child)) {
                                        validationData[key + childKey] = child;
                                    }
                                });
                            }
                            else {
                                validationData[key] = item;
                            }
                        }
                        else if (system.isArray(item)) {
                            //验证普通数组里的ko变量.
                            $.each(item, function (index, value) {
                                if (ko.isObservable(value) && ko.isWriteableObservable(value)) {
                                    validationData[key + index] = value;
                                }
                            });
                        }
                    });
                    validationData = ko.validatedObservable(validationData);
                    var isValid = validationData.isValid();

                    if (!isValid) {
                        validationData.errors.showAllMessages();
                    } else {
                        if (customData && $.isPlainObject(customData)) {
                            $.extend(resultData, customData);
                        }
                        dm.mergeValue(wfInstanceId, resultData);

                        require(['jsRuntime/actionManager'], function (am) {
                            if (resultData) {
                                dialog.close(viewModel, resultData);
                                if (_para.isDispMaskLayer == true) {
                                    if (_para.isFullMask == true)
                                        am.global.showMaskLayer('full', _para.maskLayerMessge);
                                    else
                                        am.global.showMaskLayer(self.tabId, _para.maskLayerMessge);
                                }
                                self.dfd.resolve(resultData);
                            }
                            else {
                                self.dfd.resolve();
                            }
                        });
                    }
                }
            },

            //返回流程
            this.jumpto = function (actName) {
                require(['jsRuntime/actionManager'], function (am) {
                    var instanceId = self.wfInstanceId

                    wfjs.WorkflowInvoker.Instance[instanceId].Jumpto(actName);
                    am.global.showMaskLayer(self.tabId);

                    if (self.collectData) {
                        dialog.close(self.currentViewModel, self.collectData);
                        self.dfd.resolve(self.collectData);
                    }
                    else {
                        dialog.close(self.currentViewModel);
                        self.dfd.resolve();
                    }
                });
            }

            //结束流程
            this.terminate = function (wfInstanceId) {
                if (wfInstanceId == null) {
                    wfInstanceId = self.wfInstanceId
                }

                wfjs.WorkflowInvoker.Instance[wfInstanceId].Terminate();
                self.dfd.resolve();
            }
        }

        var wm = {
            //存放工作流实例
            instance: {
            },
            //工作流实例堆栈
            wfInstanceStack: {},
            //当前正在运行工作流实例
            currentRunWfInstance: null,

            global: {
                /*启动工作流
                  参数：flowId string类型 交易场景ID
                        parameter {} josn 类型 此参数可以不传 默认值如下：
                        inputs:工作流输入参数,此参数可以不传 默认值为{}
                        viewArea：工作流页面显示区域，此参数可以不传，默认值为主区域
                        runningWf:当前工作流处理　取值为：destory或stack（销毁/压栈） 此参数可以不传 默认值为destory
                        isBackground:当前启动流程是否为后台流程（无界面运行），不影响当前正在运行流程,此参数可以不传 默认值为false
                        isTab:是否Tab页方式启动流程，此参数可以不传 默认值为true
                        tabId:以Tab页方式启动流程，新流程显示在已有Tab页中 此参数在isTab为真时有效，可以不传，默认值为null
                        onFinishing:function 类型，工作流结束前回调此方法 此参数可以不传，默认值为null,
                        transTitle:交易名称（用作导航边显示） 此参数可以不传 默认值为'',
                        startPath:string类型 工作流启动目录 取值为：'center'、'common'、'branch'，默认值为center
                */
                startFlow: function (flowId, parameter) {
                    var _parameter = {
                        inputs: {},
                        viewArea: cm.client.defaultArea,
                        runningWf: 'destory',
                        isBackground: false,
                        viewModelId: null,
                        onFinishing: null,
                        isTab: true,
                        tabId: null,
                        transTitle: '',
                        startPath: 'center'
                    };
                    $.extend(_parameter, parameter);

                    initWf();

                    function initWf() {
                        require(['jsRuntime/actionManager', 'jsRuntime/viewManager'], function (am, vm) {
                            $.extend(_parameter, { "vm": vm });
                            if (!_parameter.isBackground) {
                                if (_parameter.isTab) {
                                    if (_parameter.runningWf == "stack") {
                                        wm.pushFlow({ wfpar: _parameter });
                                        wm.runWf(flowId, _parameter);
                                    }
                                    else {
                                        var tabs = wm.getTabInstances(_parameter);
                                        if (tabs.length != 0) {
                                            var currentRunWfInstance = tabs[0].runWfInstance;
                                            if (wfjs.WorkflowInvoker.Instance[currentRunWfInstance.wfInstanceId].Terminate()) {
                                                wm.runWf(flowId, _parameter);
                                            }
                                            else {
                                                var errorMessge = rm.global.message.transTerminateFail();// + (new Date()).Format("yyyy/MM/dd HH:mm:ss");
                                                am.global.showMessage(errorMessge, rm.global.message.alertTitle(), [{ text: rm.global.message.messageYes(), value: "Yes" }], false, viewArea).done(function (data) {
                                                    //alert(data)
                                                });
                                            }
                                        }
                                        else {
                                            wm.runWf(flowId, _parameter);
                                        }
                                    }
                                }
                                else {
                                    wm.runWf(flowId, _parameter);
                                }
                            }
                            else {
                                wm.runWf(flowId, _parameter);
                            }
                        });
                    }
                }
            },

            //工作流启动
            runWf: function (flowId, _parameter) {
                if (!flowId || flowId == null || flowId == '') {
                    wm.log("when startflow,flowId can't be null");
                    return;
                }

                var flowChartPath = 'Scenarios/';
                var resPath = 'Scenarios/';

                var ids = flowId.split('/');
                var transNo = ids[ids.length - 1];

                switch (_parameter.startPath) {
                    case cm.client.wfStartPath.center:
                        flowChartPath += cm.client.defaultCenter + "/" + flowId + "/" + transNo;
                        resPath += cm.client.defaultCenter + "/" + flowId;
                        break;
                    case cm.client.wfStartPath.common:
                        flowChartPath += cm.client.wfStartPath.common + "/" + flowId + "/" + transNo;
                        resPath += cm.client.wfStartPath.common + "/" + flowId;
                        break;
                    case cm.client.wfStartPath.branch:
                        flowChartPath += dm.machine.ProvPrefixNumEHR() + "/" + flowId + "/" + transNo;
                        resPath += dm.machine.ProvPrefixNumEHR() + "/" + flowId;
                        break;
                }

                wm.log("FlowChart Path:" + flowChartPath);
                getFlowChart(flowChartPath)
                    .then(function (chart) {
                        if ($.isFunction(chart))
                            chart = chart();

                        var invokerInstance = wfjs.WorkflowInvoker.CreateActivity(chart);
                        var wfinstance = new wfInstance(flowId, invokerInstance.InstanceId, _parameter.viewArea);
                        wfinstance.transTitle = _parameter.transTitle;
                        wfinstance.startPath = _parameter.startPath;
                        wm.instance[invokerInstance.InstanceId] = wfinstance;

                        //创建Tab显示区域
                        if (!_parameter.isBackground) {
                            if (_parameter.isTab) {
                                if (!_parameter.tabId) {
                                    createTab();
                                }
                                else {
                                    var tabs = wm.getTabInstances(_parameter);
                                    if (tabs.length != 0) {
                                        wfinstance.tabId = _parameter.tabId;
                                        tabs[0].runWfInstance = wfinstance;
                                    }
                                    else {//如Tab不存在 新建
                                        createTab();
                                    }
                                }
                            }
                        }

                        //新建Tab
                        function createTab() {
                            var tabId = system.guid();
                            _parameter.tabId = tabId;
                            wfinstance.tabId = tabId;

                            var config = { model: cm.client.shellsBaseUrl + "waitWf", view: cm.client.shellsBaseUrl + "waitWf.html" };
                            var obj = { 'tabId': tabId, 'tabName': '', runWfInstance: wfinstance, "tabArea": ko.observable(config) };
                            _parameter.vm.tabViewAreas.push(obj);
                        }

                        //显示业务名称
                        if (dm.commonDisply != null)
                            dm.commonDisply.transTitle(_parameter.transTitle);

                        wm.log("currentRunWf:(flowId,wfInstanceId)=>", flowId, invokerInstance.InstanceId);

                        rm.registerRes(resPath, invokerInstance.InstanceId).done(function () {
                            invokerInstance
                                .Inputs(_parameter.inputs)
                                .FlowchartSettings({ flowId: flowId, flowChart: flowChartPath, tabId: _parameter.tabId, isTab: _parameter.isTab })
                                .Invoke(function (err, context) {
                                    if (err != null) {
                                        utility.log.error(err);
                                    }

                                    //清除工作流实例相关数据
                                    aggregator.trigger("workflow:end", invokerInstance.InstanceId);
                                    rm.unRegisterRes(invokerInstance.InstanceId);
                                    dm.unRegisterDm(invokerInstance.InstanceId);
                                    wm.unRegisterWm(invokerInstance.InstanceId);

                                    //执行回调方法
                                    if (_parameter.onFinishing != null && $.isFunction(_parameter.onFinishing)) {
                                        wm.log("WfEnd:Run onFinishing function");
                                        _parameter.onFinishing({});
                                    }
                                    wm.log("WfEnd:flowId：" + flowId + " wfinstanceid:" + invokerInstance.InstanceId);

                                    //出栈
                                    if (!_parameter.isBackground) {
                                        if(_parameter.tabId!=null)
                                            wm.popFlow(_parameter);
                                        else//支持SATM
                                            wm.popFlow();
                                    }

                                    context.ClearFlowchartSettings();
                                });
                        }).fail(function (err) {
                            wm.log("register resource error:" + JSON.stringify(err));
                        });
                    })
                .fail(function (err) {
                    wm.log(err);
                });
            },

            //获取Tab实例集合
            getTabInstances: function (para) {
                var tabs = Enumerable.From(para.vm.tabViewAreas()).Where("$.tabId=='" + para.tabId + "'").ToArray();
                return tabs;
            },

            //流程压栈
            pushFlow: function (para) {
                try {
                    var _para = {
                        flowObj: "",//压栈对象，可取值（1、工作流flowId,string,类型。2、工作流实例对象，object类型
                        startPart: {},//工作流启运参数，参数内容同global下startFlow（parameter），此参数可为空
                    };
                    $.extend(_para, para);

                    if (_para.hasOwnProperty("wfpar")) {
                        var _pa = _para.wfpar;

                        var tabs = wm.getTabInstances(_pa); 
                        if (tabs.length != 0) {
                            var wfInstance = tabs[0].runWfInstance;

                            if (!wm.wfInstanceStack[_pa.tabId])
                                wm.wfInstanceStack[_pa.tabId] = ko.observableArray();
                            wm.wfInstanceStack[_pa.tabId].push(wfInstance);
                        }
                        else {
                            //wm.log("");
                        }
                    }
                    else {//支持SATM
                        if (!(_para.flowObj instanceof wfInstance)) {
                            wm.log("pushFlow:" + _para.flowObj);
                        }
                        else if ((_para.flowObj instanceof wfInstance)) {
                            wm.log("pushFlow:" + _para.flowObj.flowId);
                        }

                        if (!wm.wfInstanceStack[cm.client.defaultArea])
                            wm.wfInstanceStack[cm.client.defaultArea] = ko.observableArray();
                        wm.wfInstanceStack[cm.client.defaultArea].push(_para);
                    }
                }
                catch (ex) {
                    wm.log("pushFlow error:" + ex.message);
                }
            },

            //流程出栈
            popFlow: function (para) {
                try {
                    if (para != null) {
                        var wfInstance = wm.wfInstanceStack[para.tabId].pop();
                        para.vm.showStack(wfInstance.currentViewModel, wfInstance.currentViewArea, para.tabId);
                    }
                    else {//支持SATM
                        if (wm.wfInstanceStack[cm.client.defaultArea] != null && wm.wfInstanceStack[cm.client.defaultArea]().length > 0) {
                            var popObj = wm.wfInstanceStack[cm.client.defaultArea].pop();

                            if ($.isPlainObject(popObj) && ($.type(popObj.flowObj) === "object"))//出栈内容为对象
                            {
                                var wfInstance = popObj.flowObj
                                require(['jsRuntime/actionManager', 'jsRuntime/viewManager'], function (am, vm) {
                                    if (wfInstance.currentVmInstanceId != null) {
                                        wm.currentRunWfInstance = wfInstance;
                                        if (wfInstance.currentViewModel != null) {
                                            setTimeout(function () {
                                                wm.cancelNodeTimeout();
                                                vm.showStack(wfInstance.currentViewModel, wfInstance.currentViewArea);
                                                dm.commonDisply.transTitle(wfInstance.transTitle);
                                                aggregator.trigger("viewModel:changed:before", wfInstance.currentViewModel);

                                                require(['jsRuntime/actionManager'], function (am) {
                                                    am.global.closeMaskLayer(cm.client.defaultArea);
                                                    am.global.closeMaskLayer("full");
                                                });
                                            }, 200);
                                        }
                                        else {
                                            wm.log("popFlow ViewModel is null");
                                        }
                                    }
                                });
                            }
                            else//出栈内容为flowId
                            {
                                require(['jsRuntime/actionManager'], function (am) {
                                    am.global.closeMaskLayer("full");
                                    setTimeout(function () {
                                        wm.cancelNodeTimeout();
                                        wm.global.startFlow(popObj.flowObj, popObj.startPart);
                                    }, 200);
                                });
                            }
                        }
                    }
                }
                catch (ex) {
                    wm.log("popFlow error:" + ex.message);
                }
            },

            //删除工作流实例
            unRegisterWm: function (wfInstanceId) {
                delete wm.instance[wfInstanceId];
            },

            //取消当前节点定时
            cancelNodeTimeout: function () {
                require(['jsRuntime/actionManager'], function (am) {
                    am.global.cancelTimeOut();
                });
            },

            //日志
            log: function (logStr) {
                utility.trace(logStr);
                console.log(logStr);
            },

            //提示
            alert: function (txt) {
                require(['jsRuntime/actionManager'], function (am) {
                    var errorMessge = rm.global.message.transTerminateFail();// + (new Date()).Format("yyyy/MM/dd HH:mm:ss");
                    am.global.showMessage(txt, rm.global.message.alertTitle(), [{ text: rm.global.message.messageYes(), value: "Yes" }], false).done(function (data) {
                        //alert(data)
                    });
                });
            }
        };
        return cached.workflowManager = wm;
    });