define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility', 'udl/vmProvider', 'Config/fieldType'
], function (pm, rm, am, popupSelect, maskInputs, wm, utility, vmp, cfg) {
    var m = function (cx) {
        var model = new vmp({
            data: {
                cx: cx,
                rm: rm.global,
                am: am.global,
                wm: cx.wm,
                dm: cx.dm,
                instanceid: cx.instanceId,
                tabId: cx.tabId,
                //amount: {
                //    value: 1000,
                //    metadata: {
                //        needObserve: true,
                //        needShare: true,
                //        inputMask: "YYYY-MM-DD",
                //        inputComlplete: {
                //            required: { params: true, message: "必填" }
                //            //max: { params: 5, message: '最大值为5' },
                //            //pattern: { params: '^[0-9]+\.{0,1}[0-9]{0,3}$', message: 'guifan' }
                //            //readonly: true,
                //        },
                //        format: function (target, value) {
                //            var newValue = parseFloat(target.rate.value()) * parseFloat(value);
                //            return newValue;
                //        }
                //    }
                //}
            },
            methods: {
                //activate: function () {
                //    alert();
                //},
                compositionComplete: function () {
                    alert("加载树形控件页成功！");
                }
            }
        }, cx);
        return model;
    }
    return m;
});