define(['durandal/system'],
    function (system) {

        var utility = {
            getScenariosId: function (id) {
                var ScenariosId = id.replace('Scenarios/', '');
                ScenariosId = ScenariosId.substr(0, ScenariosId.lastIndexOf('/'));
                return ScenariosId;
            },
            getResourcePath: function (path) {
                rsPath = path.substr(0, path.lastIndexOf('/') + 1);
                return rsPath;
            },
            getAuthorizationHearder: function () {
                var token = sessionStorage.getItem("access_token");
                var headers = {};
                if (token)
                    headers.Authorization = 'Bearer ' + token;
                return headers;
            },
            httpGet: function (url, contentType, dataType, context) {
                return system.defer(function (dfd) {
                    $.ajax({
                        url: url,
                        contentType: contentType || 'application/json; charset=utf-8',
                        headers: utility.getAuthorizationHearder(),
                        type: 'get',
                        dataType: dataType || 'json',
                        context: context || this
                    }).done(function (data) {
                        dfd.resolve(data);
                    }).fail(function (ex) {
                        system.error('Failed to get data from (' + url + '). Details: ' + ex.message);
                        dfd.reject(ex);
                    });
                }).promise();
            },
            httpPost: function (url, data, contentType, dataType, context) {
                return system.defer(function (dfd) {
                    $.ajax({
                        url: url,
                        contentType: contentType || 'application/json; charset=utf-8',
                        headers: utility.getAuthorizationHearder(),
                        type: 'post',
                        data: data,
                        dataType: dataType || 'json',
                        context: context || this
                    }).done(function (data) {
                        dfd.resolve(data);
                    }).fail(function (ex) {
                        system.error('Failed to post data to (' + url + '). Details: ' + ex.message);
                        dfd.reject(ex);
                    });
                }).promise();
            },

            //添加常用验证
            addCommonValidation: function () {
                //移动电话 11位数字
                if (!ko.validation.rules.hasOwnProperty('mobile'))
                    ko.validation.rules['mobile'] = {
                        validator: function (mobileNumber, validate) {
                            if (!validate) { return true; }
                            if (utility.isEmpty(mobileNumber)) { return true; } // makes it optional, use 'required' rule if it should be required
                            if (typeof (mobileNumber) !== 'string') { return false; }
                            mobileNumber = mobileNumber.replace(/\s+/g, "");
                            return validate && mobileNumber.length == 11 && mobileNumber.match(/^1\d{10}$/);
                        },
                        message: 'Please specify a valid mobile number.'
                    };

                //固定电话 0511-4405222 或者021-87888822 或者 021-44055520-555
                if (!ko.validation.rules.hasOwnProperty('phone'))
                    ko.validation.rules['phone'] = {
                        validator: function (phoneNumber, validate) {
                            if (!validate) { return true; }
                            if (utility.isEmpty(phoneNumber)) { return true; } // makes it optional, use 'required' rule if it should be required
                            if (typeof (phoneNumber) !== 'string') { return false; }
                            phoneNumber = phoneNumber.replace(/\s+/g, "");
                            return validate && /^^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(phoneNumber);
                        },
                        message: 'Please specify a valid tel number.'
                    };

                //邮编验证
                if (!ko.validation.rules.hasOwnProperty('zipcode'))
                    ko.validation.rules['zipcode'] = {
                        validator: function (zipcode, validate) {
                            if (!validate) { return true; }
                            if (utility.isEmpty(zipcode)) { return true; } // makes it optional, use 'required' rule if it should be required
                            if (typeof (zipcode) !== 'string') { return false; }
                            zipcode = zipcode.replace(/\s+/g, "");
                            return validate && zipcode.length == 6 && zipcode.match(/^\d{6}$/);
                        },
                        message: 'Please specify a valid zip code.'
                    };

                //身份证
                if (!ko.validation.rules.hasOwnProperty('IdentityCard'))
                    ko.validation.rules['IdentityCard'] = {
                        validator: function (value, validate) {
                            if (!validate) { return true; }
                            if (utility.isEmpty(value)) { return true; } // makes it optional, use 'required' rule if it should be required
                            var flg = false;
                            if (value.length == 15)
                            { flg = validate && !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(value); }
                            else if (value.length == 18)
                            { flg = validate && /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(value); }
                            return flg
                        },
                        message: 'Please enter a IdentityCard.'
                    };
                //字节最大长度
                /*
                    字节(Byte):通常将可表示常用英文字符8位二进制称为一字节。一个英文字母(不分大小写)占一个字节的空间，
                    一个中文汉字占两个字节的空间．符号：英文标点2占一个字节，中文标点占两个字节．中英文全角占两个字节
                */
                if (!ko.validation.rules.hasOwnProperty('ByteMaxLength'))
                    ko.validation.rules['ByteMaxLength'] = {
                        validator: function (val, maxLength) {
                            console.log("condition:"+this.condition);
                            if (ko.validation.utils.isEmptyVal(val)) { return true; }
                            var out = val.toString().replace(/[^\x00-\xff]/g, '**');
                            return out.length <= maxLength;
                        },
                        message: 'Please enter no more than {0} bytes.'
                    };
                //字节最小长度
                if (!ko.validation.rules.hasOwnProperty('ByteMinLength'))
                    ko.validation.rules['ByteMinLength'] = {
                        validator: function (val, minLength) {
                            if (ko.validation.utils.isEmptyVal(val)) { return true; }
                            var out = val.toString().replace(/[^\x00-\xff]/g, '**');
                            return out.length >= minLength;
                        },
                        message: 'Please enter at least {0} bytes.'
                    };
                //自定义条件验证
                if (!ko.validation.rules.hasOwnProperty('Conditional_Validation'))
                    ko.validation.rules['Conditional_Validation'] = {
                        validator: function (val, condition) {
                            var isValidate = false;
                            if (typeof condition == 'function') {
                                isValidate = condition();
                            }
                            else {
                                if (system.isObject(condition) && condition.hasOwnProperty('conditional'))
                                    isValidate = condition['conditional'] || false;
                                else
                                    isValidate = condition;
                            }
                            //验证
                            if (isValidate) {
                                var flg = true;
                                if (system.isObject(condition) || condition.hasOwnProperty("validates")) {
                                    var validates = condition["validates"];
                                    var keys = Object.keys(validates);

                                    for (var i = 0; i < keys.length; i++) {
                                        var key = keys[i];
                                        if (ko.validation.rules.hasOwnProperty(key)) {
                                            if (!ko.validation.rules[key].validator(val, validates[key])) {
                                                if (system.isObject(validates[key]) && validates[key].hasOwnProperty("message"))
                                                    this.message = validates[key]["message"];
                                                else {
                                                    if (typeof validates[key] == 'number')
                                                        this.message = ko.validation.rules[key].message.format(validates[key]);
                                                    else
                                                        this.message = ko.validation.rules[key].message;
                                                }
                                                flg = false;
                                                break;
                                            }
                                        }
                                    }
                                }

                                //var flg = ko.validation.rules['ByteMaxLength'].validator(val, 2) && ko.validation.rules['required'].validator(val, { params: true, message: "密码不能为空111" })
                                //this.message = 'aaaaa';
                                return flg;//!(val == undefined || val == null || val.length == 0);
                            }
                            else {
                                return true;
                            }
                        },
                        message: "输入值不合法"
                    }
            },
            //判断值是否为空
            isEmpty: function (val) {
                if (val === undefined) {
                    return true;
                }
                if (val === null) {
                    return true;
                }
                if (val === "") {
                    return true;
                }
                return false;
            }
        };
        (function (util) {
            var objProto = Object.prototype;
            var arrProto = Array.prototype;
            var aslice = arrProto.slice;
            var otoStr = objProto.toString;
            var emptyFn = function () { };
            emptyFn.isEmpty = true;
            
            var Logger = function () {
                var opts = {
                    output: function (lv, params) {
                        try {
                            params || (params = []);
                            //params.unshift(lv);
                            //params.unshift(new Date());
                            var t = new Date();
                            var s = (lv || "#debug") + "(" + t.getFullYear() + "-" + t.getMonth() + "-" + t.getDate() + "T" + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds() + (t.getTimezoneOffset() / 60) + ")";
                            params.unshift(s);
                            console.log.apply(console, params);
                        } catch (ignore) { }
                    },
                    levels: ["trace","debug", "activity", "sys", "info", "notice", 'success', "warn", "error"],
                    defaultLevel: "debug"
                }
                var reset = function (output, lvs) {
                    var levels = this["@levels"];
                    var elvs = [];
                    for (var n in levels) {
                        var name = n.substring(2);
                        elvs.push(name);
                        delete this[name];
                    }
                    if (lvs) this["@levels"] = levels = {};
                    else lvs = elvs;
                    if (!output) output = this["@output"];
                    else this["@output"] = output;
                    for (var i in lvs) {
                        var lv = lvs[i];
                        (function (logger, name, levels, output, aslice) {
                            var name1 = "##" + name;
                            
                            var fn = levels[name1] = utility[name] = logger[name] = function () {
                                var params = aslice.call(arguments);
                                output.call(logger, name1, params);
                                return this;
                            }
                            fn.__isLogger = true;
                        })(this, lv, levels, output, aslice);
                    }
                };
                this.enable = function () {
                    var lvs = this["@levels"];
                    if (arguments.length == 0) {
                        for (var n in lvs) {
                            var name = n.substr(2);
                            var fn = lvs[n];
                            fn.isDisabled = false;
                            this[name] = fn;
                        }
                        return this;
                    }
                    
                    for (var i = 0, j = arguments.length; i < j; i++) {
                        var n = arguments[i]; if (!n) continue;
                        var stored = lvs["##" + n];
                        if (stored) {
                            this[n] = utility[n] = stored;
                            stored.isDisabled = false;
                        }
                    }
                    return this;
                }
                this.disable = function () {
                    var lvs = this["@levels"];
                    if (arguments.length == 0) {
                        
                        for (var n in lvs) {
                            var name = n.substr(2);
                            var fn = lvs[n];
                            fn.isDisabled = true;
                            this[name] = emptyFn;
                        }
                        return this;
                    }
                    for (var i = 0, j = arguments.length; i < j; i++) {
                        var n = arguments[i]; if (!n) continue;
                        var stored = lvs["##" + n];
                        if (!stored) continue;
                        stored.isDisabled = true;
                        var fn = this[n] = emptyFn;
                    }
                    return this;
                }
                this.reset = function (opts) {
                    if (opts.output) this["@output"] = opts.output;
                    reset.call(this, opts.output, opts.levels);
                    if (opts.defaultLevel) this["@defaultLevel"] = "##" + opts.defaultLevel;
                    if (opts.enables) this.enable.apply(this, opts.enables);
                    if (opts.disables) this.disables.apply(this, opts.disables);
                    return this;
                }
                this.reset(opts);
            };
            Logger.create = function () {
                var result = function () {

                    if (arguments.length == 0) return log;
                    var params = aslice.call(arguments);
                    var lv = params.shift();
                    var lvs = log["@levels"];
                    var lvFn = lvs[lv] ;
                    if (!lvFn) {
                        var c = lv;
                        lv = log["@defaultLevel"];
                        lvFn = lvs[lv];
                        params.unshift(c);
                    }
                    if (lvFn) {
                        if (lvFn.isDisabled !== true) log["@output"].call(log, lv, params);
                    } 
                    return log;
                }
                Logger.call(result);
                var log = result;
                return result;
            }

            window.$log = util.log = Logger.create();
            
        })(utility);


        return utility;
    });