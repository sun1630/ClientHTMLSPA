define(["jquery", "jsRuntime/utility", 'durandal/system','jsRuntime/appBridge'], function ($, util, dsys,bridge) {
    var vconsole = {};
	var mng = new bridge.Manage();
    var isVisible = true;
    var outputType = "html";
    var fixed = true;
    var count = 0;
    
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
    
    
	var logs =[],tick = null;
	var writeLogToFile = function(){
		if(!logs.length)return;
		var t = new Date();
		var filename = t.getFullYear() + "-" + t.getMonth() + "-" + t.getDate() + "T" + t.getHours() + "." + t.getMinutes() + "." + t.getSeconds() + ".txt";
		var ctnt = "";
		for(var i =0,j=logs.length;i<j;i++){
			var log = logs[i];
			ctnt += log.Type + " " +log.Time.getTime() + "\r\n";
			var cts = log.Contents;
			for (var m = 0, n = cts.length; m < n; m++) {
			    ctnt += toJson(cts[m]) + "\r\n";
			}
			ctnt += "-----------------------------------------\r\n";
		}
		var fileObj = {
		    "filepath": "clogs/" + filename,
		    "filecontent": ctnt
		};
	    try{
	        mng.writefile(fileObj);
	    }catch(ex){
	        
	    }
		
		logs = [];
	}

	vconsole.initialize = function () {
	    var dfd = new $.Deferred();
	    $log.reset({
	        output: function (type, contents) {
	            
	            logs.push({  
	                Type: type,
	                Time: new Date(),
                    Contents:contents
	            });
	        }
	    });
	    $log.disable();
	    util.log.sys("aabbcc");
	    $log.enable("trace","error");

        if(tick) clearInterval(tick);
		tick = setInterval(writeLogToFile,1000*30);
        dfd.resolve(vconsole);
        return dfd;
    }
    
    vconsole.dispose = function () {
        if(tick) clearInterval(tick);
		tick = null;
    }
    vconsole.maxCount = 2000;
    return vconsole;
});