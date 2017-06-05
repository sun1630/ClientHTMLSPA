define(["feature", "jsRuntime/queue", "jsRuntime/utility", "jsRuntime/configManager"], function (feature, Queue, util, cm) {
    var additions = [];
    var handled_taskIds = [];
    var holdUntilReady = function (body, pack) {
        util.log("holding task", body);
        additions.push({ body: body, pack: pack });
    }
    var taskArrived = function (body, pack) {
        var tid = body.Id;
        util.log.trace("task arrived:(taskId,type)=>",tid,body.Type);
        var now = new Date().valueOf();
        for (var i = 0, j = handled_taskIds.length; i < j; i++) {
            var handled_id = handled_taskIds[i];
            // var cTime = handled_id.cTime;
            // if (now - cTime.valueOf() > 1200000) continue;

            if (handled_id.TaskId == tid) {
                util.log.warn(tid + " is already handled. drop it.", body);
                return;
            }
            //handled_taskIds.push(handled_id);
        }
        var handled_id = { TaskId: tid, "cTime": new Date() };
        handled_taskIds.push(handled_id);
        var type = body.Type;
        if (Queue.accepts && !Queue.accepts[type]) {
            util.log.warn("This type is not acceptable for this queue,proccess is canceled", type);
            return;
        }
        Queue.emit("queueItemArriving", body);
        if (queueKinds) {
            var q = Queue[type];
            if (!q) {
                var dft = Queue["@default"];
                if (dft === undefined) {
                    for (var n in queueKinds) if (queueKinds[n]["default"]) { dft = Queue["@default"] = Queue[n]; break; }
                }
                if (dft) {
                    //if (dft.prehandler && dft.prehandler(body) === false) return;
                    dft.add(body);
                } else {

                    var exMsg = "Queue[" + type + "] is not configed.";
                    util.log.error(exMsg);
                    throw exMsg; return;
                }
                return;
            }

            var kind = queueKinds[type];
            //if (q.prehandler && q.prehandler(body) === false) return;
            //if (body.Extras) try { body.extras = JSON.parse(body.Extras); } catch (ignore) { }
            q.add(body);
        } else {
            Queue.tasks.add(body);
        }
    }
    var delayTasks = [], delayInterval = cm.client.taskDelayInterval;
    var addDelayTask = function (body, pack) {
        delayTasks.push(body);
        body.taskArrivedTime = new Date().valueOf();
        if (!delayTick) delayTick = setInterval(function () {
            var now = new Date().valueOf();
            for (var i = 0, j = delayTasks.length; i < j; i++) {
                var p = delayTasks.shift();
                if (now - p.taskArrivedTime >= delayInterval) {
                    taskArrived(p, p);
                } else delayTasks.push(p);
            }
            if (delayTasks.length == 0) {
                clearInterval(delayTick);
                delayTick = 0;
            }
        }, 1000);
    }
    var delayTick, comm;
    var msgSvc = feature("message").done(function (msgSvc) {
        //msgSvc.enable();
        comm = msgSvc.communication;
        msgSvc.communication.subscribe("Task", holdUntilReady);
        msgSvc.communication.subscribe("DelayTask", addDelayTask);
        util.log.sys("queue is listen task from MessageManager");
    });
    var releaseAdditions = function () {
        msgSvc.instance.communication.unsubscribe("Task", holdUntilReady);
        for (var i in additions) {
            var p = additions[i];
            taskArrived(p.body, p.pack);
        }
        msgSvc.instance.communication.subscribe("Task", taskArrived);
    }
    Queue.subscribe = function (evtname, handler) {
        comm.subscribe(evtname, handler); return this;
    }
    Queue.unsubscribe = function (evtname, handler) {
        comm.unsubscribe(evtname, handler); return this;
    }
    Queue.emit = function (evtname, arg) {
        comm.emit(evtname, arg); return this;
    }
    Queue.loadData = function (url, userId) {
        util.log.trace("Queue is trying to load data.",url,userId);
        msgSvc.done(function (inst) {
            inst.enable().done(function (comm) {
                var data = { "DealerId": userId };
                var opts = {
                    url: url,
                    contentType: 'application/json; charset=utf-8',
                    headers: { TerminalId: cm.client.MachineId },
                    type: "POST",
                    data: JSON.stringify(data),//访问webapi的方式
                    dataType: 'json'
                };
                //util.log.sys("Queue post a request to fetch data", opts);
                $.ajax(opts).done(function (ret) {
                    // var comm = msgSvc.communication;
                    var arr = ret.Tasks;
                    util.log.trace("Queue has getted datas.");
                    for (var i = 0, j = arr.length; i < j; i++) {
                        var msg = arr[i];
                        msg.isAchieved = true;//添加存量标记
                        taskArrived(msg, msg);
                    }
                    releaseAdditions();
                }).fail(function (reason) {
                    util.log.error("load Queue's data failed.", reason);
                });
            });
        });

    }

    Queue.remove = function (id) {
        for (var n in Queue) {
            var qu = Queue[n];
            if (!qu.isQueue) continue;
            if (qu.remove(id).length) break;
        }
        for (var i = 0, j = handled_taskIds.length; i < j; i++) {
            var handled_id = handled_taskIds[i];
            if (handled_id.TaskId == id) {
                return;
            }
        }
        handled_taskIds.push({
            TaskId :id, cTime :new Date()
        });
        return;
    }

    var queueKinds;
    Queue.kinds = function (kinds) {
        if (kinds === undefined) { return queueKinds; }
        if (queueKinds) {
            for (var n in queueKinds) { delete Queue[n]; }
        }
        if (typeof kinds === 'object') {
            if (kinds.template) {
                Queue.tasks = new Queue("list", kinds.template);
                Queue.tasks.prehandler = kinds.prehandler;
                return this;
            } else {
                queueKinds = kinds;
                for (var n in queueKinds) {
                    var kind = queueKinds[n];
                    if (typeof kind === "object") {
                        Queue[n] = new Queue(kind.type || "list", kind.template);
                        Queue[n].prehandler = kind.prehandler;
                    }
                    else {
                        Queue[n] = new Queue(kind || "list");
                    }
                }
            }

        } else {
            if (window.$log) window.$log.error("配置Queue不成功，配置opt要求是个对象");
            throw new Error("Invalid argument");
        }
        //Queue.dealTasks = new Queue("list");
        return this;

    }

    //Queue.Tasks = new Queue("list");
    define("queueManager", function () { return Queue; });
    define("jsRuntime/queueManager", function () { return Queue; });
    return Queue;
});