define(function () {

    ko.extenders.logChange = function (target, option) {
        target.subscribe(function (newValue) {
            console.log("========================");
            console.log(option);
            //console.log(target());
            //OnValueChanged(option, target, newValue);
        });
        return target;
    };

    ko.extenders.readonly = function (target, readonly) {
        var computed = ko.computed({
            read: target,
            write: function () {
                if (arguments.length <= 1) {
                    if (!computed.canWrite()) {
                        //var aa = target();
                        //target(aa);
                        console.log("Observable in read only mode");
                        return;
                    }
                }
                target(arguments[0]);
            }
        });
        computed.canWrite = ko.observable(!readonly);
        return computed;
    };

    ko.bindingHandlers.coutomValidate = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //             此处当你定义的绑定被第一次应用于一个元素上时会被调用       
            //         在这设置任意初始化程序、事件处理程序 



        }, update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();

            console.log('mask ggz' + value());



            var allBindings = allBindingsAccessor();
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            var targetValue = allBindings.value;

            if (value() == 'hkd:####') {
                targetValue('10111.00');
            }

            console.log(targetValue());

            $(element).keyup(function () {
                var v = $(element).val();

                //targetValue(v);
                //console.log(value() + "todo mask " + v);
            });

            //console.log(value() + "===============" + targetValue());
        }
    };

    return function (opt, cx) {

        var local = function () {
            var viewModel = {};

            //遍历data 字段
            for (var d in opt.data) {
                var field = d,
                    fieldValue = opt.data[d];

                //字段值是否为对象
                if (fieldValue instanceof Object) {
                    //验证字段是否包含 matedata 
                    if (fieldValue.hasOwnProperty('metadata')) {
                        //trans中字段是否已存在
                        if (!cx.shareTrans.hasOwnProperty(field)) {
                            var objmd = fieldValue.metadata;
                            var ext = {};  //ko扩展
                            if (objmd.hasOwnProperty('inputComlplete')) {
                                ext = objmd.inputComlplete;
                            }
                            ext.logChange = { root: local, path: field };

                            if (fieldValue.metadata.needObservable) {
                                viewModel[field] = {
                                    value: fieldValue.value instanceof Array ? ko.observableArray(fieldValue.value) : ko.observable(fieldValue.value).extend(ext),
                                };
                            } else {
                                viewModel[field] = fieldValue;
                            }
                        }
                    } else {
                        viewModel[field] = fieldValue;
                    }

                } else {
                    viewModel[field] = fieldValue;
                }
            }

            //第二次遍历
            for (var d in opt.data) {
                var field = d,
                    fieldValue = opt.data[d];
                //字段值是否为对象
                if (fieldValue instanceof Object) {
                    //验证字段是否包含 matedata 
                    if (fieldValue.hasOwnProperty('metadata')) {
                        var objmd = fieldValue.metadata;
                        if (objmd.hasOwnProperty('inputMask')) {
                            var inputMaskObj = objmd.inputMask;
                            if (inputMaskObj instanceof Object) {
                                viewModel[field].inputMask = ko.observable(inputMaskObj.inputMask);
                            } else {
                                viewModel[field].inputMask = ko.observable(inputMaskObj);
                            }
                        }

                        if (objmd.hasOwnProperty('format')) {
                            var fld = field;
                            var fmtObj = objmd;
                            viewModel[fld].format = ko.computed(function () {
                                return fmtObj.format(viewModel, viewModel[fld].value());
                            });
                        }

                        //marge 
                        if (!cx.shareTrans.hasOwnProperty(field)) {
                            Object.defineProperty(cx.shareTrans, field, {
                                value: viewModel[field],
                                configurable: true,
                                writable: true,
                                enumerable: true
                            });
                        }

                    }
                }
            }

            //方法处理
            for (var f in opt.methods) {
                viewModel[f] = opt.methods[f];
            }

            return viewModel;
        }
        return new local();
    };
})