define(["Scripts/jquery.signalR-2.2.0.min"], function () {
    var Communication = function (opts, log) {
        if (opts) this.init(opts, log);
    }
    Communication.prototype = {
        init: function (opts, log) {

            this.qs = $.extend({}, Communication.opts.qs, opts.qs);
            var opts = this.opts = $.extend({}, Communication.opts, opts);
            this.url(opts.url || "");
            this.log = log || $log;//function () { try { console.log.apply(console, arguments); } catch (ex) { } };
            var recieverName = opts.recieverName || "onMessage";
            var me = this;
            var hub = $.connection[opts.hubName || "messageHub"];
            hub.client[recieverName] = function (messageLevelId, messageId, messageInfo) {
                me.log.sys("message arrived:", messageId,messageInfo);
                me.log.trace("message arrived: mid=>",messageId);
                //如果messageLevelId == 1表示是离线消息，需要再调用server端的方法updateMessageReceived更新消息的状态标识消息已被客户端成功接收
                if (messageLevelId == 1 || messageLevelId == 2)
                    hub.server.updateMessageReceived(me.qs.AppId, me.qs.UserId, messageId);
                // 此处添加收到消息之后客户端自己的处理逻辑
                
                var raw = JSON.parse(messageInfo);
                me.log.trace("message head=>", raw.H);
                var pack = me.makePackage ? me.makePackage(raw) : new me.PackageWrapper(raw);

                if (pack.isPackageCollection) {
                    for (var i = 0, j = pack.length; i < j; i++) {
                        var p = pack[i];
                        me.emit(p.Category(), p.Body(), pack, raw);
                    }
                } else {
                    me.emit(pack.Category(), pack.Body(), pack, raw);
                } 
            };
            hub.client.onSystemMessage = function(code,content){
                me.emit("comm.sys", content,code);
            }
            
            $.connection.hub.disconnected(function () {
                me.log.trace("signalr is disconnected.");
                me.emit("comm.disconnected",me);
            });

            this.init = function () { throw "Invalid Operation. Already initial."; }
        }
        , connect: function () {
            var dfd = $.Deferred(), me = this;
            var qs = $.connection.hub.qs = this.qs;
            this.log.trace("signalr is connecting:", this.url(),qs);
            $.connection.hub.start().done(function () {
                me.isConnected = true;
                var args = { opts: this.opts, qs: qs, url: me.url() };
                me.log.trace("signalr is connected.", args);
                me.emit("comm.connected", args);
                dfd.resolve();
            })
            .fail(function (e,ex,msg) {
                me.log.error("connect fail:",e,ex,msg);
                //throw e;
                dfd.reject();
            });
            return dfd.promise();
        }
        , disconnect: function () {
            if (!this.isConnected) return this;
            this.hub.stop();
            this.isConnected = false;
            this.log.trace("signalr is disconnected");
            this.communication.emit("comm.disconnected");
            
            return this;
        }

        , subscribe: function (evt, cb) {
            var subscribes = this._subscribes || (this._subscribes = {});
            var evts = subscribes[evt] || (subscribes[evt] = []);
            evts.push(cb);
            return this;
        }
        , url: function (value) {
            if (value === undefined) return $.connection.hub.url;
            $.connection.hub.url = value;
            return this;
        }
        , unsubscribe: function (evt, cb) {
            var subscribes = this._subscribes; if (!subscribes) return this;
            var evts = subscribes[evt]; if (!evts) return this;
            var fn;
            for (var i = 0, j = evts.length; i < j; i++) if ((fn = evts.shift()) !== fn) evts.push(fn);
            return this;
        }
        , emit: function (evt, body, raw) {
            var subscribes = this._subscribes; if (!subscribes) return this;
            var evts = subscribes[evt]; if (!evts) return this;
            for (var i = 0, j = evts.length; i < j; i++) evts[i].call(this, body, raw);
            return this;
        }
        , recieved: function (fn, rmv) {
            if (rmv) return this.unsubscribe("comm.recieved", fn);
            return this.subscribe("comm.recieved", fn);
        }
        , connected: function (fn, rmv) {
            if (rmv) return this.unsubscribe("comm.connected", fn);
            return this.subscribe("comm.connected", fn);
        }
        , disconnected: function (fn, rmv) {
            if (rmv) return this.unsubscribe("comm.disconnected", fn);
            return this.subscribe("comm.disconnected", fn);
        }

        , AppId: function () { return "C"; }
        , UserId: function () { return "C-USR-01"; }
    };
    Communication.opts = {
        recieveName: "onMessage",
        hubName: "communicationHub",
        sendName: "dispachPackage",
        qs: {}
    };

    return Communication;
});

