
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

                minParCurrency: {
                    value: [
                        { code: 'cny', value: '人民币', parValue: 100 },
                        { code: 'usd', value: '美元', parValue: 200 },
                        { code: 'hkd', value: '港币', parValue: 500 }
                    ],
                    metadata: {
                        needObservable: true,
                        //sourceType: 'par',//par:http://pars.com/fetchpar?,ecis:http://ecis.com/getecis?
                        //requestParams: { par1: '最小票面币种', par2: '2' }
                        // http://pars.com/fetchpar?par1=最小票面金额&par2=2
                    }
                },
                minParAmount: {
                    value: 0,
                    metadata: {
                        needObservable: true,
                        //sourceType: 'par',//par:http://pars.com/fetchpar?,ecis:http://ecis.com/getecis?
                        //requestParams: { par1: '最小票面币种', par2: '2' }
                        // http://pars.com/fetchpar?par1=最小票面金额&par2=2
                    }
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