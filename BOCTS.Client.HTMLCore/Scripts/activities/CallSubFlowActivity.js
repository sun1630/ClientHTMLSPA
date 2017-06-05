define(['jquery', 'jsRuntime/utility', 'jsRuntime/resourceManager', 'jsRuntime/dataManager'], function ($, utility, rm, dm) {
    var getFlowchart = function (chartId) {
        return $.Deferred(function (dfd) {
            var charts = [chartId];
            require(charts, function (model) {
                dfd.resolve(model);
            }, function () {
                dfd.reject(arguments);
            })
        }).promise();
    }

    function cloneObj(obj) {
        if (Array.isArray(obj)) {
            return obj.slice();
        } else if (obj == null) {
            return obj;
        }
        else if (typeof obj === 'object') {
            var target = {};
            if (Object.assign)
                Object.assign(target, obj);
            else {
                for (var key in obj) {
                    target[key] = obj[key];
                }
            }
            return target;
        } else {
            return obj;
        }
    }
    function compareStrIgacase(str1, str2) {
        if (str1 == str2) return true;
        if (str1.toLowerCase() == str2.toLowerCase()) return true;
        else return false;
    }
    var act = function () {
        this.$inputs = "*";
        this.$outputs = "*";
        this.activityName = 'CallSubFlowActivity';
    }
    act.prototype.Execute = function (parentContext, parentDone) {
        var self = this;
        var opt = {
            ChartPath: 'common',
            SubChartName: ''
        };
        if (parentContext.FlowchartSettings.chartPaths == null) {
            parentContext.FlowchartSettings.chartPaths = [];
            var chartPaths = parentContext.FlowchartSettings.chartPaths;
            var startChartPath = parentContext.FlowchartSettings.flowChart;
            var paths = startChartPath.split('/');
            utility.log.trace("start chart path:", paths[1]);
            chartPaths.push(paths[1]);
        }
        //check path 
        var inputs = wfjs.GetInputsFromContextWithOption(parentContext, opt);
        var subFlowchartPath = inputs.ChartPath;
        if (subFlowchartPath.toLowerCase() == 'branch')
            subFlowchartPath = dm.machine.ProvPrefixNumEHR();
        var allowFolders = ["common"];
        switch (subFlowchartPath.toLowerCase()) {
            case "center":
                allowFolders.push("center");
                break;
            case "common":
                break;
            default:
                allowFolders.push(subFlowchartPath.toLowerCase());
                break;
        }

        if (inputs.SubChartName == undefined || inputs.SubChartName == null || inputs.SubChartName == '') {
            var error = new Error("SubFlowchart Name can't be null");
            utility.log(error);
        } else {
            var path = inputs.ChartPath;
            if (path.toLowerCase() === "branch") {
                path = dm.machine.ProvPrefixNumEHR();
            }
            //验证合法性
            if (allowFolders.indexOf(path.toLowerCase()) === -1) {
                var error = new Error("CallSubFlowActivity not allowed vist Floder:" + path);
                throw error;
            }
            parentContext.FlowchartSettings.chartPaths.push(path);

            var chartName = "Scenarios/" + path + "/" + inputs.SubChartName;
            var temp = chartName.split("/");
            var transNo = temp[temp.length - 1];
            getFlowchart(chartName + "/" + transNo)
                .then(function (chart) {
                    if (chart instanceof Function)
                        chart = chart();
                    var inputs = wfjs._ObjectHelper.CombineObjects(parentContext.Inputs, parentContext.Global);
                    chart.instanceId = self.__instanceId__;
                    // clone parentInputs to chart.$global when chart.$global contains parentInputs key;
                    for (var item in chart.$global) {
                        if (item in inputs) {
                            chart.$global[item] = cloneObj(inputs[item]);
                        }
                    }
                    var d = wfjs.WorkflowInvoker.CreateActivity(chart);
                    //set Current workflow instanceId.
                    var originCurrentInstanceId = parentContext.CurrentInstanceId;
                    parentContext.CurrentInstanceId = d.InstanceId;
                    rm.registerRes(chartName, parentContext.InstanceId).done(function () {
                        //set currentFlowId,and delete it when invoke callback
                        parentContext.FlowchartSettings.currentFlowId = transNo;
                        d.Inputs(inputs)
                         .Extensions(parentContext.Extensions)
                         .SetFlowChartSettings(parentContext.FlowchartSettings)
                         .Invoke(function (err, childContext) {
                             delete parentContext.FlowchartSettings.currentFlowId;

                             if (err != null) {
                                 utility.log(err);
                                 throw err;
                             }
                             else {
                                 var chartPaths = parentContext.FlowchartSettings.chartPaths;
                                 if (chartPaths == null) {
                                     throw new Error("flowchartSetting.ChartPaths can't be null");
                                 }
                                 if (compareStrIgacase(chartPaths[chartPaths.length - 1], path))
                                     chartPaths.pop();

                                 //copy inner context output to out context output;
                                 wfjs._ObjectHelper.CopyProperties(childContext.Global, parentContext.Global);
                                 //reconver the CurrentInstanceId
                                 parentContext.CurrentInstanceId = originCurrentInstanceId;
                                 parentDone();
                             }
                         });
                    });
                }).fail(function (err) {
                    utility.log.error(err);
                })
        }
    }
    act.prototype.canBeTerminate = function () {
        return true;
    }
    return act;
})