define(function () {
    ko.validation.init({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true,
        parseInputAttributes: true,
        messageTemplate: null
    }, true);

    ko.extenders.logChange = function (target, option) {
        target.subscribe(function (newValue) {
            console.log("========================");
            console.log(option);
            //console.log(target());
            OnValueChanged(option, target, newValue);
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

    //
    ko.subscribable.fn.cusFormat = function (format) {
        var target = this;
        var formatValue = target();
        target.subscribe(function () {
            target = ko.computed(function () {
                target(format(formatValue));
            })
        });
        return target;
    };

    //read and write
    ko.subscribable.fn.rw = function (target, read, write) {
        var field = this;
        field = ko.computed({
            // return "111";
            read: read(target),
            //write: write(target, field())
        })
    }

    ko.bindingHandlers.coutomValidate = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //             此处当你定义的绑定被第一次应用于一个元素上时会被调用       
            //         在这设置任意初始化程序、事件处理程序 

            

        }, update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            var allBindings = allBindingsAccessor();
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            var targetValue = allBindings.value;

            $(element).keyup(function () {
                var v = $(element).val();
                //targetValue(v);
                console.log(value() + "===============" + v);
            });

            console.log(value() +"==============="+ targetValue());
        }
    };



    return function (opt) {

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
                        var objmd = fieldValue.metadata;
                        var ext = {};  //ko扩展
                        // rule   ko扩展
                        if (objmd.hasOwnProperty('rule')) {
                            var rules = Object.keys(objmd.rule);
                            for (var key in rules) {
                                switch (rules[key]) {
                                    case 'required': ext.required = objmd.rule[rules[key]]; break;
                                    case 'readonly': ext.readonly = objmd.rule[rules[key]]; break;
                                }
                            }
                            ext.logChange = { root: local, path: field };
                        }

                        //字段是否需要 observable
                        if (fieldValue.metadata.needObserve) {
                            if (objmd.hasOwnProperty('maskInput')) {
                                viewModel[field] = {
                                    value: ko.observable(fieldValue.value).extend(ext),
                                    maskInput: ko.observable(objmd.maskInput)
                                };
                            } else {
                                viewModel[field] = {
                                    value: ko.observable(fieldValue.value).extend(ext)
                                };
                            }

                        } else {
                            viewModel[field] = {
                                value: fieldValue.value
                            };
                        }
                    } else {
                        viewModel[field] = fieldValue;
                    }
                } else {
                    viewModel[field] = fieldValue;
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