
define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility', 'udl/vmProvider', 'Config/fieldType',
     'Option/center/zh-cn/province', 'Option/center/zh-cn/city'
], function (pm, rm, am, popupSelect, maskInputs, wm, utility, vmp, cfg, pv, cty) {
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

                num1: {
                    value: 0,
                    metadata: {
                        needObservable: true,
                    }
                },
                rate1: {
                    value: 5,
                    metadata: {
                        needObservable: true,
                    }
                },
                num2: {
                    value: 0,
                    metadata: {
                        needObservable: true,
                    }
                },
                lastUpdateField: {
                    value: '',
                    metadata: {
                        needObservable: true,
                    }
                }
            },
            methods: {
                numchange1: function () {
                    this.lastUpdateField.value('num1');
                },
                numchange2: function () {
                    this.lastUpdateField.value('num2');
                }
            }

        }, cx);
        return model;
    }
    return m;
});