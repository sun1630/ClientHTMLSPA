/// name : Featuref
/// author: yiy@microsoft.com
/// date : 16-06-02 15:31
/// description : feature的加载机制。
/// usage:
/// 得到该feature的instance feature("myfeature"): 
/// 配置/加载 ：feature.config({
///     "feature1": {enable:false, path:'features/f1'} //加载feature1,但是不启用
///     "feature2": {path:'features/f2'} //加载feature2,默认是启用的
///     "feature3": {disable:true} //禁用掉feature3 ,如果该feature在其他地方已经启动
/// });
/// 把某个feature直接集成进去 feature.config(function(){
///     this.install = function(){}
///     this.name = 'feature4';
///});
define(["require", "jquery"], function (require) {
    
    var feature = function (name) {
        var result = features[name];
        if (!result) throw "Feature[" + name + "] is not imported.";
        //if (!result.instance) throw "Feature[" + name + "] has no instance,maybe it is not intialized yet.";
        
        return result;
    }
    var features = feature.__features = {};

    var Feature = function (name) {
        this.name = name;
        var dfd = this.__dfd = new $.Deferred();
    }
    Feature.prototype = {
        enable: function () {

            var dfd = new $.Deferred();
            var self = this;
            this.done(function (v) {
                if (self.instance && self.instance.enable) {
                    self.instance.enable().done(function (val) { dfd.resolve(self.instance); });
                } else dfd.resolve(self.instance);
            });
            return dfd;
        },
        then: function (done, fail, change) { this.__dfd.then(this.isDisposed?undefined:done, fail, change); return this; },
        done: function (done) { if(!this.isDisposed)this.__dfd.done(done); return this; },
        fail: function (fail) { if (this.isDisposed)fail.call(this,"disposed"); this.__dfd.fail(fail); return this; },
        dispose: function () {
            this.isDisposed = true;
            this.then = this.done = this.fail = function () { throw "disposed"; }
            this.dispose = function () { }
            var inst = this.instance;
            this.instance = undefined;
            try {
                if (inst && typeof inst.dispose === 'function') {
                    inst.dispose();
                } else {
                    feature.log("Feature[" + this.name + "] try to dispose but instance has not dispose function.");
                }
            } catch (ex) {
                feature.log("Feature[" + this.name + "] tried to dispose but something was wrong:" + ex);
            }
        }
    }

    var g_loaders=[],loadingTick;
    var loadFeature = function (opts) {
        if (!loadingTick) {
            loadingTick = setTimeout(function(){
                internalLoad(g_loaders);
                g_loaders = [];
            }, 1);
        }
        var priority = opts.priority || (priority=0);
        var loader = g_loaders[priority] || (g_loaders[priority] = {});
        loader[opts.name] = opts;
    }
    var internalLoad = function (loaders) {
        while (true) {
            var len = loaders.length; if (len == 0) break;
            var loader = loaders.pop(); loaders.length = --len;
            if (loader) break;
            if (loaders.length == 0) break;
        }
        
        if (loaders.length==0) {
            if (g_loaders.length) {
                loadingTick = setTimeout(function () {
                    internalLoad(g_loaders);
                    g_loaders = [];
                }, 1);
            } else loadingTick = 0;
            
        }
        if (!loader) return;
        var reqs = [], names = [];var t_count =1;
        for (var n in loader) {
            var opts = loader[n];
            if (opts.feature.isDisposed) {
                feature.log("Feature[" + opts.name + "] is disposed, ignore to load.");
                continue;
            }
            if (opts.feature.isLoaded || opts.feature.isLoading) {
                feature.log("Feature[" + opts.name + "] is loaded, ignore to load[" + opts.url + "].");
                continue;
            }
            
            (function (opts, feature) {
                if (opts.instance) {
                    opts.feature.isLoaded = true; opts.feature.isLoading = false;
                    if (opts.instance.initialize) {
                        t_count++;
                        opts.instance.initialize().done(function () {
                            feature.__dfd.resolve(feature.instance = opts.instance);
                            if (--t_count == 0) internalLoad(loaders);
                        });
                    } 
                } else {
                    t_count++;
                    opts.feature.isLoading = true;
                    reqs.push(opts.path);
                    names.push(opts.name);
                }
            })(opts, opts.feature);
        }
        if (reqs.length) {
            require(reqs, function () {
                for (var i = 0, j = arguments.length; i < j; i++) {
                    var name = names[i];
                    var opts = loader[name];
                    var instance = arguments[i];
                    opts.feature.instance = instance;
                    opts.feature.isLoading = false;
                    t_count--;
                    if (opts.feature.isDisposed) {
                        opts.feature.dispose();
                        continue;
                    } else if (opts.feature.isLoaded) {
                        feature.log("Feature[" + opts.name + "] is loaded twice..");
                        continue;
                    } else {
                        opts.feature.isLoaded = true;
                    }

                    (function (opts, instance) {
                        if (instance && instance.initialize) {
                            t_count++;
                            instance.initialize().done(function () {
                                opts.feature.__dfd.resolve(instance);
                                if (--t_count == 0) internalLoad(loaders);
                            });
                        } else {
                            opts.feature.__dfd.resolve(instance);
                            
                        }
                    })(opts, instance); 
                }
                
                if (t_count == 0) internalLoad(loaders);
            });
        }
        if (--t_count == 0) internalLoad(loaders);
    }

    feature.config = function (name,cfgs) {
        if (cfgs === undefined) { var t = cfgs; cfgs = name; cfgs.name = (t || "").toLowerCase();}
        if (typeof cfgs.initialize ==='function' && typeof cfgs.dispose ==='function' ) {
            var feature = features[name] || (features[name] = new Feature(name));
            var opts = {
                priority: feature.priority || cfgs.priority || 5,
                instance: cfgs,
                name: cfgs.name,
                feature: feature
            };
            loadFeature(opts);
            return this;
        }
        //该for 会填充reqs(需要动态载入的feature的paths,与该feature的enable开关)
        for (var n in cfgs) {
            if (n === '__moduleId__') continue;
            var name = (n || "").toLowerCase(), opts = cfgs[n], feature = features[name] || (features[name] = new Feature(name));
            
            //要求禁用
            if (opts === false || opts.disable === true) {
                if (feature.isDisposed) continue;
                if (feature.isLoaded) {
                    feature.dispose();
                } else {
                    feature.isDisposed = true;
                    feature.log("Feature[" + n + "] is marked as disposed.");
                }
                continue;
            }

            //准备加载gotoLoads
             
            if (typeof opts === 'string') opts = { path: opts, name: name, priority: 0, feature: feature };
            else opts = $.extend({}, opts);
            if (!opts.path) continue;
            opts.feature = feature;
            opts.name = name;
            loadFeature(opts);
            
        }
    }
    feature.loadConfigs = function (_urls) {
        var urls;
        if (typeof _urls === 'string') urls = arguments;
        else urls = _urls;
        require(urls, function () {
            for (var i = 0, j = arguments.length; i < j; i++) {
                feature.config(arguments[i]);
            }
        });
    }

    
    feature.log = function () { try { console.log.apply(console,arguments); } catch (ex) { } };
    define("feature", function () { return feature; });
    return feature;
});