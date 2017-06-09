define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility'
],
    function (pm, rm, am, popupSelect, maskInputs, wm, utility) {
        var m = function (cx) {
            var self = this;
            this.cx = cx;
            this.rm = rm.global;
            this.am = am.global;
            this.wm = cx.wm;
            this.dm = cx.dm;
            this.instanceid = cx.instanceId;
            this.tabId = cx.tabId;
            this.wm.currentViewModel = self;
        }

        return m;
    });
