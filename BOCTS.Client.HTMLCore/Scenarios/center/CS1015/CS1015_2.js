
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
                teller: cx.teller,
                shareTrans: cx.shareTrans,

                birthdate: {
                    value: '2017-12-12',
                    metadata: {
                        needObservable: true,
                        dataType: '' 
                    },
                }
            },
            methods: {
                btnprev: function () {

                }
            }

        }, cx);
        return model;
    }
    return m;
});