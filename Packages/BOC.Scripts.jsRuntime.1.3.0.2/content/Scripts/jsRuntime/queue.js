define(["knockout"], function (ko) {
    var Queue = function (type, template) {
        this.isQueue = true;
        if (type !== undefined) this.init(type, template);
    }
    Queue.prototype = {
        init: function (type, template) {
            var data = this.data = [];
            this.observableArray = ko.observableArray(data);

            this.count = ko.observable(0);
            switch (type) {
                case "queue": this.pop = this.push = function () { throw "invalid operation"; };
                    this.add = this.enqueue;
                    break;
                case "stack":
                    this.enqueue = this.dequeue = function () { throw "invalid operation"; }; break;
                    this.add = this.push;
                default: this.pop = this.push = this.enqueue = this.dequeue = function () { throw "invalid operation"; }; break;
            }
            this.init = function () { throw "already initial."; }
            if (template) {
                var me = this;
                this.__template = template;
                this.__first = function () { return me.data[0]; }
                this.__last = function () { return m.data[me.data.length - 1]; }
                for (var n in template) {
                    var val = template[n];
                    if (typeof val === 'function') {
                        (function (name, me, accessor) {
                            me.__first[name] = ko.pureComputed({
                                read: function () {
                                    return accessor.call(this);
                                },
                                write: function (value) {
                                    accessor.call(this, value);
                                },
                                owner: me.__first
                            });
                            me.__last[name] = ko.pureComputed({
                                read: function () {
                                    return accessor.call(this);
                                },
                                write: function (value) {
                                    accessor.call(this, value);
                                },
                                owner: me.__last
                            });
                        })(n, me, val);
                    } else {
                        this.__first[n] = ko.observable();
                        this.__last[n] = ko.observable();
                    }

                }
            }
            return this;
        }
        , last: function (value, onlyNotice) {
            var me = this;
            if (value !== undefined) {
                if (typeof value !== 'object') throw "only object can be last";
                if (!onlyNotice) me.data[me.data.length - 1] = value;
                for (var n in this.__last) {
                    var ob = this.__last[n];
                    if (!ob || typeof ob !== 'function' || !ob.subscribe) continue;
                    //if (!ob) ob = this.__first[n] = ko.observable();
                    ob(value[n]);
                }
                if (me.data.length == 1) {
                    for (var n in this.__first) {
                        var ob = this.__first[n];
                        if (!ob || typeof ob !== 'function' || !ob.subscribe) continue;
                        //if (!ob) ob = this.__first[n] = ko.observable();
                        ob(value[n]);
                    }
                }
                if (this.__items) {
                    var vitem = this.__items[me.data.length - 1];
                    if (vitem) vitem.call(vitem, value, onlyNotice);
                }
                return this;
            }
            return this.__last || (this.__last = function () { return me.data[me.data.length - 1]; });
        }
        , first: function (value, onlyNotice) {
            var me = this;
            if (value !== undefined) {
                if (typeof value !== 'object') throw "only object can be first";

                if (!onlyNotice) this.data[0] = value;
                for (var n in this.__first) {
                    var ob = this.__first[n];
                    if (!ob || typeof ob !== 'function' || !ob.subscribe) continue;
                    //if (!ob) ob = this.__first[n] = ko.observable();
                    ob(value[n]);
                }
                if (me.data.length == 1) {
                    for (var n in this.__last) {
                        var ob = this.__last[n];
                        if (!ob || typeof ob !== 'function' || !ob.subscribe) continue;
                        //if (!ob) ob = this.__first[n] = ko.observable();
                        ob(value[n]);
                    }
                }

                if (this.__items) {
                    var vitem = this.__items[0];
                    if (vitem) vitem.call(vitem, value, onlyNotice);
                }
                return this;
            }
            return this.__first || (this.__first = function () { return me.data[0]; });
        }
        , item: function (index, value) {
            var items = this.__items || (this.__items = {});
            if (value === '#remove') {
                delete items[index]; return this;
            }
            if (value === undefined) return items[index] || (items[index] = Queue.itemTemplate.call(this, this.data, index, this.__template));
            else {
                if (index == 0) return this.first(value);
                if (index == this.data.length - 1 && this.data.length > 1) return this.last(value);
                this.data[index] = value;
                var item = items[index];
                if (item) item.call(item, value);
                return this;
            }
        }
        , subscribe: function (evt, cb) {
            var subscribes = this._subscribes || (this._subscribes = {});
            var evts = subscribes[evt] || (subscribes[evt] = []);
            evts.push(cb);
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
        },

        each: function (cb) {
            for (var i = 0, j = this.data.length; i < j; i++) {
                if (cb.call(this, this.data[i], i) === false) break;
            }
            return this;
        },
        find: function (cb) {
            if (typeof cb === 'function') {
                for (var i = 0, j = this.data.length; i < j; i++) {
                    var r = cb.call(this, this.data[i], i);
                    if (r === false) break;
                    else if (r === true) return this.data[i];
                }
            } else {
                for (var i = 0, j = this.data.length; i < j; i++) {
                    var it = this.data[i];
                    if (it && (it.Id === cb || it.id === cb || it.ID === cb)) return it;
                }
            }
        },
        add: function (item) {
            if (item && this.prehandler && this.prehandler(item) === false) return this;
            this.observableArray.push(item);
            this.last(item || {});


            this.count(this.data.length);
            this.emit("added", item);
            return this;
        },
        remove: function (cb) {
            var t = typeof cb;
            var ret = [];
            if (t === "function") this.observableArray.remove(function (it) { if (cb(it)) { ret.push(it); return true; } return false; });
            else if (t === 'object') this.observableArray.remove(function (it) {
                if (it === cb) {
                    ret.push(it);
                    return true;
                }
                return false;
            });
            else this.observableArray.remove(function (it) { if (it.id === cb || it.Id === cb || it.ID === cb) { ret.push(it); return true; } return false; });
            this.count(this.data.length);
            this.first(this.data[0] || {}, true);
            if (this.data.length != 1) this.last(this.data[this.data.length - 1] || {}, true);
            if (this.__items) {
                for (var index in this.__items) {
                    var prop = this.__items[index];
                    prop.call(prop, this.data[index] || {}, true);
                }
            }
            this.emit("removed", ret);
            return ret;
        },
        push: function (item) {
            if (item && this.prehandler && this.prehandler(item) === false) return this;

            this.observableArray.push(item);
            this.last(item || {});
            this.count(this.data.length);
            this.emit("added", item);
            return this;
        },
        pop: function () {
            var item = this.observableArray.pop();
            this.last(this.data[this.data.length - 1], true);
            if (this.data.length > 1 && this.__items) {
                var vitem = this.__items[this.data.length];
                if (vitem) vitem.call(vitem, {});
            }

            this.count(this.data.length);
            this.emit("removed", [item]);
            return item;
        },
        enqueue: function (item) {
            if (item && this.prehandler && this.prehandler(item) === false) return this;

            this.observableArray.push(item);
            this.last(item || {});


            this.count(this.data.length);
            this.emit("added", item);
            return this;
        },
        dequeue: function () {
            var item = this.observableArray.shift();
            this.first(this.data[0] || {}, true);
            if (this.data.length > 1) this.last(this.data[this.data.length - 1] || {});

            this.count(this.data.length);
            this.emit("remove", [item]);
            return item;
        }
    };
    Queue.itemTemplate = function (data, index, template) {
        var me = this;
        var item = function (val, noticeOnly) {
            if (val === undefined) return data[index];
            if (!noticeOnly) data[index] = val;
            if (val) {
                for (var n in item) {
                    var prop = item[n];
                    if (typeof prop != 'function') {
                        throw n + " is not a function";
                    }
                    prop.call(item, val[n]);

                }
            }
            return this;
        };
        var itemData = data[index] || {};
        for (var n in template) {
            var val = template[n];
            if (typeof val === 'function') {
                (function (name, item, accessor) {
                    item[name] = ko.pureComputed({
                        read: function () {
                            return accessor.call(this);
                        },
                        write: function (value) {
                            accessor.call(this, value);
                        },
                        owner: item
                    });

                })(n, item, val);
            } else {
                item[n] = ko.observable(itemData[n]);
            }
        }
        var result = item;
        return result;
    }

    define("jsRuntime/queue", function () { return Queue; });

    //Tasks.prototype.
    return Queue;
});