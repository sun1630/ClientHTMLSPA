define(['durandal/system', 'jsRuntime/configManager', 'jsRuntime/utility'],
    function (system, cm, utility) {
        var pm = {
            //获取静态参数数据项,
            //fileName:静态参数文件名 string 型，例：fileName='province'
            //target:静态参数要赋值变量，ko对象
            //filter:是根据属性名称进行过滤，示例：filter = '($.code == 1 || $.code == 2)  && $.name="test"'  filter='$.province=="guangdong"'
            //IsProvFlag:是否分行参数，此参数可以不传，默认为全辖参数 false
            getStaticParameter: function (fileName, target, filter, IsProvFlag) {
                var _isProFlag = IsProvFlag;

                if (_isProFlag == null || _isProFlag == false)
                    _isProFlag = false;
                else
                    _isProFlag = true;

                return system.defer(function (dfd) {
                    //静态菜单
                    var basePath = cm.client.staticMenuPath; //+ cm.client.culture + '/'
                    
                    require(['jsRuntime/dataManager'], function (dm) {
                        if (!_isProFlag) {
                            basePath += cm.client.defaultCenter + "/" + cm.client.culture + '/';
                        }
                        else {
                            basePath += dm.machine.ProvPrefixNumEHR() + "/" + cm.client.culture + '/';
                        }

                        pm.log("getStaticParameter file path:" + basePath + fileName);
                        pm.log("getStaticParameter filter is:" + filter);

                        system.acquire(basePath + fileName).then(function (module) {
                            var menuItems = module[fileName];
                            if (filter) menuItems = Enumerable.From(menuItems).Where(filter).ToArray();
                            if (target)
                                ko.mapper.fromJS(menuItems, {}, target);
                            dfd.resolve(menuItems);
                        }).fail(function (err) {
                            pm.log('Failed to load  module (' + basePath + fileName + '). Not Exist Details: ' + err.message);
                            dfd.reject(err);
                        });
                    });
                }).promise();
            },
            /*
               query对象示例：{
                   'select':'RxValue,ShowString',
                   'filter':"OptionGroupName eq 'promono11032' and Culture eq 'zh-cn' and BranchNO eq 2704",
                   'orderby':'IndexNum',
                   'top':2,
                   'skip':2,
                   'inlinecount':'allpages'}
             */
            getDynamicParameter: function (menuName, target, query) {
                return system.defer(function (dfd) {
                    //参数OData地址
                    var serveParUrl = cm.services.par.url + 'parameters/' + menuName
                    pm.log('getDynamicParameter OData path:' + serveParUrl);

                    if (query) {
                        serveParUrl += "?"
                        $.each(query, function (key) {
                            serveParUrl += '&$' + key + '=' + query[key]
                        })
                    }
                    utility.httpGet(serveParUrl).done(function (data) {
                        if (target)
                            ko.mapper.fromJS(data.value, {}, target);
                        dfd.resolve(data.value);
                    }).fail(function (ex) {
                        pm.log('getDynamicParameter error:' + ex.message);
                        dfd.reject(ex);
                    });
                }).promise();
            },
            /*
               查询表值函数的方法

               query是键值对象或者查询字符串
               键值对象示例：{
                          BranchNO:2704,
                          DeviceType:'dt1',
                          Culture:'zh-cn'
                  }

               查询字符串示例："BranchNO=2704,DeviceType='dt1',Culture='zh-cn'"               

             */
            getTableValueParameter: function (menuName, target, query) {
                return system.defer(function (dfd) {
                    //参数OData地址
                    var serveParUrl = cm.services.par.url + 'parameters/' + menuName;
                    pm.log('getTableValueParameter OData path:' + serveParUrl);
                    
                    if (query) {
                        if ($.isPlainObject(query)) {
                            serveParUrl += '('
                            var index = 0;
                            $.each(query, function (key) {
                                var qvalue = null;
                                if (typeof (query[key]) == 'number')
                                    qvalue = query[key]
                                else
                                    qvalue = "'" + query[key] + "'"
                                if (index == 0) {
                                    serveParUrl += key + '=' + qvalue
                                    index++;
                                }
                                else
                                    serveParUrl += ',' + key + '=' + qvalue
                            })
                            serveParUrl += ')'
                        }
                        else
                            serveParUrl += '(' + query + ')';

                    }
                    utility.httpGet(serveParUrl).done(function (data) {
                        if (target)
                            ko.mapper.fromJS(data.value, {}, target);
                        dfd.resolve(data.value);
                    }).fail(function (ex) {
                        pm.log('getTableValueParameter error:' + ex.message);
                        dfd.reject(ex);
                    });
                }).promise();
            },

            //日志
            log: function (logStr) {
                utility.trace(logStr);
                console.log(logStr);
            }
        }
        return pm;
    });