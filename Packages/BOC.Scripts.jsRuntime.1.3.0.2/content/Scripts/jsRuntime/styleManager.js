define(['jsRuntime/configManager',"jsRuntime/utility"], function (cm,utility) {
    var linkColections = ko.observableArray([]);
    //创建Link链接
    var createCssLink = function (href) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = href;
        document.getElementsByTagName("head")[0].appendChild(link);
    };
    //替换Link链接路径
    //参数：cssName string 样式文件名，path：string 路径，type：string 取值：global、theme
    var replacePath = function (cssName, path, type) {
        var linkPath = "";
        if (type == "global") {
            linkPath = "StylesNew/Global/" + path + cssName + ".css";
        }
        else if (type == "theme") {
            linkPath = "StylesNew/Themes/" + Styler.theme + "/" + path + cssName + ".css";
        }
        return linkPath
    }

    var Styler = {
        theme: "",//当前集合中主题
        //添加样式
        //参数：href string类型，CSS路径，elementId 样式ID，可以不传
        attachCssLink: function (href, elementId) {
            if (elementId) {
                var link = document.getElementById(elementId);
                if (!link) {
                    createCssLink(href);
                } else {
                    link.href = href;
                }
            } else {
                var links = document.getElementsByTagName('link');
                for (var i = 0; i < links.length; i++) {
                    if (links[i].href && (links[i].href.indexOf(href) !== -1)) {//If we have already added this link, just ignore and return
                        return;
                    }
                }
                createCssLink(href);
            }
        },

        //删除样式
        //参数：href string类型，CSS路径，elementId 样式ID，可以不传
        detachCssLink: function (href, elementId) {
            if (elementId) {
                var link = document.getElementById(elementId);
                if (link) {
                    link.remove();
                }
            } else {
                var links = document.getElementsByTagName('link');
                for (var i = 0; i < links.length; i++) {
                    if (links[i].href && (links[i].href.indexOf(href) !== -1)) {//If we have already added this link, just ignore and return
                        links[i].remove();
                        break;
                    }
                }
            }
        },

        attachCssText: function (elementId, css) {

            var elem = document.getElementById(elementId);
            if (elem) {
                elem.parentNode.removeChild(elem);
            }

            var style = document.createElement('style');
            style.type = 'text/css';
            style.setAttribute("id", elementId);

            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            document.getElementsByTagName('head')[0].appendChild(style);

        },

        attachScopedCss: function (parent, styleText) {
            if (styleText) {
                styleElement = $("<style type='text/css' scoped='scoped'>" + styleText + "</style>");
                parent.prepend(styleElement);
            }
        },

        //批量添加样式
        //参数：cssObj：json对象，示例：{ global: ['Apperence'], theme: ['Colors', 'Images'] }
        //global:对应StylesNew/Global目录 theme：对应StylesNew/Themes目录
        //path：string型,示例：Scenarios/CS1012/
        batchAddCssLinks: function (cssObj, path) {
            if ($.isPlainObject(cssObj))
                $.each(cssObj, function (key) {
                    if ($.isArray(cssObj[key])) {
                        var cssArray = cssObj[key];
                        for (var i = 0; i < cssArray.length; i++) {
                            var cssPath = replacePath(cssArray[i], path, key);
                            if (linkColections().indexOf(cssPath) == -1) {
                                createCssLink(cssPath);
                                linkColections.push(cssPath);
                            }
                        }
                    }
                })
        },

        //批量删除样式
        //参数：cssObj：json对象，示例：{ global: ['Apperence'], theme: ['Colors', 'Images'] }
        //global:对应StylesNew/Global目录 theme：对应StylesNew/Themes目录
        //path：string型,示例：Scenarios/CS1012/
        batchDelCssLinks: function (cssObj, path) {
            if ($.isPlainObject(cssObj))
                $.each(cssObj, function (key) {
                    if ($.isArray(cssObj[key])) {
                        var cssArray = cssObj[key];
                        for (var i = 0; i < cssArray.length; i++) {
                            var cssPath = replacePath(cssArray[i], path, key);
                            if (linkColections().indexOf(cssPath) != -1) {
                                Styler.detachCssLink(cssPath);
                                linkColections.remove(cssPath);
                            }
                        }
                    }
                })
        },

        //添加/删除 分行特色默认样式
        //参数:path:string 分行交易ID  type:sting 添加或删除 取值 add,del  默认值：add
        branchDefaultCssAddOrDel: function (path,type) {
            var globalPath = "StylesNew/Global/Scenarios/" + utility.getResourcePath(path) + "Default/";
            var ThemePath = "StylesNew/Themes/" + Styler.theme + "/Scenarios/" + utility.getResourcePath(path) + "Default/";

            type = type || "add";

            //global下样式
            require([globalPath + "index"], function (index) {
                if ($.isArray(index))
                    for (var i = 0; i < index.length; i++) {
                        var cssPath = basePath + index[i] + ".css";
                        if (type == "add") {
                            Styler.attachCssLink(cssPath)
                            linkColections.push(cssPath);
                        }
                        else {
                            Styler.detachCssLink(cssPath)
                            linkColections.remove(cssPath);
                        }
                    }
            });

            //themes下样式
            require([ThemePath + "index"], function (index) {
                if ($.isArray(index))
                    for (var i = 0; i < index.length; i++) {
                        var cssPath = basePath + index[i] + ".css";
                        if (type == "add") {
                            Styler.attachCssLink(cssPath)
                            linkColections.push(cssPath);
                        }
                        else {
                            Styler.detachCssLink(cssPath)
                            linkColections.remove(cssPath);
                        }
                    }
            });
        },

        //刷新样式
        refresh: function () {
            for (var i = 0; i < linkColections().length; i++) {
                if (linkColections()[i].indexOf(Styler.theme) >= 0) {
                    var cssPath = linkColections()[i].replace(Styler.theme, cm.client.theme);
                    Styler.attachCssLink(cssPath)
                    linkColections.push(cssPath);
                    Styler.detachCssLink(linkColections()[i]);
                    linkColections.remove(linkColections()[i]);
                    Styler.theme = cm.client.theme;
                }
            }
        },

        //初始化
        initialize: function () {
            Styler.theme = cm.client.theme;
            //var basePath = "StylesNew/Themes/" + Styler.theme + "/Default/";
            //try {
            //    require([basePath + "index"], function (index) {
            //        if ($.isArray(index))
            //            for (var i = 0; i < index.length; i++) {
            //                var cssPath = basePath + index[i] + ".css";
            //                Styler.attachCssLink(cssPath)
            //                linkColections.push(cssPath);
            //            }
            //    });
            //}
            //catch (err) {
            //    console.log(err.name + ":" + err.message);
            //}
        }
    };
    Styler.initialize();
    return Styler;
});

