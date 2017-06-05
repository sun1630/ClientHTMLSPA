/**
   名称：maskInput格试化输入控件
   使用方法：    
   1、define引入'widgets/maskInput'模块
   2、定义format格式
      A、金额类型
        { 'maskInput': { "type": "numeric", "format": { "thouSep": ",", "deciNumber": 1 } } }
        说明:maskInput：代表控件、type：类型、format：格式、thouSep：千分位符、deciNumber：小数位数
      B、电话类型
        { 'maskInput': { "type": "telePhone", "format": "9{1,4}-9999999" } }
         说明:maskInput：代表控件、type：类型、format：格式   9为数字通配符，{1,4}1代表下划线占位,4代表最多4位，-为分隔符
         例："format": "9{1,4}-9999999" 输出为：1234-8845269
      C、邮箱
        { 'maskInput': { "type": "email", "format": "email" } }
         说明:maskInput：代表控件、type：类型、format：格式
      D、分隔数字
         { 'maskInput': { "type": "separateNumber", "format": "9{1,4}-9{1,3}-999" } }
         说明:maskInput：代表控件、type：类型、format：格式   9为数字通配符，{1,4}1代表下划线占位,4代表最多4位，-为分隔符
         例："format": "9{1,4}-9{1,3}"  输出为：1234-123-875 
   3、页面绑定
      <input data-bind="value:email,maskInput:maskFormat" />
      maskInput：绑定格式，Ko.observablee对象
      value：绑定输入结果，Ko.observabl对象
**/
define(['durandal/system', 'inputmask.dependencyLib', 'inputmask', 'inputmaskExtend/inputmask.extensions',
'inputmaskExtend/jquery.inputmask', 'inputmaskExtend/inputmask.date.extensions', 'inputmaskExtend/inputmask.numeric.extensions',
'inputmaskExtend/inputmask.phone.extensions', 'inputmaskExtend/inputmask.regex.extensions'],
    function (system) {
        var maskWidget = {
            constemInput: ko.bindingHandlers.maskInput = {
                init: function (element, valueAccessor, allBindingsAccessor) {
                    //format初始值
                    var value = valueAccessor();
                    var allBindings = allBindingsAccessor();
                    var valueUnwrapped = ko.utils.unwrapObservable(value);

                    //输入格试
                    var inputFormat = null;
                    //输入类型
                    var inputType

                    $.each(value(), function (key) {
                        if (key == "maskInput") {
                            inputType = value()[key].type;
                            inputFormat = value()[key].format;
                        }
                    });
                    var targetValue = allBindings.value;

                    //金额
                    if (inputType == "numeric") {
                        $(element).inputmask("numeric", {
                            groupSeparator: inputFormat.thouSep,
                            placeholder: "0",
                            autoGroup: true,
                            digits: inputFormat.deciNumber,
                            digitsOptional: false,
                            prefix: ""//€ 
                        });
                    }//座机
                    else if (inputType == "telePhone") {
                        $(element).inputmask({ "mask": inputFormat });
                    }//邮箱
                    else if (inputType == "email") {
                        $(element).inputmask("email");
                    }//分隔数字
                    else if (inputType == "separateNumber") {
                        $(element).inputmask({ "mask": inputFormat });
                    }
                },
                update: function (element, valueAccessor, allBindingsAccessor) {
                    //format输入值
                    var value = valueAccessor();
                    var allBindings = allBindingsAccessor();
                    var valueUnwrapped = ko.utils.unwrapObservable(value);

                    if (valueUnwrapped) {
                        //输入格试
                        var inputFormat = null;
                        //输入类型
                        var inputType

                        $.each(value(), function (key) {
                            if (key == "maskInput") {
                                inputType = value()[key].type;
                                inputFormat = value()[key].format;
                            }
                        });
                        var targetValue = allBindings.value;

                        //金额   //numeric,decimal,currency
                        if (inputType == "numeric") {
                            $(element).inputmask("currency", {
                                radixPoint: inputFormat.radixPoint || ".",
                                groupSeparator: inputFormat.thouSep || "",
                                digits: inputFormat.deciNumber || 2,
                                //integerDigits: inputFormat.integerDigits || 4,
                                //groupSize: 3,
                                placeholder: "0",
                                digitsOptional: false,
                                autoGroup: inputFormat.autoGroup || true,
                                prefix: ""//€ 
                            });

                            //$(element).SendKey(".");

                            if (targetValue != null && $.isFunction(targetValue)) {
                                $(element).off("keyup");
                                $(element).on("keyup", function (event) {
                                    //判断大与小 键盘 退格删除键
                                    if (event.keyCode == "100" || event.keyCode == "8") {
                                        if (isNaN(parseFloat($(element).val())) || parseFloat($(element).val()) == 0) {
                                            $(element).val("0");
                                        }
                                    }
                                    targetValue($(element).val());
                                });

                                //判断整数位最多14位
                                $(element).on("keydown", function () {
                                    if ($.trim($(element).val()) != "") {
                                        var pattern = new RegExp("[" + inputFormat.thouSep + "]");
                                        var dValue = "";

                                        for (var i = 0; i < $(element).val().length; i++) {
                                            dValue = dValue + $(element).val().substr(i, 1).replace(pattern, "");
                                        }

                                        var parts = dValue.split('.');

                                        var vInt = parts[0];
                                        var vDec = parts[1];

                                        //判断大与小 键盘小数点
                                        if (event.keyCode == "110" || event.keyCode == "190") {
                                            var decimalIndex = $(element).val().lastIndexOf(inputFormat.radixPoint || ".");
                                            setCaretPosition($(element).context, decimalIndex + 1);
                                        }

                                        //当前光标位置
                                        var cursorPosition = getCursortPosition($(element).context);
                                        //小数点位置
                                        var decimalPosition = $(element).val().lastIndexOf(inputFormat.radixPoint || ".");

                                        //if (cursorPosition <= decimalPosition) {
                                        //    if (vInt.length > 13) {
                                        //        var e = e || window.event;
                                        //        if (e.preventDefault) {
                                        //            e.preventDefault();
                                        //            e.stopPropagation();
                                        //        }
                                        //        else {
                                        //            e.returnValue = false;
                                        //            e.cancelBubble = true;
                                        //        }
                                        //    }
                                        //}
                                    }
                                })
                            }

                        }//座机
                        else if (inputType == "telePhone") {
                            $(element).inputmask({ "mask": inputFormat });
                        }//邮箱
                        else if (inputType == "email") {
                            $(element).inputmask("email");
                        }//分隔数字
                        else if (inputType == "separateNumber") {
                            $(element).inputmask({ "mask": inputFormat });
                        }


                        //获取光标位置函数
                        function getCursortPosition(ctrl) {
                            var CaretPos = 0;   // IE Support
                            if (document.selection) {
                                ctrl.focus();
                                var Sel = document.selection.createRange();
                                Sel.moveStart('character', -ctrl.value.length);
                                CaretPos = Sel.text.length;
                            }
                                // Firefox support
                            else if (ctrl.selectionStart || ctrl.selectionStart == '0')
                                CaretPos = ctrl.selectionStart;
                            return (CaretPos);
                        }
                        //设置光标位置函数
                        function setCaretPosition(ctrl, pos) {
                            if (ctrl.setSelectionRange) {
                                ctrl.focus();
                                ctrl.setSelectionRange(pos, pos);
                            }
                            else if (ctrl.createTextRange) {
                                var range = ctrl.createTextRange();
                                range.collapse(true);
                                range.moveEnd('character', pos);
                                range.moveStart('character', pos);
                                range.select();
                            }
                        }
                    }
                }
            }
        };
        return maskWidget;
    });