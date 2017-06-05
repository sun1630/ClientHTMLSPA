define(['config/services', 'config/client'],
    function (services, client) {
        var cm = {};
        cm.client = client;
        cm.services = services;

        cm.setServicesUrl = function (para) {
            if (!$.isPlainObject(cm.services))
                cm.services = {};

            $.each(para, function (index, value) {
                var item = value;

                if (cm.services.hasOwnProperty(item.ServiceName)) {
                    if ($.isPlainObject(cm.services[item.ServiceName]))
                        cm.services[item.ServiceName].url = item.ServiceAddress;
                    else {
                        cm.services[item.ServiceName] = {};
                        cm.services[item.ServiceName].url = item.ServiceAddress;
                    }
                }
                else {
                    cm.services[item.ServiceName] = {};
                    cm.services[item.ServiceName].url = item.ServiceAddress;
                }
            });

            if ($.isPlainObject(cm.services.message))
                cm.services.message.url = cm.services.msg.url;
        };

        //设置服务器默认URL
        cm.setDefaultServersUrl = function (paras) {
            var _paras = {
                "configType": "C",//端参数,必填项，可取值 C、CM、P、M 
                "provinceNo": '', //省行机构号参数，可以不传，默认为总行
                "wf": 'http://22.11.95.153:8000/',//工作流服务 
                "wq": 'http://22.11.95.161:8002/',//重空管理服务
                "msg": 'http://22.11.95.153:8030/signalr',//消息通知服务
                "content": 'http://22.11.95.153:8020/',//内容服务，协议会放到这里
                "par": 'http://22.11.95.153:8010/',//参数服务，菜单、码表会放到这里
                "ts": 'http://localhost:9101/',//终端服务
                "adfs": 'http://22.11.95.161:8001/'//单点登录
            };
            $.extend(_paras, paras);

            //总行URL默认写入
            var results = _paras//JSON.parse(window.AppHost.getManage().getConfigInfo(JSON.stringify(_paras)));

            if (results) {//results.rusult
                $.each(results, function (key) {
                    if (cm.services.hasOwnProperty(key)) {
                        cm.services[key]['url'] = results[key];
                    }
                });
                cm.services.message.url = results.msg;

                return true;
            }
            else {
                return false;
            }

        };

        //获取分行服务器URL
        cm.getProvinceServersUrl = function (paras) {
            var _paras = {
                "configType": "C",//端参数,必填项，可取值 C、CM、P、M 
                "provinceNo": '', //省行机构号参数，可以不传，默认为总行
                "wf": '',//工作流服务 
                "wq": '',//重空管理服务
                "msg": '',//消息通知服务
                "content": '',//内容服务，协议会放到这里
                "par": '',//参数服务，菜单、码表会放到这里
                "ts": '',//终端服务
                "adfs": ''//单点登录
            };
            $.extend(_paras, paras);


            return results = JSON.parse(window.AppHost.getManage().getConfigInfo(JSON.stringify(_paras)));
        };

        cm.getimagePath = function () {
            var baseUrl = '/Styles/Themes/';
            //if (window.AppHost)
            //    baseUrl = 'ms-appx-web:///Assets/Styles/Themes/';
            return baseUrl;
        }
        cm.getAudioPath = function () { }
        cm.getVideoPath = function () { }

        cm.mode = function () { return client.mode; }

        cm.userId = function () { return cm.client.userId; }
        //获取消息服务的地址,每个营业厅可能不一样
        //cm.messageUrl = function () { return services.msg.url; }
        //获取到远程通信的配置
        cm.messageOpts = function () {
            return services.message;
        }

        cm.workflow = function () {
            return services.wf;
        }
        var _isInit = false;
        cm.isInited = function () {
            return _isInit;
        }
        //初始化configManager
        cm.initCm = function () {
            require(['text!Config/machine.txt'], function (macStr) {
                try {
                    var machine = JSON.parse(macStr);
                    cm.client = $.extend(cm.client, machine);
                    _isInit = true;
                }
                catch (err) {
                    _isInit = true;
                }
            }, function () {
                _isInit = true;
            });
        }
        cm.initCm();

        return cm;
    });