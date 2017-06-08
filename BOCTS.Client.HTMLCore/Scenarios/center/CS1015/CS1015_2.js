
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
                shareTrans: cx.shareTrans,


            },
            methods: {
                btnprev: function () {

                }
            }

        });
        return model;
    }
    return m;
});