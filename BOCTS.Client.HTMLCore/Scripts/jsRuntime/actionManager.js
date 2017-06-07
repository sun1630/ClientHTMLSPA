﻿define(['durandal/system', 'durandal/app', 'jsRuntime/configManager', 'jsRuntime/resourceManager', 'jsRuntime/parManager',
    'plugins/dialog', 'jsRuntime/dataManager', 'jsRuntime/eventAggregator', 'jsRuntime/appBridge', 'jsRuntime/utility'],
    function (system, app, cm, rm, pm, dialog, dm, aggregator, jsbridge, utility) {
        var am = {
            dialogInstances: {},
            screenClickCount: ko.observableArray(),
            timeoutIds: ko.observableArray(),

            global: {
                //信息显示
                //参数：message:信息内容 title：标题 
                //options：json数据 [{ text: "确认", value: "Yes" }, { text: "取消", value: "No" }]
                //autoclose: true/false 默认为false 是否点击信息框外部后自动关闭
                //viewArea:遮罩范围、默认为全屏遮罩.
                //返回值：promise
                showMessage: function (message, title, options, autoclose, viewArea) {
                    if (message == rm.global.message.transTerminateFail() + "!")
                        return;

                    var messageBox = new dialog.MessageBox(message, title, options, autoclose, {});
                    var dialogInstanceKey = system.guid();
                    am.dialogInstances[dialogInstanceKey] = messageBox;
                    return system.defer(function (dfd) {
                        dialog.show(messageBox, null, viewArea || 'default').then(function (data) {
                            delete am.dialogInstances[dialogInstanceKey];
                            dfd.resolve(data);
                            utility.log("showMessage:" + title + " close");
                            console.log("showMessage:" + title + " close");
                        }).fail(function (err) {
                            delete am.dialogInstances[dialogInstanceKey];
                            utility.log("showMessage:" + title + err.message);
                            console.log("showMessage:" + title + err.message);
                            dfd.reject(err);
                        });
                        utility.log("showMessage:" + title + " open");
                        console.log("showMessage:" + title + " open");
                    }).promise();
                },

                //显示对话框
                //参数：pageUrl:ModelID，cx:调用页面上下文对象，viewArea:遮罩范围、默认为全屏遮罩.
                //返回值：promise
                showDialog: function (pageUrl, cx, viewArea) {
                    return system.defer(function (dfd) {
                        system.acquire(pageUrl).done(function (module) {

                            if (system.isFunction(module))
                                model = new module(cx || {});
                            else
                                model = module;
                            var dialogInstanceKey = system.guid();
                            am.dialogInstances[dialogInstanceKey] = model;

                            dialog.show(model, null, viewArea || 'default').then(function (rtn) {
                                delete am.dialogInstances[dialogInstanceKey];
                                dfd.resolve(rtn);
                                utility.log("showDialog:" + pageUrl + " close");
                                console.log("showDialog:" + pageUrl + " close");
                            }).fail(function (err) {
                                delete am.dialogInstances[dialogInstanceKey];
                                utility.log("showDialog:" + pageUrl + err.message);
                                console.log("showDialog:" + pageUrl + err.message);
                                dfd.reject(err);
                            });
                            //.always(function () {});

                            utility.log("showDialog:" + pageUrl + " open");
                            console.log("showDialog:" + pageUrl + " open");
                        }).fail(function (err) {
                            utility.log('Failed to load  module (' + pageUrl + '). Details: ' + err.message);
                            console.log('Failed to load  module (' + pageUrl + '). Details: ' + err.message);
                            system.error('Failed to load  module (' + pageUrl + '). Details: ' + err.message);
                            dfd.reject(err);
                        });
                    }).promise();
                },

                //关闭对话框
                //参数：self:Dialog页This，rtf:Dialog页返回值
                closeDialog: function (self, rtf) {

                    if (self)//正常关闭
                    {
                        dialog.close(self, rtf);
                    }
                    else//流程外关闭（如 回首页）
                    {
                        return system.defer(function (dfd) {
                            //先判断当前有没有打开的对话框，如果没有，返回成功。
                            //如果有，弹出确认对话框，如果点击确认，关闭打开的对话框并终止工作流，然后返回成功。
                            //如果点击取消，返回失败。不关闭对话框。
                            if (Object.keys(am.dialogInstances).length == 0) {
                                dfd.resolve();
                            }
                            else {
                                //dialog.showMessage(rm.global.message.quitDialogMessage(), rm.global.message.confirmationTitle(),
                                //[{ text: rm.global.button.buttonYes(), value: true }, { text: rm.global.button.buttonNo(), value: false }], false).
                                //then(function (data) {
                                //    if (data) {
                                //        $.each(am.dialogInstances, function (key) {
                                //            dialog.close(am.dialogInstances[key], null);
                                //        });
                                //        //Terminate workflow..
                                //        dfd.resolve();
                                //    }
                                //    else {
                                //        dfd.reject();
                                //    }
                                //});
                                $.each(am.dialogInstances, function (key) {
                                    dialog.close(am.dialogInstances[key], null);
                                });
                                dfd.resolve();
                            }
                        }).promise();
                    }
                },

                //获取打开对话框个数（不包括工作流中打开的对话框，只计算通过am打开的）
                getOpenDialogNumber: function () {
                    var dialogNumber = 0;
                    return dialogNumber = Object.keys(am.dialogInstances).length;
                },

                //显示遮罩层
                //参数：currentViewArea:遮罩区域 string型，currentViewArea="full"为全屏遮罩
                //message:提示信息 string型
                showMaskLayer: function (currentViewArea, message) {
                    //return;
                    if (currentViewArea == null)
                        return;

                    if ($("#satm-MaskLayer").text() != null && $.trim($("#satm-MaskLayer").text()) != "")
                        return;

                    if (currentViewArea != "full") {
                        if (message == null)
                            message = "";
                        var viewArea = $("div[satm-attr='" + currentViewArea + "']");
                        viewArea.addClass('customModalParent');
                        var blockout = $('<div id="blockout_' + currentViewArea + '" class="customModalBlockout"></div>')
                            .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 0.7 })
                            .appendTo(viewArea);

                        if (viewArea[0].scrollWidth > viewArea.innerWidth())
                            blockout.width(viewArea[0].scrollWidth);

                        var host = $('<div id="host_' + currentViewArea + '" style="top: 42%;left:0;width:100%;text-align:center" class="customModalHost"><h1 id="satm-MaskLayer" style="color:white">' + message + '</h1></div>')
                            .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 1 })
                            .appendTo(viewArea);
                    }
                    else {
                        var body = $('body');
                        var blockout = $('<div id="blockout_Full" class="modalBlockout"></div>')
                            .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 0.7 })
                            .appendTo(body);

                        var host = $('<div id="host_Full" style="top: 42%;left:0;width:100%;text-align:center" class="modalHost"><h1 id="satm-MaskLayer" style="color:white">' + message + '</h1></div>')
                            .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 1 })
                            .appendTo(body);
                    }
                },

                //判断页面中是否有对话话或遮罩层
                isExistDialogAndMaskLayer: function () {
                    var cBlockout = $(".customModalBlockout");
                    var mBlockout = $(".modalBlockout");

                    if (cBlockout.length > 0 || mBlockout.length > 0)
                        return true;
                    else
                        return false
                },

                //关闭遮罩层
                //参数：currentViewArea:遮罩区域 string型
                closeMaskLayer: function (currentViewArea) {
                    //return;
                    if (currentViewArea != "full") {
                        var viewArea = $("div[satm-attr='" + currentViewArea + "']");
                        var blockout = viewArea.find('#blockout_' + currentViewArea);
                        var host = viewArea.find('#host_' + currentViewArea);

                        host.css('opacity', 0);
                        blockout.css('opacity', 0);
                        host.remove();
                        blockout.remove();
                        if (viewArea.find('div[class="customModalBlockout"]').length == 0)
                            viewArea.removeClass('customModalParent');
                    }
                    else {
                        var blockout = $('#blockout_Full');
                        var host = $('#host_Full');

                        host.css('opacity', 0);
                        blockout.css('opacity', 0);
                        host.remove();
                        blockout.remove();
                    }
                },

                //访问服务
                //参数：serverName:服务器名称(wf,msg)   
                //urlPra:访问服务参数  
                //type:访问类型（post,get） 
                //inputPars:参数{}
                //IsProvFlag:是否分行参数，此参数可以不传，默认为全辖参数 false，目前些参数保留无使用
                connectServer: function (connect) {
                    var dfd = new $.Deferred();
                    require(["jsRuntime/workflowManager"], function (wm) {
                        var wfInstanceId = '';
                        var FlowchartSettings = {};
                        var context = {};
                        if (wm.currentRunWfInstance != null) {
                            wfInstanceId = wm.currentRunWfInstance.wfInstanceId;
                            FlowchartSettings = wfjs.WorkflowInvoker.Instance[wfInstanceId]._context.FlowchartSettings;
                            context = wfjs.WorkflowInvoker.Instance[wfInstanceId]._context;
                        }
                        _header = {
                            machineId: cm.client.MachineId,
                            branchNo: cm.client.BranchNo || "",
                            scenarioInstanceId: wfInstanceId || '',
                            currentWFInstanceId: context.CurrentInstanceId || '',
                            scenarioNo: FlowchartSettings.flowId || 'unfound',
                            subScenarioNo: FlowchartSettings.currentFlowId || 'unfound',//子流程场景号
                            custNum: dm.customer.CustNum ? dm.customer.CustNum() : '',
                            custName: dm.customer.CustName ? dm.customer.CustName() : '',
                            idType: dm.customer.IDType ? dm.customer.IDType() : '',
                            idNum: dm.customer.IDNum ? dm.customer.IDNum() : '',
                            culture: cm.client.culture || '',
                            tellerNo: dm.teller.TellerNo() || '',
                            provinceBranchNo: dm.machine.ProvinceBranchNo ? dm.machine.ProvinceBranchNo() : '',
                            workstationNo: dm.machine.WorkstationNo ? dm.machine.WorkstationNo() : '',
                            provBranchNOEHR: dm.machine.ProvBranchNOEHR ? dm.machine.ProvBranchNOEHR() : '',
                            provPrefixNumEHR: dm.machine.ProvPrefixNumEHR ? dm.machine.ProvPrefixNumEHR() : ''
                        };
                        $.extend(_header, connect.header);
                        var token = sessionStorage.getItem("access_token");
                        if (token)
                            _header.Authorization = 'Bearer ' + token;

                        continu();
                    });

                    function continu() {
                        var serverUrl = null;
                        if (connect.serverName == "wf")//总行工作流服务
                        {
                            serverUrl = cm.services.wf.url + "wf/request?wf=";
                        }
                        else if (connect.serverName == "branchWf")//分行工作流服务
                        {
                            serverUrl = cm.services.branchWf.url + "wf/request/" + dm.machine.ProvPrefixNumEHR() + "?wf=";
                        }
                        else if (connect.serverName == "commonWf") {
                            serverUrl = cm.services.branchWf.url + "wf/request/" + cm.client.swfStartPath.common + "?wf=";
                        }
                        else if (connect.serverName.indexOf('http') >= 0 || connect.serverName.indexOf('https') >= 0) {
                            serverUrl = connect.serverName;
                        }
                        else {
                            serverUrl = cm.services[connect.serverName].url;
                        }

                        if (!connect.urlPra || connect.urlPra == null || connect.urlPra == '') {

                        }
                        else {
                            serverUrl += connect.urlPra;
                        }

                        if (serverUrl != null) {
                            $.ajax({
                                url: serverUrl,
                                contentType: 'application/json; charset=utf-8',
                                headers: _header,
                                type: connect.type,
                                data: JSON.stringify(connect.inputPars),//JSON.stringify(obj.pars),//访问webapi的方式JSON.stringify(obj.pars)
                                dataType: connect.dataType || 'json',
                                context: this
                            }).fail(function (ex) {
                                am.global.log(serverUrl + ":" + ex.responseText + ":Status " + ex.status);
                                dfd.reject(serverUrl + ":" + ex.responseText + ":Status " + ex.status);
                            }).done(function (ret) {
                                dfd.resolve(ret);
                            });
                        }
                        else {
                            am.global.log("服务器地址不存在");
                            dfd.reject("服务器地址不存在");
                        }
                    }

                    return dfd.promise();
                },

                //自定义验证
                //参数：[self.account, self.password] account与password都为Ko对象
                //返回值：bool
                validation: function (validatationData) {
                    var tempData = ko.validatedObservable(validatationData);
                    if (tempData.isValid())
                        return true;
                    else {
                        tempData.errors.showAllMessages();
                        return false;
                    }
                },

                /*日期计算
                  * dateAdd(interval,number,date) 
                  * 参数:interval,字符串表达式，表示要添加的时间类型.
                  * 参数:number,数值表达式，表示要添加的时间间隔的个数.
                  * 参数:date,时间对象.
                  * 返回:新的时间对象.
                  * 示例：
                  * var now = new Date();
                  * var newDate = dateAdd("d",5,now);
                */
                dateAdd: function (interval, number, date) {
                    switch (interval) {
                        case "y": {
                            date.setFullYear(date.getFullYear() + number);
                            return date;
                            break;
                        }
                        case "m": {
                            date.setMonth(date.getMonth() + number);
                            return date;
                            break;
                        }
                        case "w": {
                            date.setDate(date.getDate() + number * 7);
                            return date;
                            break;
                        }
                        case "d": {
                            date.setDate(date.getDate() + number);
                            return date;
                            break;
                        }
                        case "hh": {
                            date.setHours(date.getHours() + number);
                            return date;
                            break;
                        }
                        case "mm": {
                            date.setMinutes(date.getMinutes() + number);
                            return date;
                            break;
                        }
                        case "ss": {
                            date.setSeconds(date.getSeconds() + number);
                            return date;
                            break;
                        }
                        default: {
                            date.setDate(d.getDate() + number);
                            return date;
                            break;
                        }
                    }
                },

                //日期格式化
                initDateFormat: function () {
                    /** * 对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、
                    * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
                       Date()).Format("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423      
                    * (new Date()).Format("yyyy/MM/dd HH:mm:ss E") ==> 2009-03-10 20:09:04 星期二     
                    * (new Date()).Format("yy/MM/dd") ==> 09-03-10       
                    * (new Date()).Format("hh:mm:ss") ==> 08:09:04      
                    * (new Date()).Format("E") ==> 星期二     
                    */
                    Date.prototype.Format = function (fmt) {
                        var o = {
                            "M+": this.getMonth() + 1, //月份         
                            "d+": this.getDate(), //日         
                            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
                            "H+": this.getHours(), //小时         
                            "m+": this.getMinutes(), //分         
                            "s+": this.getSeconds(), //秒         
                            "q+": Math.floor((this.getMonth() + 3) / 3), //季度         
                            "S": this.getMilliseconds() //毫秒         
                        };
                        var week = {
                            "0": "星期日",
                            "1": "星期一",
                            "2": "星期二",
                            "3": "星期三",
                            "4": "星期四",
                            "5": "星期五",
                            "6": "星期六"
                            //"0": "/u65e5",
                            //"1": "/u4e00",
                            //"2": "/u4e8c",
                            //"3": "/u4e09",
                            //"4": "/u56db",
                            //"5": "/u4e94",
                            //"6": "/u516d"
                        };
                        if (/(y+)/.test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                        }
                        if (/(E+)/.test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
                        }
                        for (var k in o) {
                            if (new RegExp("(" + k + ")").test(fmt)) {
                                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                            }
                        }
                        return fmt;
                    }

                },

                //字符串格式化
                initStringFormat: function () {
                    /**
                     两种调用方式
                     var template1="我是{0}，今年{1}了";
                     var template2="我是{name}，今年{age}了";
                     var result1=template1.format("loogn",22);
                     var result2=template2.format({name:"loogn",age:22});
                     两个结果都是"我是loogn，今年22了"
                    **/
                    String.prototype.format = function (args) {
                        var result = this;
                        if (arguments.length > 0) {
                            if (arguments.length == 1 && typeof (args) == "object") {
                                for (var key in args) {
                                    if (args[key] != undefined) {
                                        var reg = new RegExp("({" + key + "})", "g");
                                        result = result.replace(reg, args[key]);
                                    }
                                }
                            }
                            else {
                                for (var i = 0; i < arguments.length; i++) {
                                    if (arguments[i] != undefined) {

                                        var reg = new RegExp("({)" + i + "(})", "g");
                                        result = result.replace(reg, arguments[i]);
                                    }
                                }
                            }
                        }
                        return result;
                    }
                },

                //格式化金额 千分位
                //参数：dValue：金额字符串，deciNumber：小数位数 int型
                //返回值：string
                formatNumeric: function (dValue, deciNumber) {
                    var val = dValue.toString();
                    var ret = "";
                    var deciSep = ".";
                    thouSep = ',';

                    if (val.indexOf(deciSep) >= 0) {
                        var comPos = val.indexOf(deciSep);
                        var int = val.substring(0, comPos);
                        var dec = val.substring(comPos);
                    } else {
                        var int = val;
                        var dec = "";
                    }
                    //var ret = [val, pos];

                    if (dec != null && $.trim(dec) != "") {
                        var decValue = dec.substring(dec.indexOf(deciSep) + 1);
                        if (decValue.length > deciNumber) {
                            dec = "." + decValue.substring(0, deciNumber)
                        }
                    }

                    if (int.length > 3) {
                        var newInt = "";
                        var spaceIndex = int.length;

                        while (spaceIndex > 3) {
                            spaceIndex = spaceIndex - 3;
                            newInt = thouSep + int.substring(spaceIndex, spaceIndex + 3) + newInt;
                            //if (pos > spaceIndex) pos++;
                        }
                        //ret = [int.substring(0, spaceIndex) + newInt + dec, pos];

                        ret = int.substring(0, spaceIndex) + newInt + dec;
                    }
                    return ret;
                },

                //金额转大写
                //参数：dValue：金额字符串
                //返回值：string
                numericToUpper: function (dValue) {
                    var maxDec = 2;
                    // 验证输入金额数值或数值字符串：
                    dValue = dValue.toString().replace(/,/g, "");
                    dValue = dValue.replace(/^0+/, ""); // 金额数值转字符、移除逗号、移除前导零
                    if (dValue == "") {
                        return "零元整";
                    } // （错误：金额为空！）
                    else if (isNaN(dValue)) {
                        return "错误：金额不是合法的数值！";
                    }
                    var minus = ""; // 负数的符号“-”的大写：“负”字。可自定义字符，如“（负）”。
                    var CN_SYMBOL = ""; // 币种名称（如“人民币”，默认空）
                    if (dValue.length > 1) {
                        if (dValue.indexOf('-') == 0) {
                            dValue = dValue.replace("-", "");
                            minus = "负";
                        } // 处理负数符号“-”
                        if (dValue.indexOf('+') == 0) {
                            dValue = dValue.replace("+", "");
                        } // 处理前导正数符号“+”（无实际意义）
                    }
                    var vInt = "";
                    var vDec = ""; // 字符串：金额的整数部分、小数部分
                    var resAIW; // 字符串：要输出的结果
                    var parts; // 数组（整数部分.小数部分），length=1时则仅为整数。
                    var digits, radices, bigRadices, decimals; // 数组：数字（0~9——零~玖）；基（十进制记数系统中每个数字位的基是10——拾,佰,仟）；大基（万,亿,兆,京,垓,杼,穰,沟,涧,正）；辅币（元以下，角/分/厘/毫/丝）。
                    var zeroCount; // 零计数
                    var i, p, d; // 循环因子；前一位数字；当前位数字。
                    var quotient, modulus; // 整数部分计算用：商数、模数。
                    // 金额数值转换为字符，分割整数部分和小数部分：整数、小数分开来搞（小数部分有可能四舍五入后对整数部分有进位）。
                    var NoneDecLen = (typeof (maxDec) == "undefined" || maxDec == null || Number(maxDec) < 0 || Number(maxDec) > 5); // 是否未指定有效小数位（true/false）
                    parts = dValue.split('.'); // 数组赋值：（整数部分.小数部分），Array的length=1则仅为整数。
                    if (parts.length > 1) {
                        vInt = parts[0];
                        vDec = parts[1]; // 变量赋值：金额的整数部分、小数部分
                        //if (NoneDecLen) {
                        //    maxDec = vDec.length > 5 ? 5 : vDec.length;
                        //} // 未指定有效小数位参数值时，自动取实际小数位长但不超5。
                        //var rDec = Number("0." + vDec);
                        //rDec *= Math.pow(10, maxDec);
                        //rDec = Math.round(Math.abs(rDec));
                        //rDec /= Math.pow(10, maxDec); // 小数四舍五入
                        //var aIntDec = rDec.toString().split('.');
                        //if (Number(aIntDec[0]) == 1) {
                        //    vInt = (Number(vInt) + 1).toString();
                        //} // 小数部分四舍五入后有可能向整数部分的个位进位（值1）
                        //if (aIntDec.length > 1) {
                        //    vDec = aIntDec[1];
                        //} else {
                        //    vDec = "";
                        //}
                    } else {
                        vInt = dValue;
                        vDec = "";
                        if (NoneDecLen) {
                            maxDec = 0;
                        }
                    }
                    if (vInt.length > 44) {
                        return "错误：金额值太大了！整数位长【" + vInt.length.toString() + "】超过了上限——44位/千正/10^43（注：1正=1万涧=1亿亿亿亿亿，10^40）！";
                    }
                    // 准备各字符数组 Prepare the characters corresponding to the digits:
                    digits = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); // 零~玖
                    radices = new Array("", "拾", "佰", "仟"); // 拾,佰,仟
                    //bigRadices = new Array("", "万", "亿", "兆", "京", "垓", "杼", "穰", "沟", "涧", "正"); // 万,亿,兆,京,垓,杼,穰,沟,涧,正
                    bigRadices = new Array("", "万", "亿", "兆", "京", "垓", "杼", "穰", "沟", "涧", "正"); // 万,亿,兆,京,垓,杼,穰,沟,涧,正
                    decimals = new Array("角", "分", "厘", "毫", "丝"); // 角/分/厘/毫/丝
                    resAIW = ""; // 开始处理
                    // 处理整数部分（如果有）
                    if (Number(vInt) > 0) {
                        zeroCount = 0;
                        for (i = 0; i < vInt.length; i++) {
                            p = vInt.length - i - 1;
                            d = vInt.substr(i, 1);
                            quotient = p / 4;
                            modulus = p % 4;
                            if (d == "0") {
                                zeroCount++;
                            } else {
                                if (zeroCount > 0) {
                                    resAIW += digits[0];
                                }
                                zeroCount = 0;
                                resAIW += digits[Number(d)] + radices[modulus];
                            }
                            if (modulus == 0 && zeroCount < 4) {
                                resAIW += bigRadices[quotient];
                            }
                        }
                        resAIW += "元";
                    }
                    // 处理小数部分（如果有）
                    for (i = 0; i < vDec.length; i++) {
                        d = vDec.substr(i, 1);
                        if (d != "0") {
                            resAIW += digits[Number(d)] + decimals[i];
                        }
                    }
                    // 处理结果
                    if (resAIW == "") {
                        resAIW = "零" + "元";
                    } // 零元
                    if (vDec == "") {
                        resAIW += "整";
                    } // 元整
                    resAIW = CN_SYMBOL + minus + resAIW; // 人民币/负元角分/整
                    return resAIW;
                },

                //日志
                log: function (logStr) {
                    utility.trace(logStr);
                    console.log(logStr);
                },

                //初始化actionManager
                initial: function () {
                    am.global.initDateFormat();
                    am.global.initStringFormat();
                }
            }
        };
        am.global.initial();
        return am;
    });