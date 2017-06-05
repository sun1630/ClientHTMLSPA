var wfjs;
(function (wfjs) {
    function Activity(options) {
        return options;
    }
    wfjs.Activity = Activity;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Assign(options) {
        options = options || {};
        return wfjs.Execute({
            activityName: 'AssignActivity',
            canBeTerminate: function () { return true; },
            execute: function (context) {
                for (var key in (options.values || {})) {
                    if (key.indexOf(".") > -1) {
                        //var varKey = key.split(".");
                        var keys = key.split(".");
                        if (keys[0] !== "this")
                            keys.unshift("this");
                        var outputKey = keys[1];
                        var evalResult = wfjs._EvalHelper.Eval(context.Inputs, options.values[key]);
                        var result = keys.reduce(function (pre, value, index) {
                            if (pre == "this")
                                return wfjs._EvalHelper.Eval(context.Inputs, pre + "." + value);
                            else {
                                if (pre && value) {
                                    if (index == keys.length - 1) {
                                        pre[value] = evalResult;
                                    }
                                    else {
                                        if (!pre[value])
                                            pre[value] = {};
                                        return pre[value];
                                    }
                                }
                            }
                        });
                    }
                    else
                        context.Outputs[key] = wfjs._EvalHelper.Eval(context.Inputs, options.values[key]);
                }
            },
            next: wfjs._ObjectHelper.GetValue(options, 'next')
        });
    }
    wfjs.Assign = Assign;
    ;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Decision(options) {
        options = options || {};
        return wfjs.Execute({
            activityName: 'DecisionActivity',
            canBeTerminate: function () { return true; },
            execute: function (context) {
                var result = wfjs._EvalHelper.Eval(context.Inputs, options.condition);
                context.Outputs['$next'] = result ? options.true : options.false;
                //copy var from inputs to outputs.
                context.Outputs = wfjs._ObjectHelper.CombineObjects(context.Inputs, context.Outputs);
            },
            next: wfjs._ObjectHelper.GetValue(options, 'next')
        });
    }
    wfjs.Decision = Decision;
    ;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Execute(options) {
        options = options || {};
        return wfjs.Activity({
            $inputs: { '*': '*' },
            $outputs: { '*': '*' },
            activity: new ExecuteActivity(options),
            next: options.next
        });
    }
    wfjs.Execute = Execute;
    ;
    /**
     * AssignActivity Assigns values to Outputs.
     */
    var ExecuteActivity = (function () {
        function ExecuteActivity(options) {
            this.$inputs = ['*'];
            this.$outputs = ['*'];
            this._options = options || {};
            this.activityName = options.activityName;
        }
        ExecuteActivity.prototype.canBeTerminate = function () {
            return this._options.canBeTerminate();
        };
        ExecuteActivity.prototype.Execute = function (context, done) {
            if (wfjs._Specifications.IsExecuteAsync.IsSatisfiedBy(this._options.execute)) {
                this._options.execute(context, done);
            }
            else {
                this._options.execute(context);
                if (done != null) {
                    done();
                }
            }
        };
        return ExecuteActivity;
    }());
    wfjs.ExecuteActivity = ExecuteActivity;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Flowchart(options, state) {
        return new FlowchartActivity(options);
    }
    wfjs.Flowchart = Flowchart;
    ;
    var FlowchartActivity = (function () {
        function FlowchartActivity(flowchart, state) {
            this.State = wfjs.WorkflowState.None;
            this.logger = null;
            this.activityName = "FlowchartActivity";
            this.stepId = 0;
            this.instanceId = '';
            flowchart = flowchart || {};
            flowchart.activities = flowchart.activities || {};
            this.$global = flowchart.$global || {};
            this.$inputs = flowchart.$inputs || [];
            this.$outputs = flowchart.$outputs || [];
            this._activities = flowchart.activities || {};
            this._extensions = flowchart.$extensions || {};
            this._stateData = state || null;
            this.steps = flowchart.steps || [];
            this.instanceId = flowchart.instanceId || '';
        }
        FlowchartActivity.prototype.canBeTerminate = function () { return true; };
        ;
        /**
         * Execution point that will be entered via WorkflowInvoker.
         */
        FlowchartActivity.prototype.Execute = function (context, done) {
            var _this = this;
            this.State = context.State = wfjs.WorkflowState.Running;
            var firstActivityName = wfjs._bll.Workflow.GetStartActivityName(this._activities, this._stateData);
            var activity = this._activities[firstActivityName];
            if (activity == null) {
                this._log(wfjs.LogType.None, 'Workflow Complete');
                this.State = context.State = wfjs.WorkflowState.Complete;
                return done();
            }
            if (this._stateData != null) {
                this._log(wfjs.LogType.None, 'Workflow Resumed');
            }
            this._ExecuteNextActivity(firstActivityName, context, activity, function (err) {
                if (err != null) {
                    context.State = wfjs.WorkflowState.Fault;
                }
                else {
                    context.State = _this.State == wfjs.WorkflowState.Running ? wfjs.WorkflowState.Complete : _this.State;
                }
                switch (context.State) {
                    case wfjs.WorkflowState.Complete:
                        _this._log(wfjs.LogType.None, 'Workflow Complete');
                        break;
                    case wfjs.WorkflowState.Fault:
                        _this._log(wfjs.LogType.None, 'Workflow Faulted');
                        break;
                    case wfjs.WorkflowState.Paused:
                        _this._log(wfjs.LogType.None, 'Workflow Paused');
                        break;
                    case wfjs.WorkflowState.Running:
                        _this._log(wfjs.LogType.None, 'Workflow Running');
                        break;
                }
                done(err);
            });
        };
        /**
         * _ExecuteNextActivity Execution loop that executes every Activity.
         */
        FlowchartActivity.prototype._ExecuteNextActivity = function (activityName, context, activity, done) {
            var _this = this;
            if (activity == null) {
                return done();
            }
            var innerContext = wfjs._bll.Workflow.CreateChildActivityContext(context);
            //check the 'activity' is null
            if (wfjs._Specifications.IsWorkflowActivity.IsSatisfiedBy(activity)) {
                //创建activityInstanceId
                if (context.FlowchartSettings["__isBack__"]) {
                    innerContext = context.GetContextFromHistory(activityName);
                }
                else {
                    this._setActivityInstanceIdToContext(innerContext);
                }
                this._ExecuteActivity(activityName, innerContext, activity, function (err) {
                    if (err != null) {
                        _this.State = wfjs.WorkflowState.Fault;
                        return done(err);
                    }
                    //查看jumpto是否有值
                    var nextActivityName = wfjs._bll.Workflow.GetNextActivityName(activity, innerContext, _this._activities);
                    var nextActivity = _this._activities[nextActivityName] || null;
                    if (wfjs._Specifications.IsPaused.IsSatisfiedBy(innerContext)) {
                        context.StateData = wfjs._bll.Workflow.GetPauseState(context, nextActivityName);
                        _this.State = innerContext.State;
                        return done();
                    }
                    _this._ExecuteNextActivity(nextActivityName, innerContext, nextActivity, function (err) {
                        //_ObjectHelper.CopyProperties(innerContext.Outputs, context.Outputs);
                        wfjs._ObjectHelper.CopyProperties(innerContext.Global, context.Global);
                        if (wfjs._Specifications.IsPaused.IsSatisfiedBy(innerContext)) {
                            context.StateData = innerContext.StateData;
                        }
                        done(err);
                    });
                });
            }
            else {
                this._log(wfjs.LogType.Error, activityName + ': ' + wfjs.Resources.Error_Activity_Invalid);
                done(new Error(wfjs.Resources.Error_Activity_Invalid));
            }
        };
        /**
         * _ExecuteActivity Calls WorkflowInvoker to execute the Activity.
         */
        FlowchartActivity.prototype._ExecuteActivity = function (activityName, context, activity, done) {
            var _this = this;
            var inputs = wfjs._bll.Workflow.GetInputs(context, activity.$inputs);
            /*1.先将activityInstanceId设置到context，并将context保存到历史中，以方便回退时调用。
            * 2.将context保存到历史。
            * 3.将context中的activityInstanceId赋值给activity，因为context的其它值不会通过invoker传递过去。
            */
            context.SetContextHistory(activityName, context);
            context.CurrentActivityName = activityName; //设置当前运行的activityName
            this._setActivityInstanceIdToActivity(activity, context);
            wfjs.WorkflowInvoker
                .CreateActivity(activity.activity)
                .Extensions(context.Extensions)
                .Inputs(inputs)
                .SetFlowChartSettings(context.FlowchartSettings)
                .Globals(context.Global)
                .Invoke(function (err, innerContext) {
                wfjs._bll.Workflow.CopyInnerContextToOuterContext(innerContext, context, activity);
                _this._log(wfjs.LogType.None, activityName, wfjs._ObjectHelper.TrimObject({
                    inputs: inputs,
                    outputs: wfjs._ObjectHelper.ShallowClone(wfjs._ObjectHelper.GetValue(innerContext, 'Outputs')),
                    err: err
                }));
                done(err);
            });
        };
        /**
         * Helper method for logging
         */
        FlowchartActivity.prototype._log = function (logType, message) {
            var optionalParams = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                optionalParams[_i - 2] = arguments[_i];
            }
            var args = [this.logger, logType, 'wfjs.Workflow:']
                .concat([message])
                .concat(optionalParams || []);
            wfjs._bll.Logger.Log.apply(wfjs._bll.Logger, args);
        };
        FlowchartActivity.prototype._setActivityInstanceIdToActivity = function (activity, context) {
            activity.activity['__instanceId__'] = context['__activityInstanceId__'];
        };
        FlowchartActivity.prototype._setActivityInstanceIdToContext = function (context) {
            if (this.instanceId == '') {
                context['__activityInstanceId__'] = ++this.stepId;
            }
            else {
                context['__activityInstanceId__'] = this.instanceId + '.' + ++this.stepId;
            }
        };
        return FlowchartActivity;
    }());
    wfjs.FlowchartActivity = FlowchartActivity;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Foreach(options) {
        options = options || {};
        return wfjs.Activity({
            $inputs: { '*': '*' },
            $outputs: { '*': '*' },
            activity: new ForeachActivity(options),
            next: options.next
        });
    }
    wfjs.Foreach = Foreach;
    ;
    var ForeachActivity = (function () {
        function ForeachActivity(options) {
            this.$inputs = ['*'];
            this.$outputs = ['*'];
            this.activityName = "ForeachActivity";
            this._options = options || {};
        }
        ForeachActivity.prototype.canBeTerminate = function () {
            return true;
        };
        ForeachActivity.prototype.Terminate = function () {
            return true;
        };
        ForeachActivity.prototype.Execute = function (context, done) {
            var activityId = this['__instanceId__'];
            var chart = this._options.Body;
            var items = wfjs._EvalHelper.Eval(context.Inputs, this._options.Items);
            this.InvokeChart(items, this._options.Item, 0, chart, context, activityId, function () {
                done();
            });
        };
        ForeachActivity.prototype.copySourceGlobalToTarget = function (source, target) {
            for (var i in target) {
                if (i in source)
                    target[i] = this.cloneObj(source[i]);
            }
        };
        ForeachActivity.prototype.cloneObj = function (obj) {
            if (typeof obj === 'object') {
                return wfjs._ObjectHelper.ShallowClone(obj);
            }
            else {
                return obj;
            }
        };
        ForeachActivity.prototype.getItemByIndex = function (items, index) {
            if (!items)
                return null;
            if (!Array.isArray(items))
                throw new Error("items must be an array");
            if (items.length <= index)
                return null;
            if (index < 0)
                return null;
            return items[index];
        };
        ForeachActivity.prototype.InvokeChart = function (items, itemName, index, chart, context, activityId, callback) {
            var self = this;
            var item = this.getItemByIndex(items, index);
            if (!item) {
                callback();
            }
            else {
                chart.instanceId = activityId + '.' + (index + 1);
                var inputs = {};
                inputs[itemName] = item;
                if (index != 0) {
                    context.Inputs = wfjs._ObjectHelper.CombineObjects(context.Inputs, context.Global);
                }
                inputs = wfjs._ObjectHelper.CombineObjects(inputs, context.Inputs);
                //copy inputs value to chart.$global value with same key
                this.copySourceGlobalToTarget(inputs, chart.$global);
                wfjs.WorkflowInvoker.CreateActivity(chart)
                    .Inputs(inputs)
                    .Extensions(context.Extensions)
                    .SetFlowChartSettings(context.FlowchartSettings)
                    .Invoke(function (err, childContext) {
                    if (err != null) {
                        throw err;
                    }
                    else {
                        index++;
                        self.copySourceGlobalToTarget(childContext.Global, context.Global);
                        self.InvokeChart(items, itemName, index, chart, context, activityId, function () {
                            callback();
                        });
                    }
                });
            }
        };
        return ForeachActivity;
    }());
    wfjs.ForeachActivity = ForeachActivity;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function ParallelForeach(options) {
        options = options || {};
        return wfjs.Activity({
            $inputs: { '*': '*' },
            $outputs: { '*': '*' },
            activity: new ParallelForeachActivity(options),
            next: options.next
        });
    }
    wfjs.ParallelForeach = ParallelForeach;
    var ParallelForeachActivity = (function () {
        function ParallelForeachActivity(options) {
            this.$inputs = ['*'];
            this.$outputs = ['*'];
            this.activityName = "ParallelForeachActivity";
            this._options = options || {};
        }
        ParallelForeachActivity.prototype.canBeTerminate = function () {
            return true;
        };
        ParallelForeachActivity.prototype.Terminate = function () {
            return true;
        };
        ParallelForeachActivity.prototype.copySourceGlobalToTarget = function (source, target) {
            for (var i in target) {
                if (i in source)
                    target[i] = this.cloneObj(source[i]);
            }
        };
        ParallelForeachActivity.prototype.cloneObj = function (obj) {
            if (typeof obj === 'object') {
                return wfjs._ObjectHelper.ShallowClone(obj);
            }
            else {
                return obj;
            }
        };
        ParallelForeachActivity.prototype.Execute = function (context, done) {
            var activityId = this['__instanceId__'];
            var chart = this._options.Body;
            var errorList = [];
            var self = this;
            var getItemsContext = wfjs._ObjectHelper.CombineObjects(context.Inputs, context.Global);
            var items = wfjs._EvalHelper.Eval(getItemsContext, this._options.Items);
            if (!Array.isArray(items))
                done(new Error("ParalleForeach Items must be an Array"));
            else {
                items.forEach(function (value, index) {
                    chart["instanceId"] = activityId + '.' + (index + 1);
                    var inputs = {};
                    inputs[self._options.Item] = value;
                    inputs = wfjs._ObjectHelper.CombineObjects(inputs, context.Global);
                    inputs = wfjs._ObjectHelper.CombineObjects(inputs, context.Inputs);
                    self.copySourceGlobalToTarget(inputs, chart.$global);
                    wfjs.WorkflowInvoker.CreateActivity(chart)
                        .Inputs(inputs)
                        .Extensions(context.Extensions)
                        .SetFlowChartSettings(context.FlowchartSettings)
                        .Invoke(function (err, childContext) {
                        if (err != null) {
                            errorList.push(err);
                        }
                        else {
                            self.copySourceGlobalToTarget(childContext.Global, context.Global);
                        }
                    });
                });
                var checkCompete = function () {
                    setTimeout(function () {
                        if (!eval(self._options.CompleteCondition)) {
                            checkCompete();
                        }
                        else {
                            if (errorList.length == 0)
                                done();
                            else {
                                done(new Error(errorList.join("\n")));
                            }
                        }
                    }, 1000);
                };
                checkCompete();
            }
        };
        return ParallelForeachActivity;
    }());
    wfjs.ParallelForeachActivity = ParallelForeachActivity;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Parallel(options) {
        options = options || {};
        return wfjs.Activity({
            $inputs: { '*': '*' },
            $outputs: { '*': '*' },
            activity: new ParallelActivity(options),
            next: options.next
        });
    }
    wfjs.Parallel = Parallel;
    var ParallelActivity = (function () {
        function ParallelActivity(options) {
            this.$inputs = ['*'];
            this.$outputs = ['*'];
            this._options = options || {};
            this.activityName = "ParallelActivity";
        }
        ParallelActivity.prototype.canBeTerminate = function () {
            return true;
        };
        ParallelActivity.prototype.Terminate = function () {
            return true;
        };
        ParallelActivity.prototype.copySourceGlobalToTarget = function (source, target) {
            for (var i in target) {
                if (i in source)
                    target[i] = this.cloneObj(source[i]);
            }
        };
        ParallelActivity.prototype.cloneObj = function (obj) {
            if (typeof obj === 'object') {
                return wfjs._ObjectHelper.ShallowClone(obj);
            }
            else {
                return obj;
            }
        };
        ParallelActivity.prototype.Execute = function (context, done) {
            var self = this;
            var activityId = this['__instanceId__'];
            var inputs = wfjs._ObjectHelper.CombineObjects(context.Inputs, context.Global);
            this._options.Parallels.forEach(function (chart, index) {
                self.copySourceGlobalToTarget(inputs, chart.$global);
                chart.instanceId = activityId + '.' + (index + 1);
                wfjs.WorkflowInvoker.CreateActivity(chart)
                    .Inputs(inputs)
                    .Extensions(context.Extensions)
                    .SetFlowChartSettings(context.FlowchartSettings)
                    .Invoke(function (err, parallelContext) {
                    if (err != null) {
                        throw err;
                    }
                    else {
                        self.copySourceGlobalToTarget(parallelContext.Global, context.Global);
                    }
                });
            });
            var checkCompete = function () {
                setTimeout(function () {
                    if (!wfjs._EvalHelper.Eval(inputs, self._options.CompleteCondition)) {
                        //if (!eval(self._options.CompleteCondition)) {
                        checkCompete();
                    }
                    else {
                        done();
                    }
                }, 1000);
            };
            checkCompete();
        };
        return ParallelActivity;
    }());
    wfjs.ParallelActivity = ParallelActivity;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Pause(options) {
        options = options || {};
        return wfjs.Execute({
            activityName: "PauseActivity",
            canBeTerminate: function () { return true; },
            execute: function (context) {
                context.State = wfjs.WorkflowState.Paused;
            },
            next: wfjs._ObjectHelper.GetValue(options, 'next')
        });
    }
    wfjs.Pause = Pause;
    ;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function Switch(options) {
        options = options || {};
        return wfjs.Execute({
            activityName: 'SwitchActivity',
            canBeTerminate: function () { return true; },
            execute: function (context) {
                var switchResult = wfjs._EvalHelper.Eval(context.Inputs, options.switchExp);
                var flag = false;
                wfjs._ObjectHelper.GetKeys(options.cases).forEach(function (value, index, array) {
                    if (switchResult == value) {
                        flag = true;
                        context.Outputs['$next'] = options.cases[value];
                    }
                });
                if (!flag) {
                    context.Outputs['$next'] = options.defaultCase;
                }
            },
            next: wfjs._ObjectHelper.GetValue(options, 'next')
        });
    }
    wfjs.Switch = Switch;
    ;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    var _bll;
    (function (_bll) {
        var Logger = (function () {
            function Logger() {
            }
            /**
             * _log Sends message and optionalParams to the logger.
             */
            Logger.Log = function (logger, logType, message) {
                var optionalParams = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    optionalParams[_i - 3] = arguments[_i];
                }
                var args = [message].concat(optionalParams || []);
                if (this.externalLog) {
                    this.externalLog.apply(null, args);
                }
                else {
                    var log = Logger._getLogFunction(logger, logType);
                    if (log != null) {
                        log.apply(logger, args);
                    }
                }
            };
            /**
             * _getLogFunction returns the log function for the LogType. Falls back to 'log' if others aren't available.
             */
            Logger._getLogFunction = function (logger, logType) {
                var log = wfjs._ObjectHelper.GetValue(logger, 'log');
                switch (logType) {
                    case wfjs.LogType.Debug: return wfjs._ObjectHelper.GetValue(logger, 'debug') || log;
                    case wfjs.LogType.Info: return wfjs._ObjectHelper.GetValue(logger, 'info') || log;
                    case wfjs.LogType.Warn: return wfjs._ObjectHelper.GetValue(logger, 'warn') || log;
                    case wfjs.LogType.Error: return wfjs._ObjectHelper.GetValue(logger, 'error') || log;
                    default: return log;
                }
            };
            Logger.externalLog = null;
            return Logger;
        }());
        _bll.Logger = Logger;
    })(_bll = wfjs._bll || (wfjs._bll = {}));
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function setLogger(logger) {
        wfjs._bll.Logger.externalLog = logger;
    }
    wfjs.setLogger = setLogger;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    var _bll;
    (function (_bll) {
        var Workflow = (function () {
            function Workflow() {
            }
            /**
              * GetStartActivityName Gets the name of the to be executed first.
              */
            Workflow.GetStartActivityName = function (activities, state) {
                var hasStateNext = state != null && state.n != null;
                var activityName = hasStateNext ? state.n : Object.keys(activities)[0];
                return activities[activityName] != null ? activityName : null;
            };
            /**
             * GetNextActivityName returns the name of the next Activity or null.
             */
            Workflow.GetNextActivityName = function (activity, context, activities) {
                if (activity == null) {
                    return null;
                }
                var isTerminate = context.FlowchartSettings['__isTerminate__'];
                if (isTerminate)
                    return null;
                var jumpto;
                //the jumtto sets on workflowinovker jumto
                var jt = context.FlowchartSettings['__jumpto__'];
                if (jt) {
                    jumpto = this.getJumptoActivityName(context);
                    context.FlowchartSettings["__isBack__"] = true;
                }
                else
                    delete context.FlowchartSettings["__isBack__"];
                // the Activity sets $next
                var $next = jumpto || wfjs._ObjectHelper.GetValue(context, 'Outputs', '$next');
                // 'next' value on the Activity.
                var nextActivityName = $next || wfjs._ObjectHelper.GetValue(activity, 'next');
                return activities[nextActivityName] != null ? nextActivityName : null;
            };
            Workflow.getJumptoActivityName = function (context) {
                var activityName;
                //if jumpto is number
                var jumpto = context.FlowchartSettings["__jumpto__"];
                if (!isNaN(jumpto)) {
                    jumpto = new Number(jumpto);
                    var history_1 = context.FlowchartSettings["__cxHistory__"];
                    var historykeys = Object.keys(history_1);
                    if (historykeys.length < Math.abs(jumpto))
                        throw new Error("back error: back step more than complete step");
                    var currentIndex = historykeys.indexOf(context.CurrentActivityName);
                    activityName = historykeys[currentIndex + jumpto];
                }
                else {
                    activityName = jumpto;
                }
                //清空jumto信息
                delete context.FlowchartSettings['__jumpto__'];
                return activityName;
            };
            /**
             * GetInputs Returns a collection of input values.
             */
            Workflow.GetInputs = function (context, inputs) {
                var value = {};
                //var allValues: Dictionary<any> = _ObjectHelper.CombineObjects(context.Inputs, context.Outputs);
                var allValues = wfjs._ObjectHelper.CombineObjects(context.Inputs, context.Global);
                //check inputs is '*'
                if (wfjs._Specifications.IsWildcardDictionary.IsSatisfiedBy(inputs)) {
                    //add by wangmj 2016/4/29 
                    //fixed: when '*':'*' in inputs,allValues contains inputs in executeActivity.
                    var inputsClone = {};
                    for (var key in inputs) {
                        if (key != '*')
                            inputsClone[key] = wfjs._EvalHelper.Eval(allValues, inputs[key]);
                    }
                    allValues = wfjs._ObjectHelper.CombineObjects(allValues, inputsClone);
                    return allValues;
                }
                for (var key in inputs) {
                    value[key] = wfjs._EvalHelper.Eval(allValues, inputs[key]);
                }
                return value;
            };
            /**
             * GetOutputs Returns a collection out remapped outputs
             * Copy outputs to context.Global  wangmj 2016/05/07
             */
            Workflow.GetOutputs = function (context, outputs) {
                outputs = outputs || {};
                var value = {};
                if (wfjs._Specifications.IsWildcardDictionary.IsSatisfiedBy(outputs)) {
                    return wfjs._ObjectHelper.ShallowClone(context.Outputs);
                }
                for (var key in outputs) {
                    var v = outputs[key];
                    value[v] = context.Outputs[key];
                }
                return value;
            };
            /**
             * 将outputs更新到Global中
             * @param context 上下文
             */
            Workflow.UpdateOuputsToGlobal = function (context, outputs) {
                outputs = outputs || {};
                if (wfjs._Specifications.IsWildcardDictionary.IsSatisfiedBy(outputs)) {
                    this.CopyExistProperties(context.Global, context.Outputs);
                }
                else {
                    //outputs: $outputs:{result:'data'}
                    //global: data:''
                    var globalKeys = Object.keys(context.Global);
                    for (var key in outputs) {
                        var v = outputs[key];
                        if (globalKeys.indexOf(v) > -1) {
                            context.Global[v] = context.Outputs[key];
                        }
                    }
                }
            };
            /**
             * 将目标数据中存在的属性，从源数据拷贝到目标数据 wangmj 2016/05/07
             * @param target 拷贝的目标数据
             * @param source 拷贝的源数据
             */
            Workflow.CopyExistProperties = function (target, source) {
                var targetKeys = wfjs._ObjectHelper.GetKeys(target);
                for (var key in source) {
                    if (targetKeys.indexOf(key) > -1) {
                        target[key] = source[key];
                    }
                }
            };
            /**
             * CreateContext Creates a new Context for the Activity.
             */
            Workflow.CreateContext = function (activity, inputs, state, extensions, global, settings, callback) {
                if (state != null) {
                    return callback(null, new wfjs.ActivityContext({
                        Extensions: extensions,
                        Inputs: wfjs._ObjectHelper.CombineObjects(state.i, inputs) || {},
                        Outputs: wfjs._ObjectHelper.ShallowClone(state.o) || {},
                        Global: wfjs._ObjectHelper.ShallowClone(global) || {},
                        FlowchartSettings: settings || {},
                        CurrentActivity: activity
                    }));
                }
                Workflow.GetValueDictionary(activity.$inputs, inputs, 'input', function (err, values) {
                    var context = err != null ? null
                        : new wfjs.ActivityContext({
                            Extensions: extensions,
                            Inputs: values,
                            Outputs: (state || {}).o || {},
                            Global: global,
                            FlowchartSettings: settings || {},
                            CurrentActivity: activity
                        });
                    return callback(err, context);
                });
            };
            /**
             * GetValueDictionary Returns a Dictionary<any> from 'values' that have matching 'keys'.
             */
            Workflow.GetValueDictionary = function (keys, values, valueType, callback) {
                var result = {};
                var key;
                var error = null;
                if (wfjs._Specifications.IsWildcardArray.IsSatisfiedBy(keys)) {
                    return callback(null, wfjs._ObjectHelper.ShallowClone(values));
                }
                (keys || []).forEach(function (key) {
                    if (values != null && values[key] !== undefined) {
                        result[key] = values[key];
                    }
                    else if (error == null) {
                        error = new Error(wfjs.Resources.Error_Activity_Argument_Null
                            .replace(/\{0}/g, valueType)
                            .replace(/\{1}/g, key));
                    }
                });
                callback(error, result);
            };
            /**
             * CreateChildActivityContext Returns a new context for inner activities.
             */
            Workflow.CreateChildActivityContext = function (context) {
                return context == null ? null :
                    new wfjs.ActivityContext({
                        Extensions: wfjs._ObjectHelper.ShallowClone(context.Extensions),
                        Inputs: wfjs._ObjectHelper.CombineObjects(context.Inputs, context.Outputs),
                        Outputs: {},
                        Global: wfjs._ObjectHelper.ShallowClone(context.Global),
                        FlowchartSettings: context.FlowchartSettings,
                        CurrentActivity: null
                    });
            };
            /**
             * CopyInnerContextToOuterContext Copies the outputs of innerContext to the outerContext.
             */
            Workflow.CopyInnerContextToOuterContext = function (innerContext, outerContext, activity) {
                if (innerContext == null || outerContext == null) {
                    return;
                }
                /*****输出时不再输出到下一个activity，只输出到global中，与服务器端保持一致*******/
                //var outputs = _bll.Workflow.GetOutputs(innerContext, activity.$outputs);
                //_ObjectHelper.CopyProperties(outputs, outerContext.Outputs);
                _bll.Workflow.Copy$nextToOuputs(innerContext, outerContext);
                _bll.Workflow.UpdateOuputsToGlobal(innerContext, activity.$outputs);
                wfjs._ObjectHelper.CopyProperties(innerContext.Global, outerContext.Global);
                if (innerContext.State != null) {
                    outerContext.State = innerContext.State;
                }
            };
            /**
             * Copy $next from innerContext to outerContext
             * @param innerContext innerContext
             * @param outerContext outerContext
             */
            Workflow.Copy$nextToOuputs = function (innerContext, outerContext) {
                if (innerContext.Outputs['$next']) {
                    outerContext.Outputs['$next'] = innerContext.Outputs['$next'];
                }
            };
            /**
             * GetPauseState Returns an IPauseState from the ActivityContext and nextActivityName.
             */
            Workflow.GetPauseState = function (context, nextActivityName) {
                return {
                    i: wfjs._ObjectHelper.ShallowClone(wfjs._ObjectHelper.GetValue(context, 'Inputs')),
                    o: wfjs._ObjectHelper.ShallowClone(wfjs._ObjectHelper.GetValue(context, 'Outputs')),
                    n: nextActivityName
                };
            };
            return Workflow;
        }());
        _bll.Workflow = Workflow;
    })(_bll = wfjs._bll || (wfjs._bll = {}));
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    function onActivityChange(callback) {
        if (typeof callback != 'function') {
            throw new Error("expect callback is function ");
        }
        else {
            EventsManager.addListener('onActivityChange', callback);
        }
    }
    wfjs.onActivityChange = onActivityChange;
    function triggerEvent(key) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var listeners = EventsManager.getListener(key);
        if (listeners && listeners.length > 0) {
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].apply(null, args);
            }
        }
    }
    wfjs.triggerEvent = triggerEvent;
    var EventsManager = (function () {
        function EventsManager() {
        }
        EventsManager.addListener = function (key, callback) {
            if (!this._listeners[key]) {
                this._listeners[key] = [];
            }
            this._listeners[key].push(callback);
            ;
        };
        EventsManager.getListener = function (key) {
            return this._listeners[key];
        };
        EventsManager._listeners = {};
        return EventsManager;
    }());
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    /*
    *get value from context.Inputs with opt.keys.
    */
    function GetInputsFromContextWithOption(context, opt) {
        var result = {};
        wfjs._ObjectHelper.GetKeys(opt).forEach(function (key) {
            result[key] = context.Inputs[key] || opt[key];
        });
        return result;
    }
    wfjs.GetInputsFromContextWithOption = GetInputsFromContextWithOption;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    var _EvalHelper = (function () {
        function _EvalHelper() {
        }
        _EvalHelper.Eval = function (thisArg, code) {
            var contextEval = function () {
                return eval(code);
            };
            return contextEval.call(thisArg);
        };
        return _EvalHelper;
    }());
    wfjs._EvalHelper = _EvalHelper;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var _FunctionHelper = (function () {
        function _FunctionHelper() {
        }
        _FunctionHelper.ParameterCount = function (fn) {
            return _FunctionHelper.FormalParameterList(fn).length;
        };
        /**
         * FormalParameterList returns a string array of parameter names
         */
        _FunctionHelper.FormalParameterList = function (fn) {
            // code from: http://stackoverflow.com/questions/6921588/is-it-possible-to-reflect-the-arguments-of-a-javascript-function
            var fnText, argDecl;
            var args = [];
            fnText = fn.toString().replace(STRIP_COMMENTS, '');
            argDecl = fnText.match(FN_ARGS);
            var r = argDecl[1].split(FN_ARG_SPLIT);
            for (var a in r) {
                var arg = r[a];
                arg.replace(FN_ARG, function (all, underscore, name) {
                    args.push(name);
                });
            }
            return args;
        };
        return _FunctionHelper;
    }());
    wfjs._FunctionHelper = _FunctionHelper;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    "use strict";
    var _ObjectHelper = (function () {
        function _ObjectHelper() {
        }
        /**
         * CopyProperties Copies properties source to the destination.
         */
        _ObjectHelper.CopyProperties = function (source, destination) {
            if (source == null || destination == null) {
                return;
            }
            for (var key in source) {
                destination[key] = source[key];
            }
        };
        /**
         * ToKeyValueArray Returns an array of KeyValuePair
         */
        _ObjectHelper.ToKeyValueArray = function (obj) {
            return _ObjectHelper.GetKeys(obj)
                .map(function (key) { return new wfjs.KeyValuePair(key, obj[key]); });
        };
        /**
         * GetKeys Returns an array of keys on the object.
         */
        _ObjectHelper.GetKeys = function (obj) {
            var keys = [];
            obj = obj || {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
        /**
         * GetValue recursive method to safely get the value of an object. to get the value of obj.point.x you would call
         *     it like this: GetValue(obj, 'point', 'x');
         *     If obj, point or x are null, null will be returned.
         */
        _ObjectHelper.GetValue = function (obj) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            return (params || [])
                .reduce(function (prev, cur) { return prev == null ? prev : prev[cur]; }, obj);
        };
        /**
         * ShallowClone Returns a shallow clone of an Array or object.
         */
        _ObjectHelper.ShallowClone = function (obj) {
            if (obj == null) {
                return null;
            }
            return wfjs._Specifications.IsArray.IsSatisfiedBy(obj)
                ? this.ShallowCloneArray(obj)
                : this.ShallowCloneObject(obj);
        };
        /**
         * CombineObjects returns a new object with obj1 and obj2 combined.
         */
        _ObjectHelper.CombineObjects = function (obj1, obj2) {
            var clone = {};
            _ObjectHelper.CopyProperties(obj1, clone);
            _ObjectHelper.CopyProperties(obj2, clone);
            return clone;
        };
        /**
         * TrimObject Returns the a shallow clone of the object (excluding any values that are null, undefined or have no keys).
         */
        _ObjectHelper.TrimObject = function (obj) {
            return _ObjectHelper.ToKeyValueArray(obj)
                .filter(function (kvp) { return kvp.value != null; })
                .reduce(function (prev, cur) {
                prev[cur.key] = cur.value, prev;
                return prev;
            }, {});
        };
        /**
         * ShallowCloneArray returns a shallow clone of an array.
         */
        _ObjectHelper.ShallowCloneArray = function (obj) {
            return (obj || []).map(function (o) { return o; });
        };
        /**
         * ShallowCloneObject returns a shallow clone of an object.
         */
        _ObjectHelper.ShallowCloneObject = function (obj) {
            var clone = {};
            for (var key in obj) {
                clone[key] = obj[key];
            }
            return clone;
        };
        return _ObjectHelper;
    }());
    wfjs._ObjectHelper = _ObjectHelper;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    var _Specification = (function () {
        function _Specification(criteria) {
            this._criteria = criteria;
        }
        _Specification.prototype.IsSatisfiedBy = function (value) {
            return this._criteria(value);
        };
        return _Specification;
    }());
    wfjs._Specification = _Specification;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    var ActivityContext = (function () {
        function ActivityContext(options) {
            this.Extensions = options.Extensions || {};
            this.Inputs = options.Inputs || {};
            this.Outputs = options.Outputs || {};
            this.Global = options.Global || {};
            this.FlowchartSettings = options.FlowchartSettings || {};
        }
        Object.defineProperty(ActivityContext.prototype, "CurrentActivity", {
            get: function () {
                return this.FlowchartSettings['__currentActivity__'];
            },
            set: function (value) {
                this.FlowchartSettings['__currentActivity__'] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityContext.prototype, "CurrentActivityName", {
            /**
            *父流程的flowchartActivity，此属性没有值
            * 当前执行的activity名称,在获取到activity名称后，会赋值
            */
            //public CurrentActivityName: string;
            get: function () {
                return this.FlowchartSettings['__currentActivityName__'] || this.CurrentActivity.activityName;
            },
            set: function (value) {
                this.FlowchartSettings['__currentActivityName__'] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityContext.prototype, "InstanceId", {
            get: function () {
                return this.FlowchartSettings['__instanceId__'];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityContext.prototype, "CurrentInstanceId", {
            get: function () {
                return this.FlowchartSettings['__currentInstanceId__'] ||
                    this.InstanceId;
            },
            set: function (id) {
                if (id)
                    this.FlowchartSettings['__currentInstanceId__'] = id;
            },
            enumerable: true,
            configurable: true
        });
        ActivityContext.prototype.SetContextHistory = function (activityName, context) {
            if (!this.FlowchartSettings['__cxHistory__']) {
                this.FlowchartSettings['__cxHistory__'] = {};
            }
            if (!this.FlowchartSettings['__cxHistory__'][activityName])
                this.FlowchartSettings['__cxHistory__'][activityName] = {};
            wfjs._ObjectHelper.CopyProperties(context, this.FlowchartSettings['__cxHistory__'][activityName]);
        };
        ActivityContext.prototype.GetContextFromHistory = function (activityName) {
            var history = this.FlowchartSettings['__cxHistory__'];
            if (!history && !history[activityName]) {
                throw new Error("can't find " + activityName + " history context");
            }
            return history[activityName];
        };
        ActivityContext.prototype.ClearFlowchartSettings = function () {
            var _this = this;
            Object.keys(this.FlowchartSettings).forEach(function (key) {
                delete _this.FlowchartSettings[key];
            });
        };
        ActivityContext.prototype.CheckAndUpdateBackState = function (activityName) {
            if (this.FlowchartSettings["__isBack__"] == true) {
                if (this.FlowchartSettings["__cxHistory__"][activityName] == null) {
                    delete this.FlowchartSettings["__isBack__"];
                }
            }
        };
        Object.defineProperty(ActivityContext.prototype, "Isback", {
            get: function () {
                return this.FlowchartSettings["__isBack__"] || false;
            },
            enumerable: true,
            configurable: true
        });
        return ActivityContext;
    }());
    wfjs.ActivityContext = ActivityContext;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    var KeyValuePair = (function () {
        function KeyValuePair(key, value) {
            this.key = key;
            this.value = value;
        }
        return KeyValuePair;
    }());
    wfjs.KeyValuePair = KeyValuePair;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    (function (LogType) {
        LogType[LogType["None"] = 0] = "None";
        LogType[LogType["Debug"] = 1] = "Debug";
        LogType[LogType["Info"] = 2] = "Info";
        LogType[LogType["Warn"] = 3] = "Warn";
        LogType[LogType["Error"] = 4] = "Error";
    })(wfjs.LogType || (wfjs.LogType = {}));
    var LogType = wfjs.LogType;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    (function (WorkflowState) {
        WorkflowState[WorkflowState["None"] = 0] = "None";
        WorkflowState[WorkflowState["Running"] = 1] = "Running";
        WorkflowState[WorkflowState["Complete"] = 2] = "Complete";
        WorkflowState[WorkflowState["Paused"] = 3] = "Paused";
        WorkflowState[WorkflowState["Fault"] = 4] = "Fault";
    })(wfjs.WorkflowState || (wfjs.WorkflowState = {}));
    var WorkflowState = wfjs.WorkflowState;
})(wfjs || (wfjs = {}));
if (typeof module != 'undefined') {
    module.exports = wfjs;
}
var wfjs;
(function (wfjs) {
    wfjs.Resources = {
        Error_Argument_Null: '{0}: argument cannot be null.',
        Error_Activity_Argument_Null: 'Activity expects {0} value: {1}.',
        Error_Activity_Invalid: 'Activity is not valid.'
    };
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    /**
     * _Specifications Specification Pattern test for commonly used conditions.
     */
    var _Specifications = (function () {
        function _Specifications() {
        }
        _Specifications.IsPaused = new wfjs._Specification(function (o) { return wfjs._ObjectHelper.GetValue(o, 'State') == wfjs.WorkflowState.Paused || wfjs._ObjectHelper.GetValue(o, 'StateData') != null; });
        _Specifications.IsWildcardDictionary = new wfjs._Specification(function (o) { return wfjs._ObjectHelper.GetValue(o, '*') != null; });
        _Specifications.IsWildcardArray = new wfjs._Specification(function (o) { return wfjs._ObjectHelper.GetValue(o, 0) == '*'; });
        _Specifications.Has$next = new wfjs._Specification(function (o) { return wfjs._ObjectHelper.GetValue(o, 'Outputs', '$next') != null; });
        _Specifications.IsWorkflowActivity = new wfjs._Specification(function (o) { return wfjs._ObjectHelper.GetValue(o, 'activity') != null; });
        _Specifications.IsExecutableActivity = new wfjs._Specification(function (o) { return typeof wfjs._ObjectHelper.GetValue(o, 'Execute') == 'function'; });
        _Specifications.IsExecuteAsync = new wfjs._Specification(function (o) { return o != null && wfjs._FunctionHelper.ParameterCount(o) >= 2; });
        _Specifications.IsArray = new wfjs._Specification(function (o) { return Object.prototype.toString.call(o) == '[object Array]'; });
        _Specifications.IsFlowChartObject = new wfjs._Specification(function (o) { return o instanceof wfjs.FlowchartActivity; });
        return _Specifications;
    }());
    wfjs._Specifications = _Specifications;
})(wfjs || (wfjs = {}));
var wfjs;
(function (wfjs) {
    /**
     * WorkflowInvoker Activity or Workflow runner.
     */
    var WorkflowInvoker = (function () {
        /**
         * CreateActivity Returns a WorkflowInvoker with attached activity.
         */
        function WorkflowInvoker(activity) {
            this._inputs = null;
            this._extensions = null;
            this._stateData = null;
            this._global = null;
            this._flowchartSettings = {};
            function newGuid() {
                var d = new Date().getTime();
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                });
            }
            if (wfjs._Specifications.IsExecutableActivity.IsSatisfiedBy(activity)) {
                this._activity = activity;
                if (wfjs._Specifications.IsFlowChartObject.IsSatisfiedBy(activity)) {
                    var flowChart = activity;
                    this._global = flowChart.$global;
                    var instanceId = newGuid();
                    this._flowchartSettings['__instanceId__'] = instanceId;
                    this._flowchartSettings["__steps__"] = flowChart.steps;
                    WorkflowInvoker.Instance[instanceId] = this;
                }
            }
            else if (activity != null) {
                var flowChart = new wfjs.FlowchartActivity(activity);
                this._activity = flowChart;
                this._global = flowChart.$global;
                var instanceId = newGuid();
                this._flowchartSettings['__instanceId__'] = instanceId;
                this._flowchartSettings["__steps__"] = flowChart.steps;
                WorkflowInvoker.Instance[instanceId] = this;
            }
        }
        Object.defineProperty(WorkflowInvoker.prototype, "InstanceId", {
            get: function () { return this._flowchartSettings['__instanceId__']; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowInvoker.prototype, "Steps", {
            get: function () { return this._flowchartSettings['__steps__']; },
            set: function (steps) {
                this._flowchartSettings['__steps__'] = steps;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * CreateActivity Returns a WorkflowInvoker with attached activity.
         */
        WorkflowInvoker.CreateActivity = function (activity) {
            return new WorkflowInvoker(activity);
        };
        /**
         * Inputs Sets the inputs for the IActivity.
         */
        WorkflowInvoker.prototype.Inputs = function (inputs) {
            this._inputs = inputs;
            return this;
        };
        /**
         * State Sets the IPauseState for the IActivity.
         */
        WorkflowInvoker.prototype.State = function (state) {
            this._stateData = this._activity._stateData = state;
            return this;
        };
        /**
         * Extensions Sets the extensions for the IActivity.
         */
        WorkflowInvoker.prototype.Extensions = function (extensions) {
            this._extensions = extensions;
            return this;
        };
        WorkflowInvoker.prototype.Globals = function (globals) {
            //this._global = globals;
            this._global = wfjs._ObjectHelper.CombineObjects(this._global, globals);
            return this;
        };
        /**
         * settings for flowchart
         * @param settings (flowchart）全局变量(只有一个引用地址)
         */
        WorkflowInvoker.prototype.FlowchartSettings = function (settings) {
            //this._flowchartSettings = settings;
            if (settings && settings != null && Object.keys(settings).length > 0) {
                Object.keys(settings).forEach(function (key) {
                    //__instanceId__不允许覆盖
                    if (key == "__instanceId__") {
                        throw new Error("can't set __instanceId__");
                    }
                    this._flowchartSettings[key] = settings[key];
                }, this);
            }
            return this;
        };
        /**
         * 为flowchart执行activity时调用
         * @param settings (flowchart）全局变量(只有一个引用地址)
         */
        WorkflowInvoker.prototype.SetFlowChartSettings = function (settings) {
            this._flowchartSettings = settings;
            return this;
        };
        /**
         * Invoke Executes the IActivity and returns an error or context.
         */
        WorkflowInvoker.prototype.Invoke = function (callback) {
            callback = callback || function () { };
            this._InvokeActivity(this._activity, this._inputs, this._stateData, this._extensions, this._global, this._flowchartSettings, function (err, context) {
                context = context || {};
                context.State = context.State || (err != null ? wfjs.WorkflowState.Fault : wfjs.WorkflowState.Complete);
                setTimeout(function () {
                    return callback(err, context);
                });
            });
        };
        /**
         * _InvokeActivity Creates an ActivityContext for the IActivity and calls the Execute method.
         */
        WorkflowInvoker.prototype._InvokeActivity = function (activity, inputs, state, extensions, gloabl, settings, callback) {
            var _this = this;
            if (activity == null) {
                return callback(null, { Inputs: {}, Outputs: {} });
            }
            wfjs._bll.Workflow.CreateContext(activity, inputs, state, extensions, gloabl, settings, function (err, context) {
                if (err != null) {
                    return callback(err, context);
                }
                _this._context = context;
                WorkflowInvoker._ActivityExecuteAsync(activity, context, function (err) {
                    if (err != null) {
                        return callback(err, context);
                    }
                    wfjs._bll.Workflow.GetValueDictionary(activity.$outputs, context.Outputs, 'output', function (err, values) {
                        // ignore the errors from missing 'outputs'
                        if (wfjs._Specifications.IsPaused.IsSatisfiedBy(context)) {
                            err = null;
                        }
                        context.Outputs = values;
                        callback(err, context);
                    });
                });
            });
        };
        /**
         * _ActivityExecuteAsync Executes either Asynchronous or Synchronous Activity.
         */
        WorkflowInvoker._ActivityExecuteAsync = function (activity, context, callback) {
            context.CurrentActivity = activity;
            wfjs.triggerEvent('onActivityChange', context.CurrentActivityName, context, activity);
            //set currentActivity
            if (wfjs._Specifications.IsExecuteAsync.IsSatisfiedBy(activity.Execute)) {
                try {
                    activity.Execute(context, callback);
                }
                catch (err) {
                    callback(err);
                }
            }
            else {
                try {
                    activity.Execute(context);
                }
                catch (err) {
                    return callback(err);
                }
                callback();
            }
        };
        /**
         * jump to activity
         * @param arg1 if arg1 is string,then arg1=activityName,if arg1 is number and less than 0,then arg1=gobackstep.
         */
        WorkflowInvoker.prototype.Jumpto = function (arg1) {
            var activityName;
            if (arg1 == null || arg1 == undefined || arg1 == '') {
                throw new Error("jumto can't accept null arg");
            }
            this._context.FlowchartSettings["__jumpto__"] = arg1;
        };
        /**
         * Terminate workflow
         */
        WorkflowInvoker.prototype.Terminate = function () {
            var result = true;
            var currentAct = this._context.CurrentActivity;
            if (!currentAct) {
                //前期先抛出，后期吃掉异常并记录日志
                throw new Error("can't find currentActivity");
            }
            else {
                //如果存在canBeTerminate
                if ('canBeTerminate' in currentAct && currentAct.canBeTerminate instanceof Function) {
                    result = currentAct.canBeTerminate();
                    if (result && 'Terminate' in currentAct && currentAct.Terminate instanceof Function) {
                        result = currentAct.Terminate();
                    }
                }
            }
            if (result)
                this._context.FlowchartSettings['__isTerminate__'] = true;
            return result;
        };
        WorkflowInvoker.Instance = {};
        return WorkflowInvoker;
    }());
    wfjs.WorkflowInvoker = WorkflowInvoker;
})(wfjs || (wfjs = {}));
//# sourceMappingURL=workflow.js.map