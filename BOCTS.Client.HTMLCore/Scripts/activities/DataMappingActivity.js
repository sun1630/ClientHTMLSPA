define(['jsRuntime/dataManager', 'knockout', 'jsRuntime/configManager', 'jsRuntime/resourceManager', 'jsRuntime/utility']
    , function (dm, ko, cm, rm, util) {
        function checkPath(path) {
            var result = true;
            if (!path) {
                result = false;
                throw new Error("path can't be null!");
            }
            if (path.indexOf("*") > 0) {
                var index = path.indexOf("*");
                if (index == path.lastIndexOf("*") && index == path.length - 1)
                { }
                else {
                    result = false;
                    throw new Error("'*' must be last and only one char in path");
                }
            }
            return result;
        }
        function getValue(obj, path, isKoObj) {
            if (!obj) {
                throw new Error("obj can't be null!");
            }
            if (!checkPath(path))
                return;
            var paths = path.split('.');
            var result;
            paths.reduce(function (pre, current) {
                if (current && pre) {
                    if (current == "*")
                        return result = pre;
                    else {
                        result = pre[current];
                        if (result instanceof Function)
                            result = result.call(pre);
                    }
                    return result;
                }
                else //whatever current or pre is null,returnValue is null.
                    return null;
            }, obj);
            return result;
        }
        function setValue(obj, path, value, except, isKoObj) {
            if (!obj) {
                util.log.error("DataMap activity ->obj can't be null!");
                throw new Error("obj can't be null!");
            }
            if (!checkPath(path))
                return;
            var paths = path.split('.');
            var result;
            paths.reduce(function (pre, current, index) {
                //向ko变量中赋值
                if (isKoObj) {
                    if (current == "*") {
                        for (var key in value) {
                            if (key in pre && ko.isObservable(pre[key])) {
                                pre[key](value(key));
                            }
                        }
                    }
                    else {
                        if (index == paths.length - 1) {
                            if (ko.isObservable(pre[current]))
                                pre[current](value);
                        } else {
                            if (current in pre) {
                                if (ko.isObservable(pre[current]))
                                    return pre[current]();
                                else
                                    return pre[current];
                            } else {
                                util.log.activity(current, " not found in ", pre, '[DataMappingActivity]');
                                throw new Error(current + " not found in " + pre);
                            }
                        }
                    }
                    //向普通的变量中赋值
                } else {
                    if (current == "*")
                        cloneToOther(pre, value);
                        //Object.assign(pre, value);
                    else {
                        if (pre[current] == null)
                            pre[current] = {};
                        if (index == paths.length - 1) {
                            pre[current] = value;
                        }
                        else {
                            if (current in pre) {
                                return pre[current];
                            } else {
                                util.log.activity("Not found " + current + " in object[datamappingActivity]");
                            }
                        }
                    }
                }
            }, obj);
            except.forEach(function (item) {
                item.split(".").reduce(function (pre, current, index, arr) {
                    if (pre && current) {
                        if (index == arr.length - 1)
                            delete pre[current];
                        else
                            return pre[current];
                    }
                }, obj);
            });
        }
        function cloneObj(obj) {
            if (Array.isArray(obj))
                return obj.slice();
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
        function cloneToOther(target, source) {
            if (Object.assign) {
                Object.assign(target, source);
            } else {
                for (var key in source) {
                    var item = source[key];
                    if (Array.isArray(item)) {
                        target[key] = item.slice();
                    } else if (item == null) {
                        target[key] = item;
                    }
                    else if (typeof item === 'object') {
                        if (target[key] == undefined)
                            target[key] = {};
                        cloneToOther(target[key], item);
                    } else {
                        target[key] = item;
                    }
                }
            }
        }
        /**
            * mapping value from sData to tData with mapping
            * @param sData SourceData
            * @param tData TargetData
            */
        function mappingValue(mapping, sData, tData, sourceIsDmCust, targetIsKoObj) {
            mapping.forEach(function (value) {
                var sourcePath = value.source;
                var targetPath = value.target;
                var except = value.except || [];
                if (typeof sourcePath == 'string')
                    sourcePath = sourcePath.trim();
                if (typeof targetPath == 'string')
                    targetPath = targetPath.trim();
                if (typeof except == 'string') {
                    var arr = [];
                    arr.push(except);
                    except = arr;
                }
                var targetValue = getValue(sData, sourcePath, sourceIsDmCust);
                //if targetValue is an object,then clone the object,in cases reference error;
                if (typeof targetValue === 'object')
                    targetValue = cloneObj(targetValue);
                util.log.activity("mapping", value, targetValue);
                setValue(tData, targetPath, targetValue, except, targetIsKoObj);
            });
        }

        var setData = function () {
            this.$inputs = "*";
            this.$outputs = "*";

            this.activityName = 'DataMappingActivity';
        }
        /**
        *Source:'$dm','$global'
        *Target:'$dm','$global' 
        *mapping  example:
        *    [
        *        {source:'aa.bb.cc',target:'dd.ee.ff'},
        *        {source:'ab.bc.cc',target:'ad.ea.fb'},
        *    ]
        */
        setData.prototype.Execute = function (context, done) {
            util.log.activity("Data Mapping start.");
            var opt = {
                Source: "$dm",
                Target: {},
                Mapping: []
            }
            //var isKoObj = false;
            var sourceIsDmCust = false;
            var targetIsKoObj = false;
            // is Copy the Target var
            var isCloneTarget = true;
            var getInnerData = function (targetStr, dataType) {
                var result;
                if (targetStr.indexOf("$") == 0) {
                    isCloneTarget = false;
                    switch (targetStr.toLowerCase()) {
                        case "$dminstance":
                        case "$dm": {
                            result = dm.instance[context.InstanceId];
                            break;
                        }
                        case "$global": {
                            result = context.Global;
                            break;
                        }
                        case '$inputs': {
                            result = context.Inputs;
                            break;
                        }
                        case "$dmglobal": {
                            result = dm;
                            switch (dataType) {
                                case "source": {
                                    sourceIsDmCust = true;
                                    break;
                                }
                                case "target": {
                                    targetIsKoObj = true;
                                    break;
                                }
                            }
                            break;
                        }
                        case "$customer": {
                            result = dm.customer;
                            switch (dataType) {
                                case "source": {
                                    sourceIsDmCust = true;
                                    break;
                                }
                                case "target": {
                                    targetIsKoObj = true;
                                    break;
                                }
                            }
                            break;
                        }
                        case "$cm": {
                            result = cm;
                            break;
                        }
                        case "$rminstance":
                        case "$rm": {
                            result = rm.instance[context.InstanceId];
                            break;
                        }
                        case "$rmglobal": {
                            result = rm.global;
                            break;
                        }
                    }
                } else {
                    util.log.activity("can't resolve tragetStr which is not begin with $");
                    throw new Error("can't resolve tragetStr which is not begin with $");
                }
                return result;
            }
            var getInputData = function (source, dataType) {
                source = source || {};
                var result = {};
                if (typeof source == 'object') {
                    result = source;
                }
                else if (source.indexOf('$') == 0) {
                    result = getInnerData(source, dataType);
                }
                else {
                    util.log.error("unknown type of Source");
                    throw new Error("unknown type of Source");
                }
                return result;
            }
            //检查是否是ko变量，如果是ko变量，则不拷贝
            var checkIsKoObj = function (data) {
                if (typeof data == 'object') {
                    var keys = Object.keys(data);
                    for (var i = 0; i < keys.length; i++) {
                        var item = data[keys[i]];
                        if (typeof item == 'function') {
                            if (ko.isObservable(item)) {
                                isCloneTarget = false;
                                targetIsKoObj = true;
                                break;
                            }
                        }
                    }
                } else if (ko.isObservable(data)) {
                    isCloneTarget = false;
                    targetIsKoObj = true;
                }
            }
            var inputs = wfjs.GetInputsFromContextWithOption(context, opt);
            util.log.activity("inputs", inputs);
            if (!Array.isArray(inputs.Mapping)) {
                throw new Error("mappingfile must be an Array");
            }
            var sourceData = getInputData(inputs.Source, "source");
            if (!sourceData)
                sourceData = {};//in some cases,sourceData may be null.
            util.log.activity("source", sourceData);
            var oldtargetData = getInputData(inputs.Target, "target");
            if (isCloneTarget) {
                checkIsKoObj(oldtargetData);
            }
            if (isCloneTarget) {
                var targetData = cloneObj(oldtargetData);
            } else {
                var targetData = oldtargetData;
            }
            util.log.activity("old target", oldtargetData);
            //if sourceData is array,targetResult must be an array too;
            if (Array.isArray(sourceData) || (ko.isObservable(sourceData) && 'push' in sourceData)) {
                if (!Array.isArray(targetData)) {
                    if (Object.keys(targetData).length > 0) {
                        util.log.error("Target must be an Array or an object with no key,when Source is an Array");
                        throw new Error("Target must be an Array or an object with no key,when Source is an Array");
                    } else {
                        targetData = [];
                    }
                }
                sourceData = ko.utils.unwrapObservable(sourceData);
                for (var i in sourceData) {
                    var sData = sourceData[i];
                    var tData = {};
                    mappingValue(inputs.Mapping, sData, tData, sourceIsDmCust, targetIsKoObj);
                    targetData.push(tData);
                }
            } else {
                if (Array.isArray(targetData) || (ko.isObservable(targetData) && 'push' in targetData)) {
                    if (targetData.length > 0) {
                        util.log.error("Target must be an Array or an object with no key,when Source is an Object");
                        throw new Error("Target must be an object or an null Arrany,when Source is an Object");
                    } else {
                        targetData = {};
                    }
                }
                mappingValue(inputs.Mapping, sourceData, targetData, sourceIsDmCust, targetIsKoObj);
            }
            context.Outputs['Result'] = targetData;
            util.log.activity("final result:", targetData);
            util.log.activity("Data Mapping end.");
            done();
        }
        setData.prototype.canBeTerminate = function () {
            return true;
        }
        return setData;
    });
