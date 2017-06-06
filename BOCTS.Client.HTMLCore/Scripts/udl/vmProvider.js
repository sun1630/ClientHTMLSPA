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

    return function (opt) {

        var local = function () {
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
                            this[field] = ko.observable(fieldValue.value).extend(ext);

                            if (objmd.hasOwnProperty('format')) {
                                this[field] = objmd.format(fieldValue.value);
                            }

                        } else {
                            this[field] = fieldValue.value;
                        }
                    }
                }
            }

            //方法处理
            for (var f in opt.methods) {
                this[f] = opt.methods[f];
            }

            return this;
        }
        return new local();
    };
})