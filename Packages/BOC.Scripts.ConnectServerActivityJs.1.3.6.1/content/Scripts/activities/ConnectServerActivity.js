define(['jquery', 'jsRuntime/dataManager', 'knockout', 'jsRuntime/configManager', 'jsRuntime/utility'],
    function ($, dm, ko, cm, util) {
        var act = function () {
            this.$inputs = "*";
            this.$outputs = "*";//'Result'
            this.activityName = 'ConnectServerActivity';
        };
        /*
        Server: 要连接的服务器
        Url：访问的接口
        SendData:要发送的数据
        Method:类型 ,defaultValue:post  用于支持自定义的动作(delete)
        Pars：参数
        Result: 结果
        */
        act.prototype.Execute = function (context, done) {
            var opt = {
                Server: 'wf',
                Url: '',
                Method: 'post',
                Pars: {},
                SendData: {},
                Classify: 'center'
            };
            util.log.activity("ConnectServer start");
            var inputs = wfjs.GetInputsFromContextWithOption(context, opt);
            var instanceId = context.InstanceId;
            var dmInstance = dm.instance[instanceId];
            //Get url form inputs
            //@param :inputs
            function getUrl(inputs) {
                if (!inputs.Server)
                    throw new Error("Url不能为空");
                var server = inputs.Server;
                //仅当server=wf且 是分行特色，且存在分行特色的配置
                if (server == 'wf' && (inputs.Classify.toLowerCase() == 'branch' || inputs.Classify.toLowerCase() == 'common') && cm.services.branchWf)
                    server = 'branchWf';
                //当server是分行特色，但不存在分行特色的配置，此时将server改为wf（兼容M端）
                if (server == 'branchWf' && !cm.services.branchWf)
                    server = 'wf';
                var url = 'cm.services.' + server + '.url';
                try {
                    url = eval(url);
                } catch (e) {
                    throw new Error("can't found url:" + server);
                }
                var startWithReg = new RegExp("^http");
                if (!startWithReg.test(url)) {
                    throw new Error("error url:" + server);
                }
                var endWithReg = new RegExp("/$");
                if (!endWithReg.test(url))
                    url += "/";
                url += inputs.Url;
                if (!endWithReg.test(url))
                    url += "/";
                switch (inputs.Classify.toLowerCase()) {
                    case "branch":
                        url += dm.machine.ProvPrefixNumEHR();
                        break;
                    case "common":
                        url += "common";
                        break;
                    default:
                        break;
                }
                var strPars = '';
                //if 'this.' in pars,then eval code;
                var evalContext = {};
                combineObj(evalContext, context.Inputs, context.Global);
                Object.keys(inputs.Pars).forEach(function (value, index, arr) {
                    var v = inputs.Pars[value];
                    if (v.indexOf("this.") > -1)
                        v = evalWithContext.call(evalContext, v)
                    if (index == 0) {
                        strPars += "?" + value + "=" + v;
                    } else {
                        strPars += "&" + value + "=" + v;
                    }
                })
                if (endWithReg.test(url))
                    url = url.substring(0, url.length - 1);
                url += strPars;
                return url;
            }
            var url = getUrl(inputs);
            function createHeader() {
                try {
                    var idType = dm.customer.IDType ? dm.customer.IDType() : '';
                    if (idType == '')
                        idType = dm.customer.Card.IDType ? dm.customer.Card.IDType() : '';
                    var idNum = dm.customer.IDNum ? dm.customer.IDNum() : '';
                    if (idNum == '')
                        idNum = dm.customer.Card.IDNum ? dm.customer.Card.IDNum() : '';
                    var custNum = dm.customer.CustNum ? dm.customer.CustNum() : '';
                    if (custNum == '')
                        custNum = dm.customer.Card.CustNum ? dm.customer.Card.CustNum() : '';
                    var custName = dm.customer.CustName ? dm.customer.CustName() : '';
                    if (custName == '')
                        custName = dm.customer.Card.CustName ? dm.customer.Card.CustName() : '';
                    var headers = {
                        machineId: cm.client.MachineId,
                        branchNo: cm.client.BranchNo,
                        scenarioInstanceId: instanceId || '',
                        currentWFInstanceId: context.CurrentInstanceId || '',
                        scenarioNo: context.FlowchartSettings.flowId || 'unfound',
                        subScenarioNo: context.FlowchartSettings.currentFlowId || context.FlowchartSettings.flowId || 'unfound',//子流程场景号
                        custNum: custNum,
                        custName: custName,
                        idType: idType,
                        idNum: idNum,
                        culture: cm.client.culture || '',
                        tellerNo: dm.teller.TellerNo() || '',
                        provinceBranchNo: dm.machine.ProvinceBranchNo ? dm.machine.ProvinceBranchNo() : '',
                        workstationNo: dm.machine.WorkstationNo ? dm.machine.WorkstationNo() : '',
                        imageId: dmInstance.$ImageId,
                        agreementId: JSON.stringify(dmInstance.$AgreementId),
                        provBranchNOEHR: dm.machine.ProvBranchNOEHR ? dm.machine.ProvBranchNOEHR() : '',
                        provPrefixNumEHR: dm.machine.ProvPrefixNumEHR ? dm.machine.ProvPrefixNumEHR() : ''
                    };
                    var token = sessionStorage.getItem("access_token");
                    if (token)
                        headers.Authorization = 'Bearer ' + token;
                } catch (ex) {
                    util.error("occur an error when compose header", ex);
                }
                return headers;
            }
            var header = createHeader();
            var ajaxOpts = {
                url: url,
                timeout: 90000,
                contentType: 'application/json; charset=utf-8',
                headers: header,
                type: inputs.Method,
                data: JSON.stringify(inputs.SendData),//访问webapi的方式
                dataType: 'json',
                context: this
            };
            if (inputs.Method.toLowerCase() === "get")
                delete ajaxOpts.data;
            util.log.trace("ConnectServer request:", url);
            util.log.activity("ajax opts", ajaxOpts);
            $.ajax(ajaxOpts).done(function (ret) {
                context.Outputs['Result'] = ret;
                if (ret && ret.ErrorCode) {
                    util.log.trace("ConnectServer return error:", ret.ErrorInfo);
                    util.log.warn("ConnectServer return error", ret);
                } else {
                    util.log.trace("ConnectServer return success.");
                    util.log.activity("ConnectServer return success", ret);
                }
                done();
            }).fail(function (xmlhttp, ex) {
                var ret = {
                    FromClient: true,
                    ErrorCode: xmlhttp.status,
                    ErrorInfo: xmlhttp.responseText || xmlhttp.statusText || ''
                }
                context.Outputs['Result'] = ret;
                util.log.error("ConnectServer fail", ret);
                done();
            });
            util.log.trace("ConnectServer waiting");
        };
        act.prototype.canBeTerminate = function () {
            return false;
        };
        function evalWithContext(code) {
            return eval(code);
        }
        function combineObj(target) {
            target = target || {};
            if (Object.assign) {
                Object.assign.apply(Object, arguments);
            } else {
                var args = [];
                for (var i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                for (var i = 1; i < args.length; i++) {
                    var item = args[i];
                    for (var key in item) {
                        target[key] = item[key];
                    }
                }
            }
        }
        return act;
    });