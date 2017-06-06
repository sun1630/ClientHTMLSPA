﻿define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
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
                    '备选币种':{
                        value:[{},{}],
                        metadata: {
                            needObserve: true
                        }
                    },
                    '选中币种':{
                        value:'0001',
                        metadata: {
                            needObserve: true
                        }
                    },
                    BirthDate: {
                        value: 'Hello World!',
                        metadata: {
                            needObserve: true,
                            maskInput:  function(target) {
                                return target.F1();
                            }
                        }
                    },

                //    test: {
                //value: 'Hello World!',
                //metadata: {
                //    needObserve: true,
                //    maskInput: dic.account,
                //}
            }











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