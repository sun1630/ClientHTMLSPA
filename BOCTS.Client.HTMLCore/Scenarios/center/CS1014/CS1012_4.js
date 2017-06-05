define(['jsRuntime/resourceManager', 'jsRuntime/actionManager'],
    function (rm, am) {
        var m = function (cx) {
            var self = this;
            this.cx = cx;
            this.rm = rm.global;
            this.am = am.global;
            this.instanceId = cx.instanceId;
        };
        return m;
    });