define(["jquery","jsRuntime/configManager"], function ($,cm) {
    var reconfig = {};
    var isCompleted, visible, configView;
    var dfd = new $.Deferred();
    reconfig.initialize = function () {
        $(window).bind("keyup",onkeyup);
        window.__updateConfigItem = function (self) {
            var name = self.name;
            var value = self.value;
            eval("cm." + name + "=value");
        }
        this.show();
        return dfd;
    }
    
    reconfig.hide = function () {
        configView.remove();
        visible = false;
    }
    reconfig.show = function () {
        if (this.isEnable === false) return;
        configs = {};
        buildConfigData(configs, cm);
        var trs = "";
        for (var n in configs) {
            if (n.indexOf("__") == 0) continue;
            trs += "<tr><td>" + n + "<td><td><input type='text' name=\"" + n + "\" value=\"" + configs[n] + "\" onblur='window.__updateConfigItem(this)' " + (isCompleted ? "readonly='readonly'" : "") + " style='width:500px;' /></td></tr>";
        }
        var html = "<div style='position:absolute;left:0;top:0;z-index:999999;overflow:auto;width:100%;background-color:#eeeeee;'><h2>修改配置</h2><i>修改Config/features.js 中reconfig的值为空该界面就不会再出现</i>";
        html += "<div>可以按 alt + C调出该界面</div>";
        html += "<table style='margin:5px;border:1px solid #999;border-collapse:collapse;' border='1'><tbody data-bind='foreach:configs'>" + trs + "</tbody></table>";
        html += "<input type='button' value='开始运行app' class='start'  /></div>";

        configView = $(html).appendTo(document.body);
        configView.height(Math.max(document.documentElement.clientHeight, document.body.clientHeight));
        $(".start", configView).click(function () {
            completeConfig();
            
        });
       
    }
    reconfig.dispose = function () {
        if (configView) configView.remove();
        $(window).unbind("keyup", onkeyup);
    }
    

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
    var completeConfig = function () {
        reconfig.hide();
        if (!isCompleted) {
            //$("input[type='text']", configView).prop("readonly", true);
            isCompleted = true;
            dfd.resolve();
        }
    }
    var onkeyup = function (e) {
        if (e.altKey && e.keyCode == 67) {
            if (visible) {
                visible = false;
                configView.remove();
            }
            else reconfig.show();
            return false;
        }
    }
    //reconfig.initialize();
    return reconfig;
   
});