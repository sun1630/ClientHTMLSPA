define(["require", "jsRuntime/communication", "jsRuntime/configManager", "jsRuntime/utility"], function (require, Communication, cm, util,am) {
    var msgSvc = new $.Deferred();
    var comm;
    var install = function (opts) {
        comm = msgSvc.communication = $.communication = new Communication();
        comm.PackageWrapper = Package;
        //如果是devalopment模式，就启动跟踪日志 
        comm.init(opts, cm.mode() === 'devalopment' ? $log : null);
        comm.subscribe("comm.disconnected", function () {
            //短线重连
            setTimeout(function () { comm.connect(); }, 2000);
        });
        //comm.AppId = function () { return cm.deviceType(); }
        //comm.UserId = function () { return cm.userId(); }

        comm.makePackage = function (data) {
            var pack;
            if (data) {
                if (data.__rawPackageData) return new Package(data.__rawPackageData, this);
                if (data.isPackageCollection) return data;
            }
            data || (data || {});
            var c = data.H.C;
            var cs = c.split(",");
            if (cs.length > 1) {
                var ret = []; ret.isPackageCollection = true;
                for (var i = 0, j = cs.length; i < j; i++) {
                    var cate = cs[i];
                    var p = new Package(data, this, cate, data.B[cate]);
                    ret.push(p);
                }
                return ret;
            }
            pack = new Package(data || {}, this,c,data.B);
            return pack.FromAppId(this.qs.AppId).FromUserId(this.qs.UserId).Level(1);
        }


        msgSvc.resolve(msgSvc);
    }
    msgSvc.initialize = function () {
        var opts = cm.messageOpts();
        var uri = opts.url + "/hubs";
        util.trace("require hub:", uri);
        require([uri], function () {
            util.trace("hub is ok,initializing communication..");
            install(opts);
        });
        return msgSvc;
    }
    msgSvc.enable = function (val) {
        var dfd = new $.Deferred();
        if (val === false) {
            comm.disconnect();
            this.isEnabled = false;
            dfd.resolve();
            return dfd;
        }
        if (this.isEnabled) return dfd.resolve();
        msgSvc.done(function () {
            comm.connect().done(function () {
                util.trace("communication is connected. message service enabled.");
                dfd.resolve(comm);
            });
        });
        this.isEnabled = true;
        return dfd;
    }

    msgSvc.dispose = function () {
        comm.disconnect();
        msgSvc.reject();
        this.isDisposed = true;
    }
    msgSvc.communication = comm;

    msgSvc.subscribe = function (evt, cb) {
        comm.subscribe(evt, cb); return this;
    }
    msgSvc.unsubscribe = function (evt, cb) {
        comm.unsubscribe(evt, cb); return this;
    }
    msgSvc.emit = function (evt, args) {
        comm.emit(evt, args); return this;
    }
    msgSvc.makePackage = function (data) {
        return comm.makePackage(data);
    }
    //本文件初始化全局的通信对象

    var Package = function (data, comm , category,body) {
        this.__communication = comm;
        this.__category = category;
        this.__body = body;
        this.__rawPackageData = data || {};
    }
    Package.prototype = {
        raw: function () { return this.__rawPackageData; },
        Body: function (value) {
            if (value === undefined) {
                if (this.__body) return this.__body;
                return this.__rawPackageData.B;
            }
                
            this.__body = this .__rawPackageData.B  = value;
        }
        , Id: function (value) {
            if (value === undefined) return this.__rawPackageData.H ? this.__rawPackageData.H.I : undefined;
            (this.__rawPackageData.H || (this.__rawPackageData.H = {})).I = value;
            return this;
        }
        , Category: function (value) {
            if (value === undefined) {
                if (this.__category) return this.__category;
                return this.__rawPackageData.H ? this.__rawPackageData.H.C : undefined;
            }
            this.__category = (this.__rawPackageData.H || (this.__rawPackageData.H = {})).C = value;
            return this;
        }
        , FromUserId: function (value) {
            if (value === undefined) return this.__rawPackageData.H ? (this.__rawPackageData.H.F ? this.__rawPackageData.H.F.U : undefined) : undefined;
            var Head = (this.__rawPackageData.H || (this.__rawPackageData.H = {}));
            (Head.F || (Head.F = {})).U = value;
            return this;
        }
        , FromAppId: function (value) {
            if (value === undefined) return this.__rawPackageData.H ? (this.__rawPackageData.H.F ? this.__rawPackageData.H.F.A : undefined) : undefined;
            var Head = (this.__rawPackageData.H || (this.__rawPackageData.H = {}));
            (Head.F || (Head.F = {})).U = value;
            return this;
        }
        , ToAppId: function (value) {
            if (value === undefined) return this.__rawPackageData.H ? (this.__rawPackageData.H.T ? this.__rawPackageData.H.T.A : undefined) : undefined;
            var Head = (this.__rawPackageData.H || (this.__rawPackageData.H = {}));
            (Head.T || (Head.T = {})).A = value;
            return this;
        }
        , ToUserIds: function (value) {
            if (value === undefined) return this.__rawPackageData.H ? (this.__rawPackageData.H.T ? this.__rawPackageData.H.T.U : undefined) : undefined;
            var Head = (this.__rawPackageData.H || (this.__rawPackageData.H = {}));
            (Head.T || (Head.T = {})).U = value;
            return this;
        }
        , AddRecieverId: function (value) {
            var Head = (this.__rawPackageData.H || (this.__rawPackageData.H = {}));
            var ids = (Head.T || (Head.T = {})).U;
            if (!ids) ids = Head.T.U = [];
            ids.push(value);
            return this;
        }
        , Level: function (value) {
            if (value === undefined) return this.__rawPackageData.H ? this.__rawPackageData.H.L : undefined;
            (this.__rawPackageData.H || (this.__rawPackageData.H = {})).L = value;
            return this;
        }
        , ToJson: function () {
            return JSON.stringify(this.__data);
        }
    };

    return msgSvc;
});