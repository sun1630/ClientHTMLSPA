define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility', 'udl/vmProvider'
],
    function (pm, rm, am, popupSelect, maskInputs, wm, utility, vmp) {
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
                    BirthDate: {
                        value: 'Hello World!',
                        metadata: {
                            needObserve: true,
                            maskInput: "yyyy-mm-dd",
                        }
                    },
                    currencys: {
                        value: [
                            { code: 'fixed(2)', value: '人民币' },
                            { code: 'fixed(3)', value: '美元' },
                            { code: 'fixed(4)', value: '日元' },
                        ],
                        metadata: {
                            needObserve: true
                        }
                    },
                    selCurrency: {
                        value: '',
                        metadata: {
                            needObserve: true,
                        }
                    },
                    isRequired: {
                        value: 'feikong',
                        metadata: {
                            needObserve: true,
                            required: true,
                            //readonly: true
                        }
                    }


                },
                methods: {
                    method1: function () {
                        BirthDate() + 1;
                    },
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
