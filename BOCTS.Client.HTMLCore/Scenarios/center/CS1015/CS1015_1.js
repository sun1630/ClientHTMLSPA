define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility', 'udl/share', 'udl/vmProvider'
],
    function (pm, rm, am, popupSelect, maskInputs, wm, utility, share, vmp) {
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
                    share: share,
                    //BirthDate: {
                    //    value: '1999-09-09',
                    //    metadata: {
                    //        needObserve: true,
                    //        maskInput: "yyyy-mm-dd",
                    //        //Remote: dd,
                    //        //LocalPath: gg,
                    //        //BaseCurrency: "CNY",

                    //    }
                    //},
                    //Amount: {
                    //    value: '',
                    //    metadata: {
                    //        needObserve: true,
                    //        CurrencyField: "currencys",
                    //        Decimal:'',
                    //    }
                    //},
                    //currencys: {
                    //    value: [
                    //        { code: 'fixed(2)', value: '人民币' },
                    //        { code: 'fixed(3)', value: '美元' },
                    //        { code: 'fixed(4)', value: '日元' },
                    //    ],
                    //    metadata: {
                    //        needObserve:true,
                    //        DataSourceType:Dynamic,//Static,Dynamic,Transaction
                    //        DataSourceKey:Province,
                    //        DataRef:,
                    //    }
                    //},
                    //selCurrency: {
                    //    value: dm.teller.basecurrency,
                    //    metadata: {
                    //        needObserve: true,
                    //    }
                    //},


                    isRequired: {
                        value: '测试',
                        metadata: {
                            needObserve: true,
                            required: true,
                            //readonly: true
                        }
                    },
                    isRw: {
                        value: '测试',
                        metadata: {
                            needObserve: true,
                            readonly: true
                        }
                    },
                    newRw: {
                        value: '',
                        metadata: {
                            needObserve: true
                        }
                    },

                    //'归属省列表': {
                    //    value: [],
                    //    metadata: {
                    //        needObserve: true,
                    //        DataSourceType:Dynamic,//Static,Dynamic,Transaction
                    //        DataSourceKey:Province,
                    //    }
                    //},
                    //'选中省Code':{
                    //    value: '',
                    //    metadata: {
                    //        needObserve: true
                    //    }

                    //},
                    //'下属地市列表': {
                    //    value: [], // target.
                    //    metadata: {
                    //        needObserve: true,
                    //        DataSourceType:Dynamic,//Static,Dynamic,Transaction
                    //        DataSourceKey:Province,
                    //    }
                    //},
                    //'下属地市Code': {
                    //    value: '',
                    //    metadata: {
                    //        needObserve: true,
                    //        DataSourceType:Dynamic,//Static,Dynamic,Transaction
                    //        DataSourceKey:Province,
                    //    }
                    //},

                },
                methods: {
                    btncurrentRw: function () {
                        alert(this.isRw.value());
                    },
                    btnUpdateRw: function () {
                        var value = this.newRw.value();
                        this.isRw.value(value,true);
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
