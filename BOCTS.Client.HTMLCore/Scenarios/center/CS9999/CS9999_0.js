
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
               
                GoToTarget: [
                    "cs9999_1", "cs9999_1", "cs9999_2"


                ]

            },

            methods: {
                
            }
        }, cx);
        return model;
    }
    return m;
});

//define(function () {
//    return {
//        data: {
//            amount: {
//                value: 1000,
//                metadata: {
//                    needObservable: true,
//                    needShare: true,

//                    inputMask: "YYYY-MM-DD",
//                    inputComlplete: {
//                        //required: { params: true, message: "必填" },
//                        //max: { params: 5, message: '最大值为5' },
//                        //pattern: { params: '^[0-9]+\.{0,1}[0-9]{0,3}$', message: 'guifan' }
//                        //readonly: true,
//                    },
//                    format: function (target, value) {
//                        var newValue = parseFloat(target.rate.value()) * parseFloat(value);
//                        return newValue;
//                    }
//                }
//            },
//            rate: {
//                value: 10,
//                metadata: {
//                    needObservable: true
//                }
//            },
//            currencys: {
//                value: [
//                    { code: 'cny', value: '人民币', mask: 'cny:####' },
//                    { code: 'usd', value: '美元', mask: 'usd:####' },
//                    { code: 'hkd', value: '港币', mask: 'hkd:####' }
//                ],
//                metadata: {
//                    needObservable: true
//                }
//            },

//            //birthdate2: {
//            //    valuea: '',
//            //    metadata: {
//            //        //dataType: dynamicDate[dm.teller],//
//            //        inputMask: dynamicDate[dm.teller[]]()


//            //        ]],
//            //        inputMask:function(target){

//            //        }
//            //    }
//            //}

//        },
//    };

//})






