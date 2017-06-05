define(['knockout', 'jsRuntime/common', 'jsRuntime/configManager'],
    $once("devalopment",function (ko , common, cm) {
    
    var features = $singleon("features", {});
    var innerData = {}; var visible = false;
    //允许重配置
    features.reconfig = function (dfd) {
        var isCompleted = false;
        var rcfg = {};
        rcfg.showView = function () {
            visible = true;
            //var hostView = $("#applicationHost").hide();
            var buildConfigData = function (cfgData, item, base) {
                base || (base = "");
                for (var n in item) {
                    if (n.indexOf("__") == 0) continue;
                    var value = item[n], path = base ? base + "." + n : n;
                    if (typeof value === 'function') continue;
                    else if (typeof value === 'object') buildConfigData(cfgData, value, path);
                    else {
                        cfgData[path] = value;
                    }
                }
                return cfgData;
            }

            configs = {};

            buildConfigData(configs, cm);
            var completeConfig = function () {
                visible = false;
                configView.remove();
                
                if (!isCompleted) {
                    //$("input[type='text']", configView).prop("readonly", true);
                    $(window).keyup(function (e) {
                        if (e.altKey && e.keyCode == 67) {
                            if (visible) {
                                visible = false;
                                configView.remove();
                            }
                            else rcfg.showView();
                            return false;
                        }
                    });
                    isCompleted = true;

                    dfd.resolve();
                }
            }

            var trs = "";
            for (var n in configs) {
                if (n.indexOf("__") == 0) continue;
                trs += "<tr><td>" + n + "<td><td><input type='text' name=\"" + n + "\" value=\"" + configs[n] + "\" onblur='window.__updateConfigItem(this)' " + (isCompleted ? "readonly='readonly'" : "") + " style='width:500px;' /></td></tr>";
            }
            var html = "<div style='position:absolute;left:0;top:0;z-index:999999;overflow:auto;width:100%;background-color:#eeeeee;'><h2>修改配置</h2><i>修改Config/features.js 中reconfig的值为空该界面就不会再出现</i>";
            html += "<div>可以按 alt + C调出该界面</div>";
            html += "<table style='margin:5px;border:1px solid #999;border-collapse:collapse;' border='1'><tbody data-bind='foreach:configs'>" + trs + "</tbody></table>";
            html += "<input type='button' value='开始运行app' class='start'  /></div>";

            var configView = $(html).appendTo(document.body);
			configView.height(Math.max(document.documentElement.clientHeight,document.body.clientHeight));
            $(".start", configView).click(function () {
                completeConfig();
                dfd.resolve();
            });
            window.__updateConfigItem = function (self) {
                var name = self.name;
                var value = self.value;
                eval("cm." + name + "=value");
            }
        }
        rcfg.showView();
        //dfd.resolve();

        return dfd;
    }
    features.vconsole = function (dfd) {
        $watch_var = window.$watch_var = function (name, obj) { $watch_var[name] = obj; }
        var html = "<div style='z-index:999999999;position:fixed;right:0px;bottom:0px;width:640px;background-color:#999999;font-size:12px;'><div style='font-size:12px;'><h4>虚拟控制台</h4><i style='font-size:10px;'>修改Config/features.js 中vconsole  =false可以关闭该功能</i>";
        html += "<div style='font-size:12px;'>可以按  alt + L 调出/隐藏该界面</div></div>";
        html += "<div><textarea style='width:100%;height:200px;'></textarea><textarea style='width:100%;height:200px;display:none;'></textarea>";
        html += "<select><option selected='selected' value='console'>console</option><option value='eval'>eval</option></select><input type='button' class='clear' value='clear' /><input type='checkbox' checked='checked' class='fixed' />Fixed</div></div>";

        var ctnr = $(html).mouseover(function () {
            if (!fixed) $(this).css("right", 0).css("bottom", 0);
        }).mouseout(function () { if (!fixed) $(this).css("right", -600).css("bottom", -200); });
        var clearBtn = $(".clear", ctnr);
        var fixedBtn = $(".fixed", ctnr);
        var fixed = fixedBtn.prop("checked");
        var cnt = ctnr[0].lastChild;
        var console = cnt.childNodes[0];
        var evalCode = cnt.childNodes[1];
        var switchSel = cnt.childNodes[2];
        window.$log = function (obj) {
            for (var i = 0, j = arguments.length; i < j; i++) {
                var content = arguments[i];
                var t = typeof content;
                if (t === 'object') content = JSON.stringify(content);
                console.value += content + "\n";
            }
            
            console.scrollTop = console.offsetHeight;
        }
        $(switchSel).change(function () {
            if ($(this).val() === 'console') {
                $(console).show(); $(evalCode).hide();
                clearBtn.val("clear");
            } else {
                $(console).hide(); $(evalCode).show();
                clearBtn.val("eval");
            }
        });
        $(clearBtn).click(function () {
            if ($(switchSel).val() === 'console') { $(console).val(""); return;}
            var code = $(evalCode).val();
            try { eval(code); } catch (e) {
                console.value += e + "\n";
            }

        });

        $(window).keyup(function (e) {

            if (e.altKey && e.keyCode == 76) {
                ctnr.toggle();
                return false;
            }

        });
        fixedBtn.click(function () { fixed = $(this).prop("checked"); if (!fixed) $(this).css("right", 0).css("bottom", 0); });
        ctnr.appendTo(document.body);
        return dfd.resolve();
    }
}));