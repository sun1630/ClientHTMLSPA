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

                        //当前环节定时取消
                        wm.cancelNodeTimeout();

                        require(['jsRuntime/actionManager'], function (am) {
                            if (resultData) {
                                dialog.close(viewModel, resultData);
                                //添加等待
                                if (_para.isDispMaskLayer == true) {
                                    if (_para.isFullMask == true)
                                        am.global.showMaskLayer('full', _para.maskLayerMessge);
                                    else
                                        am.global.showMaskLayer(viewArea, _para.maskLayerMessge);
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
                var instanceId = self.wfInstanceId

                wfjs.WorkflowInvoker.Instance[instanceId].Jumpto(actName);
                $("div[satm-attr='" + self.currentViewArea + "'] button").attr("disabled", "disabled");
                $("div[satm-attr='" + self.currentViewArea + "'] input").attr("disabled", "disabled");

                //当前环节定时取消
                wm.cancelNodeTimeout();

                if (self.collectData)
                    self.dfd.resolve(self.collectData);
                else
                    self.dfd.resolve();
            }

            //结束流程
            this.terminate = function (wfInstanceId) {
                if (wfInstanceId == null) {
                    wfInstanceId = self.wfInstanceId
                }

                //当前环节定时取消
                wm.cancelNodeTimeout();

                wfjs.WorkflowInvoker.Instance[wfInstanceId].Terminate();
                self.dfd.resolve();
            }
        }

        //构建导航栏步骤信息
        var buildStepInfo = function (inovkerInstance) {
            var steps = inovkerInstance.Steps;
            var result = [];
            if (steps && Array.isArray(steps))
                for (var i = 0; i < steps.length; i++) {
                    result.push({
                        title: ko.observable(steps[i].title),
                        icon: ko.observable(steps[i].icon),
                        state: ko.observable('unRun')
                    });
                }
            inovkerInstance.Steps = result;
            return result;
        }
        //上送报文
        var reportRequest = function (wfContext) {
            function getUrl() {
                return cm.services.wf.url + "wf/request?wf=TransactionLogTracking";
            }
            function createOpt() {
                var wfInstanceId = wfContext.InstanceId;
                var dmInstance = dm.instance[wfInstanceId];
                var url = getUrl();
                var header = {
                    machineId: cm.client.MachineId,
                    branchNo: cm.client.BranchNo,
                    scenarioInstanceId: wfInstanceId || '',
                    currentWFInstanceId: wfContext.CurrentInstanceId || '',
                    scenarioNo: wfContext.FlowchartSettings.flowId || 'unfound',
                    subScenarioNo: wfContext.FlowchartSettings.currentFlowId || wfContext.FlowchartSettings.flowId || 'unfound',//子流程场景号
                    custNum: dm.customer.CustNum ? dm.customer.CustNum() : '',
                    custName: dm.customer.CustName ? dm.customer.CustName() : '',
                    idType: dm.customer.IDType ? dm.customer.IDType() : '',
                    idNum: dm.customer.IDNum ? dm.customer.IDNum() : '',
                    culture: cm.client.culture || '',
                    tellerNo: dm.teller.TellerNo() || '',
                    tellerName: dm.teller.Name() || '',
                    provinceBranchNo: dm.machine.ProvinceBranchNo ? dm.machine.ProvinceBranchNo() : '',
                    workstationNo: dm.machine.WorkstationNo ? dm.machine.WorkstationNo() : '',
                    imageId: dmInstance.$ImageId,
                    agreementId: dmInstance.$AgreementId,

                };
                if (dmInstance.$StatusId == 0) {
                    dmInstance.$StatusId = 1;
                } else if (dmInstance.$StatusId == 1) {
                    dmInstance.$StatusId = 0;
                }

                var pars = {
                    StartTime: dmInstance.wf_StartTime || '',
                    EndTime: (new Date()).Format("yyyy/MM/dd HH:mm:ss"),
                    ErrorType: dmInstance.$ErrorType || '',
                    ErrorMessage: dmInstance.$ErrorMessage || '',
                    ScenarioMessage: dmInstance.$ScenarioMessage || '',
                    StatusId: dmInstance.$StatusId || '',
                    Amount: dmInstance.$Amount || 0,
                    Currency: dmInstance.$Currency || '',
                    LastDealerNo: dm.$LastDealerNo || '',
                    LastDealerName: dm.$LastDealerName || '',
                    ScenarioInstanceId: wfInstanceId || '',
                    BranchNo: cm.client.BranchNo,
                    TellerNo: dm.teller.TellerNo(),
                    TellerName: dm.teller.Name(),
                    MachineId: cm.client.MachineId,
                    ScenarioNo: wfContext.FlowchartSettings.flowId || 'unfound',
                    CustomerNo: dm.customer.CustNum ? dm.customer.CustNum() : '',
                    CustomerName: dm.customer.CustName ? dm.customer.CustName() : '',
                    ProvBranchNOEHR: dm.machine.ProvBranchNOEHR(),
                    TransNo: dmInstance.$TransNo || '',
                    BusinessTypeNo: dmInstance.$BusinessTypeNo || '',
                    CardNum: dm.customer.Card.CardNum(),
                    ScenariosData: dmInstance.$ScenariosData
                };
                return {
                    url: url,
                    contentType: 'application/json; charset=utf-8',
                    headers: header,
                    timeout: 90000,
                    type: 'post',
                    data: JSON.stringify(pars),
                    dataType: 'json',
                    async: false,
                    context: this
                };
            }
            function onRequestDone() {
                //do nothing
            }
            function onRequestFail(xmlhttp) {
                utility.error("request report error" + JSON.stringify(xmlhttp));
            }

            var requestOpt = createOpt();
            if (requestOpt)
                $.ajax(requestOpt).done(onRequestDone).fail(onRequestFail);
        };

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
                        viewModelId：询问对话框路径 此参数可以不传，默认值为null,不询问 根据 runningWf参数决定当前流程（销毁/压栈）
                                     如果不为null,根据返回值决定当前流程是否（销毁）
                                     注：询问对话框由应用维护(样式、提示内容)，返回值只要 True/False
                        onFinishing:function 类型，工作流结束前回调此方法 此参数可以不传，默认值为null,
                        transTitle:交易名称（用作导航边显示） 此参数可以不传 默认值为'',
                        IsProvFlag:是否分行场景，true:分行，false:全辖场景   此参数可以不传，默认为:false全辖场景
                                     
                */
                startFlow: function (flowId, parameter) {
                    var _parameter = {
                        inputs: {},
                        viewArea: cm.client.defaultArea,
                        runningWf: 'destory',
                        isBackground: false,
                        viewModelId: null,
                        onFinishing: null,
                        transTitle: '',
                        IsProvFlag: false,
                        isReport: false
                    };
                    $.extend(_parameter, parameter);

                    /*启动工作流方试
                       1、viewModelId==null
                          首先判断当前是否有正在运行工作流
                          false:直接启动工作流
                          true:根据runningWf参数，决定对当前工作流进行压栈或摧毁,如果摧毁失败，什么也不做，摧毁成功启动新工作流
                        2、viewModelId!=null
                          首先判断当前是否有正在运行工作流
                          false:直接启动工作流
                          true: 弹出viewModelId对话框，返回值只要 True/False
                                对话框返回true:对当前工作流进行摧毁,如果摧毁失败，什么也不做，摧毁成功启动新工作流
                                对话框返回false:什么也不做
                             
                    */

                    require(['jsRuntime/actionManager', 'jsRuntime/viewManager'], function (am, vm) {
                        var viewArea = _parameter.viewArea;
                        if (!_parameter.isBackground) {
                            //判断当前区域是否有已运行流程
                            var isCurrentRunWf = (wm.currentRunWfInstance != null)//(vm.CurrentViewInstance[viewArea] != null && vm.CurrentViewInstance[viewArea].wfInstanceID != null);

                            if (_parameter.viewModelId) {
                                if (isCurrentRunWf) {
                                    //询问
                                    if (flowId == 'logout')
                                        _parameter.viewArea = null;

                                    dialog.show(_parameter.viewModelId, null, _parameter.viewArea || 'default').then(function (rtn) {
                                        if (rtn) {
                                            var terminateWfInstanceID = wm.currentRunWfInstance.wfInstanceId;
                                            var currentWf = wm.currentRunWfInstance;
                                            if (wfjs.WorkflowInvoker.Instance[terminateWfInstanceID].Terminate()) {
                                                if (currentWf != null && currentWf.dfd != null)
                                                    currentWf.dfd.resolve();
                                                //添加等待
                                                if (flowId != 'logout')
                                                    am.global.showMaskLayer(viewArea, rm.global.message.waiteMessage());
                                                else
                                                    am.global.showMaskLayer('full', rm.global.message.waiteMessage());

                                                startWf(flowId, _parameter.inputs, _parameter.viewArea);
                                            }
                                            else {
                                                var errorMessge = rm.global.message.transTerminateFail();// + (new Date()).Format("yyyy/MM/dd HH:mm:ss");
                                                am.global.showMessage(errorMessge, rm.global.message.alertTitle(), [{ text: rm.global.message.messageYes(), value: "Yes" }], false, viewArea).done(function (data) {
                                                    //alert(data)
                                                });
                                            }
                                        }
                                    });
                                }
                                else {
                                    //添加等待
                                    if (flowId != 'logout')
                                        am.global.showMaskLayer(viewArea, rm.global.message.waiteMessage());
                                    else
                                        am.global.showMaskLayer('full', rm.global.message.waiteMessage());

                                    startWf(flowId, _parameter.inputs, _parameter.viewArea);
                                }
                            }
                            else {
                                if (isCurrentRunWf) {
                                    if (_parameter.runningWf == 'destory') {
                                        var terminateWfInstanceID = wm.currentRunWfInstance.wfInstanceId;
                                        var currentWf = wm.currentRunWfInstance;
                                        if (wfjs.WorkflowInvoker.Instance[terminateWfInstanceID].Terminate()) {
                                            if (currentWf != null && currentWf.dfd != null)
                                                currentWf.dfd.resolve();
                                            //添加等待
                                            if (flowId != 'logout')
                                                am.global.showMaskLayer(viewArea, rm.global.message.waiteMessage());
                                            else
                                                am.global.showMaskLayer('full', rm.global.message.waiteMessage());
                                            startWf(flowId, _parameter.inputs, _parameter.viewArea);
                                        }
                                        else {
                                            var errorMessge = rm.global.message.transTerminateFail();// + (new Date()).Format("yyyy/MM/dd HH:mm:ss");
                                            am.global.showMessage(errorMessge, rm.global.message.alertTitle(), [{ text: rm.global.message.messageYes(), value: "Yes" }], false, viewArea).done(function (data) {
                                                //alert(data)
                                            });
                                        }
                                    }
                                    else if (_parameter.runningWf == 'stack') {
                                        //当前流程进栈
                                        if (wm.currentRunWfInstance != null) {
                                            var part = { flowObj: wm.currentRunWfInstance }
                                            wm.pushFlow(part);
                                        }
                                        //添加等待
                                        am.global.showMaskLayer(viewArea, rm.global.message.waiteMessage());
                                        //启动新流程
                                        startWf(flowId, _parameter.inputs, _parameter.viewArea);
                                    }
                                }
                                else {
                                    //添加等待
                                    if (flowId != 'logout')
                                        am.global.showMaskLayer(viewArea, rm.global.message.waiteMessage());
                                    else
                                        am.global.showMaskLayer('full', rm.global.message.waiteMessage());
                                    startWf(flowId, _parameter.inputs, _parameter.viewArea);
                                }
                            }
                        }
                        else {
                            startWf(flowId, _parameter.inputs, _parameter.viewArea, true);
                        }
                    });

                    //isBackground 是否后台启动流程（不需要页面，无需改变当前运行流程实例）
                    function startWf(flowId, inputs, viewArea, isBackground) {
                        //进入新流程，取消原有定时
                        if (!_parameter.isBackground)
                            wm.cancelNodeTimeout();

                        if (!flowId || flowId == null || flowId == '') {
                            wm.log("when startflow,flowId can't be null");
                            return;
                        }

                        var flowChartPath = 'Scenarios/';
                        var resPath = 'Scenarios/';
                        if (!_parameter.IsProvFlag) {
                            flowChartPath += cm.client.defaultCenter + "/" + flowId + "/" + flowId;
                            resPath += cm.client.defaultCenter + "/" + flowId;
                        }
                        else {
                            flowChartPath += dm.machine.ProvPrefixNumEHR() + "/" + flowId + "/" + flowId;
                            resPath += dm.machine.ProvPrefixNumEHR() + "/" + flowId;
                        }

                        wm.log("FlowChart Path:" + flowChartPath);
                        getFlowChart(flowChartPath)
                            .then(function (chart) {
                                if ($.isFunction(chart))
                                    chart = chart();

                                var invokerInstance = wfjs.WorkflowInvoker.CreateActivity(chart);
                                buildStepInfo(invokerInstance);

                                var wfinstance = new wfInstance(flowId, invokerInstance.InstanceId, viewArea);
                                wfinstance.transTitle = _parameter.transTitle;
                                wm.instance[invokerInstance.InstanceId] = wfinstance;

                                if (isBackground == null || isBackground == false)
                                    isBackground = false;

                                if (!isBackground)
                                    wm.currentRunWfInstance = wfinstance;

                                //显示业务名称
                                if (dm.commonDisply != null)
                                    dm.commonDisply.transTitle(_parameter.transTitle);

                                wm.log("currentRunWf:(flowId,wfInstanceId)=>", flowId, invokerInstance.InstanceId);

                                var wfStartPar = {
                                    wf_StartTime: (new Date()).Format("yyyy/MM/dd HH:mm:ss"),//启动时间
                                    wf_EndTime: "",//结束时间
                                    wf_BizType: "",//业务类型
                                    wf_FlowId: flowId,//场景ID
                                    wf_Id: invokerInstance.InstanceId,//工作流实例id
                                };
                                dm.mergeValue(invokerInstance.InstanceId, wfStartPar)

                                rm.registerRes(resPath, invokerInstance.InstanceId).done(function () {
                                    invokerInstance
                                        .Inputs(inputs)
                                        .FlowchartSettings({ flowId: flowId })
                                        .Invoke(function (err, context) {
                                            if (err != null) {
                                                utility.log.error(err);
                                            }
                                            reportRequest(context);

                                            aggregator.trigger("workflow:end", invokerInstance.InstanceId);

                                            rm.unRegisterRes(invokerInstance.InstanceId);
                                            dm.unRegisterDm(invokerInstance.InstanceId);
                                            wm.unRegisterWm(invokerInstance.InstanceId);

                                            var InstanceIdFlg = (wm.currentRunWfInstance != null && wm.currentRunWfInstance.wfInstanceId == invokerInstance.InstanceId);
                                            //此判断是为保证中断流程不重置新启动流程所设置的当前运行实例（因为Invoke为异步）
                                            if (!isBackground && InstanceIdFlg) {
                                                wm.currentRunWfInstance = null;

                                                //重置业务名称
                                                if (_parameter.transTitle != null && _parameter.transTitle != "")
                                                {
                                                    if (dm.commonDisply != null)
                                                        dm.commonDisply.transTitle('');
                                                }
                                            }

                                            //执行回调方法
                                            if (_parameter.onFinishing != null && $.isFunction(_parameter.onFinishing)) {
                                                wm.log("WfEnd:Run onFinishing function");
                                                _parameter.onFinishing({});
                                            }
                                            wm.log("WfEnd:flowId：" + flowId + " wfinstanceid:" + invokerInstance.InstanceId);

                                            if (!isBackground && !(context.FlowchartSettings['__isTerminate__'] == true))
                                                wm.popFlow();
                                            context.ClearFlowchartSettings();
                                        });
                                }).fail(function (err) {
                                    wm.log("register resource error:" + JSON.stringify(err));
                                });
                            })
                        .fail(function (err) {
                            wm.log(err);
                        });
                    }
                },


                //正在运行流程ID
                //返回值：string类型，无运行流程返回空串
                runningWfFlowId: function () {
                    if (wm.currentRunWfInstance == null)
                        return null;
                    else
                        return wm.currentRunWfInstance.flowId;
                },
            },

            //流程压栈
            pushFlow: function (para) {
                try {
                    var _para = {
                        flowObj: "",//压栈对象，可取值（1、工作流flowId,string,类型。2、工作流实例对象，object类型
                        startPart: {},//工作流启运参数，参数内容同global下startFlow（parameter），此参数可为空
                    };
                    $.extend(_para, para);

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
                catch (ex) {
                    wm.log("pushFlow error:" + ex.message);
                }
            },

            //流程出栈
            popFlow: function () {
                try {
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
            }
        };
        return cached.workflowManager = wm;
    });