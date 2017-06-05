define(["jquery", "jsRuntime/utility", 'durandal/system'], function ($, util, dsys) {
    var vconsole = {};
    var isVisible = true;
    var outputType = "html";
    var fixed = true;
    var count = 0;
    var htmlEncode = function (txt) {
        if (txt === null || txt === undefined) return "";
        return txt.toString().replace(/&/g, "&amp").replace(/ /g, "&nbsp;").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
    }
    var otoString = Object.prototype.toString;
    var toJson = function (obj, tabs, existed) {
        if (tabs && tabs.length > 5) return;
        if (!existed) existed = [];
        if (obj === null) return "null";
        if (obj === undefined) return "undefined";
        if (obj instanceof Error) {
            return "{message:\"" + obj.message + "\",\n" + tabs + "stack:" + obj.stack + "\n" + tabs + "}\n";
        }
        var t = typeof obj;
        if (t === 'function') return;
        if (t === 'string') {
            var retVal = obj;
            if (retVal.length > 200) retVal = retVal.substr(0, 200);
            retVal = retVal.replace(/"/g, "\\\"")
            return "\"" + retVal + "\"";
        }
        tabs || (tabs = "");
        if (t === "object") {
            if (obj === null) return "null";
            if (obj == window) return "[window]";
            if (obj == document) return "[document]";
            if (obj.nodeType !== undefined) {
                if (!obj.tagName) return obj.innerText || "";
                var s = obj.tagName;
                if (obj.id) s += "#" + obj.id;
                if (obj.className) s += "." + obj.className.replace(/ /g, ".");
                return "[" + s + "]";
            }
            for (var m = 0, n = existed.length; m < n; m++) {
                if (existed[m] === obj) return "[Cuit ref]";
            }


            if (obj.innerHTML) return;
            existed.push(obj);
            var objType = Object.prototype.toString.call(obj);
            if (Object.prototype.toString.call(obj) === '[object Array]') {
                if (obj.length === 0) return "[]";
                var txt = "[", at = 0;
                subTabs = tabs + "\t";

                for (var i = 0, j = obj.length; i < j; i++) {
                    var v = toJson(obj[i], subTabs);
                    if (v === undefined) continue;
                    if (at != 0) {
                        txt += "," + v;
                    } else txt += v;
                    at++;
                }
                txt += "]";
                return txt;
            } else {
                var txt = "{\n" + tabs, at = 0;
                var subTabs = tabs + "\t";
                for (var n in obj) {
                    var v = toJson(obj[n], subTabs);
                    if (v === undefined) continue;
                    if (at != 0) {
                        txt += ",\"" + n.replace(/"/g, "\\\"") + "\":";
                        txt += v + "\n" + tabs;
                    } else {
                        txt += "\"" + n.replace(/"/g, "\\\"") + "\":";
                        txt += v + "\n" + tabs;
                    }
                    at++;
                }
                txt += "}\n" + tabs;
                return txt;
            }
        }
        return obj.toString();
    }
    var consoleAsHtml = function (consoleCtnr) {
        consoleElem = consoleCtnr[0].firstChild;
        var exists = "";
        if (outputType === 'text') {
            exists = htmlEncode(consoleElem.value);
        }
        consoleCtnr.html("<div style='width:100%;' class='console'>" + exists + "</div>");
        consoleElem = consoleCtnr[0].firstChild;

        $log.reset({
            output: function (type, contents) {
                if (count++ > vconsole.maxCount) {
                    consoleElem.innerHTML = "";
                    count = 0;
                }
                var divp = document.createElement("div"), color = "#000";
                switch (type) {
                    case "##debug": color = "#000"; break;
                    case "##sys": color = "yellow"; break;
                    case "##info": color = "lightblue"; break;
                    case "##activity": color = "pink"; break;
                    case "##notice": color = "#ffffff"; break;
                    case "##ok": color = "green"; break; //#ffffff"
                    case "##warn": color = "orange"; break;
                    case "##error": color = "red"; break;
                }
                divp.style.cssText = "user-select:text;border-bottom:1px dashed #dfdfdf;margin-bottom:8px;clear:both;color:" + color;
                for (var i = 0, j = contents.length; i < j; i++) {
                    var div = document.createElement("div");
                    //-moz-user-select:none;/*火狐*/
                    //-webkit-user-select:none;/*webkit浏览器*/
                    //-ms-user-select:none;/*IE10*/
                    //-khtml-user-select:none;/*早期浏览器*/
                    // user-select:none;
                    div.style.cssText = "user-select:text;word-break:break-word;float:left;padding:2px 5px;color:" + color;
                    var content = contents[i];
                    if (content === null) content = "null";
                    else if (content === 'undefined') content = "undefined";
                    else if (typeof content === "object") { content = htmlEncode(toJson(content)); }
                    else content = htmlEncode(content);
                    div.innerHTML = content;
                    divp.appendChild(div);
                }
                if (!consoleElem.firstChild) consoleElem.appendChild(divp);
                else consoleElem.insertBefore(divp, consoleElem.firstChild);
                //consoleElem.scrollTop = consoleElem.scrollHeight;
            }
        });

        dsys.log = $log.sys;
        dsys.error = $log.error;
    }
    var consoleAsText = function (consoleCtnr) {
        if (count++ > vconsole.maxCount) {
            consoleElem.innerHTML = "";
            count = 0;
        }
        consoleElem = consoleCtnr[0].firstChild;
        var exists = "";
        if (outputType === 'html') {
            exists = consoleElem.innerText;
        }

        consoleCtnr.html("<textarea class='console' style='width:100%;height:399px;border:1px solid black;'>" + exists + "</textarea>");
        consoleElem = consoleCtnr[0].firstChild;
        $log.reset({
            output: function (type, contents) {
                for (var i = 0, j = contents.length; i < j; i++) {
                    var content = contents[i];
                    if (content === null) content = "null";
                    else if (content === 'undefined') content = "undefined";
                    else if (typeof content === "object") { content = toJson(content); }
                    //else content = htmlEncode(content);
                    consoleElem.value += content + "\n";
                    consoleElem.scrollTop = consoleElem.scrollHeight;
                }

            }
        });
        dsys.log = $log.sys;
        dsys.error = $log.error;
    }
    vconsole.initialize = function () {
        var dfd = new $.Deferred();
        var html = "<div style='user-select:text;z-index:999999;position:fixed;right:10px;bottom:10px;width:640px;background-color:#333;font-size:12px;'>"
        html += "<div class='action' style='height:20px;'><span style='font-size:16px;font-weight:bold;'>虚拟控制台</span><textarea style='height:20px; width:500px;position:absolute;left:100px;font-size:14px;' class='command'></textarea></div>"
        html += "<div class='consoleCtnr' style='width:100%;height:400px;font-size:14px;border:1px solid black;overflow:auto;background-color:#999;user-select:text;'><div  class='console'></div></div>";
        html += "</div>";
        this.fixed = function () {
            fixed = true;
        }
        this.unfixed = function () {
            fixed = false;
        }
        this.clear = function () {
            $(".console", ctnr).val("");
            $(".console", ctnr).html("");
            count = 0;
        }
        this.hide = function () {
            isVisible = false;
            ctnr.remove();
        }
        this.show = function () {
            isVisible = true;
            ctnr.appendTo(document.body);
        }
        this.outputType = function (v) {
            if (v === undefined) return outputType;

            if (v === 'html') { consoleAsHtml($(".consoleCtnr", ctnr)); outputType = "html"; }
            if (v === 'text') { consoleAsText($(".consoleCtnr", ctnr)); outputType = "text"; }
        }

        ctnr = $(html).mouseover(function () {
            if (!fixed) $(this).css("right", 0).css("bottom", 0);
        }).mouseout(function () { if (!fixed) $(this).css("right", -500).css("bottom", -200); });
        var cmd = $(".command", ctnr);

        cmd.keydown(function (evt) {
            var c = evt.keyCode;
            if (c == 13) {
                if (evt.ctrlKey) {
                    try {
                        exec();
                    } catch (ex) {
                        $log("##error", ex);
                    }
                    cmd.css("height", "20px");
                } else {
                    var h = parseInt(cmd.css("height")) || 0;
                    h += 15;
                    if (h > 400) h = 400;
                    cmd.css("height", h);
                }
            }
        });
        var exec = function () {
            var cmdtxt = $.trim(cmd.val());
            if (cmdtxt.match(/^::/g)) {
                var cmdtxt = "vconsole." + cmdtxt.substr(2);
                if (!cmdtxt.match(/\)$/g)) cmdtxt += "()";
            }
            $log(cmdtxt);
            eval(cmdtxt);
            cmd.val("");
        }
        var consoleCtnr = $(".consoleCtnr", ctnr);
        consoleAsHtml(consoleCtnr);


        ctnr.appendTo(document.body);
        $(window).bind("keydown", onkeydown);
        dfd.resolve(vconsole);
        return dfd;
    }
    var onkeydown = function (evt) {
        if (evt.keyCode == 67 && evt.altKey) {
            if (isVisible) vconsole.hide();
            else vconsole.show();
        };
    }
    vconsole.dispose = function () {
        $(window).unbind("keydown", onkeydown);
        ctnr.remove();
        this.isDisposed = true;
        dsys.error = dsys.log = function () {
            try { console.log.apply(console, arguments); } catch (ignore) { }
        }
        return this;
    }
    vconsole.maxCount = 2000;
    return vconsole;
});