define(['knockout', 'durandal/system', 'jsRuntime/utility', 'jsRuntime/configManager'],
    function (ko, system, utility, cm) {
        var _initFlag = false;
        var dm = {
            instance: {},

            //合并工作流实例提交数据
            mergeValue: function (wfInstanceId, Data) {
                $.each(Data, function (key) {
                    if (!dm.instance[wfInstanceId])
                        dm.instance[wfInstanceId] = {};

                    //流程实例全局值
                    var wfInstanceData = dm.instance[wfInstanceId];
                    if (ko.isObservable(Data[key]))
                        wfInstanceData[key] = Data[key]();
                    else
                        wfInstanceData[key] = Data[key];
                });
            },
            //释放流程注册的资源
            unRegisterDm: function (wfInstanceId) {
                delete dm.instance[wfInstanceId];
            },
            isInit: function () {
                return _initFlag;
            },
            /*初始化信息
              主要功能：1、加载Config/data下数据格式（客户信息、购物车、柜员信息、本机信息）
                        2、对Config/machine.txt下数据合并到dm.machine,对于dm.machine，存在替换，不存在添加
            */
            initDm: function () {
                require(['config/data'], function (data) {
                    //导入Config/data内容格式
                    $.extend(dm, data);

                    if (!data.hasOwnProperty("commonDisply")) {
                        dm.commonDisply = {};
                        dm.commonDisply.transTitle=ko.observable('')
                    }

                    require(['text!Config/machine.txt'], function (machineText) {
                        try {
                            var machine = JSON.parse(machineText);
                            //合并Config/machine.txt内容
                            if ($.isPlainObject(machine)) {
                                var machineKeys = Object.keys(machine);
                                machineKeys.forEach(function (key, index) {
                                    if (!dm.machine.hasOwnProperty(key)) {
                                        if ($.isPlainObject(machine[key]))
                                            dm.machine[key] = machine[key];
                                        else
                                            dm.machine[key] = ko.observable(machine[key]);
                                    }
                                    else {
                                        if ($.isPlainObject(machine[key]) && $.isPlainObject(dm.machine[key]))
                                            $.extend(dm.machine[key], machine[key]);
                                        else if ($.isFunction(dm.machine[key]))
                                            dm.machine[key](machine[key]);
                                    }
                                    if (index == machineKeys.length - 1) {
                                        _initFlag = true;
                                    }
                                });
                            } else {
                                _initFlag = true;
                            }
                        } catch (e) {
                            utility.log.error("dmInit:" + e.message);
                            _initFlag = true;
                        }

                    }, function () {
                        _initFlag = true;
                    })
                });

            }
        };
        dm.initDm();
        return dm;
    });