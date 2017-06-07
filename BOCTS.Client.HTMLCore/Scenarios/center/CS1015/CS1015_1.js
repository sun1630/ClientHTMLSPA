define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility', 'udl/vmProvider'
],
    function (pm, rm, am, popupSelect, maskInputs, wm, utility, vmp) {
        var m = function (cx) {
            var model = new vmp({
                data: {
                    //cx: cx,
                    //rm: rm.global,
                    //am: am.global,
                    //wm: cx.wm,
                    //dm: cx.dm,
                    //instanceid: cx.instanceId,
                    //tabId: cx.tabId,
                    //share: share,

                    amount: {
                        value: 1000,

                        metadata: {
                            needObserve: true,
                            needShare: true,

                            inputMask: "YYYY-MM-DD",
                            inputComlplete: {
                                //required: { params: true, message: "密码不能为空" },
                                //max: { params: 5, message: '最大值为5' },
                                //readonly: true,
                            },
                            format: function (target, value) {


                                var newValue = parseFloat(target.rate.value()) * parseFloat(value);
                                return newValue;
                            }
                        }
                    },
                    rate: {
                        value: 10,
                        metadata: {
                            needObserve: true
                        }
                    },
                    currencys: {
                        value: [
                            { code: 'cny', value: '人民币', mask: 'cny:####' },
                            { code: 'usd', value: '美元', mask: 'usd:####' },
                            { code: 'hkd', value: '港币', mask: 'hkd:####' }
                        ],
                        metadata: {
                            needObserve: true
                        }
                    },

                },
                methods: {

                }
            })

            return model;
        };

        return m;

        //var m = function (cx) {
        //    var self = this;
        //    this.cx = cx;
        //    this.rm = rm.global;
        //    this.am = am.global;
        //    this.wm = cx.wm;
        //    this.dm = cx.dm;
        //    this.instanceid = cx.instanceId;
        //    this.tabId = cx.tabId;

        //    var model = {
        //        data: {
        //            test: {
        //                value: 100,
        //                metadata: {
        //                    needObserve: true,
        //                }
        //            }
        //        }
        //    }

        //data: {
        //        rate: {
        //            value: 100,
        //            metadata: {
        //                needObserve: true,

        //                }
        //        },




    });
//return m;
//});
