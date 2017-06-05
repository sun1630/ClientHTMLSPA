define(['jsRuntime/configManager', 'require', 'durandal/system', 'jsRuntime/utility'],
    function (cm, require, system, utility) {
        var rm = {
            //工作流实例资源
            instance: {},
            //全局资源
            global: {

            },
            refresh: function () {
                var indexFileName = cm.client.resourceIndexPath;
                var gFileName = cm.client.resourceBasePath + cm.client.culture + "/";

                //全国资原
                indexFileName = cm.client.resourceBasePath + cm.client.defaultCenter + "/index";
                gFileName = cm.client.resourceBasePath + cm.client.defaultCenter + "/" + cm.client.culture + "/";
                rm.refreshGlobal(indexFileName, gFileName, cm.client.defaultCenter);
                //分行资源
                require(["jsRuntime/dataManager"], function (dm) {
                    if (dm.machine.ProvPrefixNumEHR() != '') {
                        indexFileName = cm.client.resourceBasePath + dm.machine.ProvPrefixNumEHR() + "/index";
                        gFileName = cm.client.resourceBasePath + dm.machine.ProvPrefixNumEHR() + "/" + cm.client.culture + "/";
                        rm.refreshGlobal(indexFileName, gFileName, dm.machine.ProvPrefixNumEHR());
                    }
                });

                //工作流实例资源
                rm.refreshInstanceRes();
            },

            //刷新全局资源
            //indexFileName 索引文件路径
            //gFileName  索引文件路径中资源文件路径
            //provNum  分省前缀码 
            refreshGlobal: function (indexFileName, gFileName, provNum) {
                var globalObj = rm.global;
                var theme = cm.client.theme;

                system.acquire(indexFileName).done(function (module) {
                    $.each(module.fileIndex, function (key) {
                        rm.log("loading global res path:" + gFileName + module.fileIndex[key]);
                        system.acquire(gFileName + module.fileIndex[key]).done(function (subModule) {
                            var name = module.fileIndex[key];
                            if (!globalObj[name]) {
                                globalObj[name] = {};

                                var fixNum = provNum;
                                if (provNum == cm.client.defaultCenter)
                                    fixNum = cm.client.defaultCenter

                                if (name == 'image') {
                                    $.each(subModule, function (ikey) {
                                        if (globalObj[name].hasOwnProperty(ikey))
                                            globalObj[name][ikey](cm.getimagePath() + fixNum + '/' + theme + "/" + subModule[ikey]);
                                        else
                                            globalObj[name][ikey] = ko.observable(cm.getimagePath() + fixNum + '/' + theme + "/" + subModule[ikey]);
                                    });
                                }
                                else if (name == 'audio') {
                                    $.each(subModule, function (ikey) {
                                        if (globalObj[name].hasOwnProperty(ikey))
                                            globalObj[name][ikey](cm.getAudioPath() + fixNum + '/' + theme + "/" + subModule[ikey]);
                                        else
                                            globalObj[name][ikey] = ko.observable(cm.getAudioPath() + fixNum + '/' + theme + "/" + subModule[ikey]);
                                    });
                                }
                                else if (name == 'video') {
                                    $.each(subModule, function (ikey) {
                                        if (globalObj[name].hasOwnProperty(ikey))
                                            globalObj[name][ikey](cm.getVideoPath() + fixNum + '/' + theme + "/" + subModule[ikey]);
                                        else
                                            globalObj[name][ikey] = ko.observable(cm.getVideoPath() + fixNum + '/' + theme + "/" + subModule[ikey]);
                                    });
                                }
                                else
                                    ko.mapper.fromJS(subModule, {}, globalObj[name]);
                            }
                            else {
                                var fixNum = provNum;
                                if (provNum == cm.client.defaultCenter)
                                    fixNum = cm.client.defaultCenter

                                var temp = globalObj[name];
                                $.each(subModule, function (subkey) {
                                    if (!temp[subkey])
                                        temp[subkey] = ko.observable();

                                    if (name == 'image') 
                                        temp[subkey](cm.getimagePath() + fixNum + '/' + theme + "/" + subModule[subkey]);
                                    else if (name == 'audio')
                                        temp[subkey](cm.getAudioPath() + fixNum + '/' + theme + "/" + subModule[subkey]);
                                    else if (name == 'video')
                                        temp[subkey](cm.getVideoPath() + fixNum + '/' + theme + "/" + subModule[subkey]);
                                    else
                                        temp[subkey](subModule[subkey]);
                                });
                            }

                            //初始化错误信息语言
                            if (module.fileIndex[key] == 'validation') {
                                utility.addCommonValidation();
                                $.each(subModule, function (key) {
                                    if (ko.validation.rules.hasOwnProperty(key)) {
                                        ko.validation.rules[key].message = subModule[key];
                                    }
                                });
                            }
                        }).
                        fail(function (err) {
                            rm.log("loading global res path:" + gFileName + module.fileIndex[key] + " not exists" + err.message);
                        });
                    });
                }).
                fail(function (err) {
                    rm.log("loading global res path:" + indexFileName + " not exists" + err.message);
                });
            },

            //刷新工作流资源
            refreshInstanceRes: function () {
                $.each(rm.instance, function (key) {
                    var subFileName = 'Scenarios/' + rm.instance[key].__flowId__ + '/res/' + cm.client.culture;
                    system.acquire(subFileName).done(function (module) {
                        $.each(module, function (mKey) {
                            var value = module[mKey];
                            var instanceValue = rm.instance[key];
                            if (typeof value == 'object') {
                                if (!instanceValue[mKey])
                                    instanceValue[mKey] = {};

                                rm.recursionKey(instanceValue[mKey], value, mKey)
                            }
                            else {
                                if (instanceValue.hasOwnProperty(mKey))
                                    instanceValue[mKey](value)
                                else
                                    instanceValue[mKey] = ko.observable(value);
                            }
                        });
                    })
                });
            },

            //注册工作流实例资源
            //flowPath:工作流场景路径 例：'Scenarios/center/CS1012' 或‘center/CS1012’
            registerRes: function (flowPath, wfInstanceId) {
                var fileName = 'Scenarios/'; //+ flowId + '/res/' + cm.client.culture;
                var flowId = flowPath;

                if (flowId.toLowerCase().indexOf('scenarios') == -1)
                    fileName += flowId + '/res/' + cm.client.culture;
                else
                    fileName = flowId + '/res/' + cm.client.culture;

                rm.log("loading wfInstanceId res path:" + fileName);
                return system.acquire(fileName).done(function (module) {
                    var instanceRs = rm.instance[wfInstanceId];

                    var copyObj2ToObj1 = function (obj1, obj2) {
                        if (!obj1 || !obj2) return;
                        Object.keys(obj2).forEach(function (key) {
                            var value = obj2[key];
                            if (typeof value == 'object') {
                                if (!obj1[key])
                                    obj1[key] = {};
                                //$.extend(obj1[key], value);
                                rm.recursionKey(obj1[key], value, key)
                            }
                            else {
                                if (obj1.hasOwnProperty(key))
                                    obj1[key](value)
                                else
                                    obj1[key] = ko.observable(value);
                            }
                        })
                    }

                    if (!instanceRs) {
                        instanceRs = {};
                        copyObj2ToObj1(instanceRs, module);
                        rm.instance[wfInstanceId] = instanceRs;
                        instanceRs.__flowId__ = flowId
                    } else {
                        copyObj2ToObj1(instanceRs, module);
                    }
                }).fail(function (err) {
                    rm.log("loading wfInstanceId res path:" + fileName + err.message);
                });;
            },

            //递归键值
            recursionKey: function (instanceObj, modelObj, parentKey) {
                var theme = cm.client.theme;

                $.each(modelObj, function (key) {
                    var value = modelObj[key];
                    if (instanceObj.hasOwnProperty(key)) {
                        if (value == 'object') {
                            if (!instanceObj[key])
                                instanceObj[key] = {};
                            rm.recursionKey(instanceObj[key], value, key);
                        }
                        else {
                            //if (parentKey == 'image')
                            //    instanceObj[key](cm.getimagePath() + theme + "/" + value);
                            //else if (parentKey == 'audio')
                            //    instanceObj[key](cm.getAudioPath() + theme + "/" + value);
                            //else if (parentKey == 'video')
                            //    instanceObj[key](cm.getVideoPath() + theme + "/" + value);
                            //else
                            instanceObj[key](value);
                        }
                    }
                    else {
                        if (value == 'object') {
                            if (!instanceObj[key])
                                instanceObj[key] = {};
                            rm.recursionKey(instanceObj[key], value, key);
                        }
                        else {
                            //if (parentKey == 'image')
                            //    instanceObj[key] = ko.observable(cm.getimagePath() + theme + "/" + value);
                            //else if (parentKey == 'audio')
                            //    instanceObj[key] = ko.observable(cm.getAudioPath() + theme + "/" + value);
                            //else if (parentKey == 'video')
                            //    instanceObj[key] = ko.observable(cm.getVideoPath() + theme + "/" + value);
                            //else
                            instanceObj[key] = ko.observable(value);
                        }
                    }
                });
            },

            //TODO:释放流程注册的资源
            unRegisterRes: function (wfInstanceId) {
                delete rm.instance[wfInstanceId];
            },

            log: function (logStr) {
                utility.trace(logStr);
                console.log(logStr);
            }
        };
        rm.refresh();
        return rm;
    });