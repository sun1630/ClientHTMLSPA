﻿
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

                province: {
                    value: [
                        {
                            code: '-1', text: '请选择', child: [
                                { code: '-1', text: '请选择' },
                            ]
                        },
                        {
                            code: '001', text: '北京', child: [
                                { code: '001001', text: '昌平区' },
                                { code: '001002', text: '海淀区' },
                                { code: '001003', text: '朝阳区' },
                                { code: '001004', text: '西城区' },
                            ]
                        },
                        {
                            code: '002', text: '上海', child: [
                                { code: '002001', text: '虹口区' },
                                { code: '002002', text: '黄埔区' },
                                { code: '002003', text: '浦东新区' },
                            ]
                        },

                    ],
                    metadata: {
                        needObservable: true,
                    }
                },

                city: {
                    value: [],
                    metadata: {
                        needObservable: true
                    }
                },

                // 使用事件
                province1: {
                    value: pv.province,
                    metadata: {
                        needObservable: true
                    }
                },
                provinceCode: {
                    value: '',
                    metadata: {
                        needObservable: true
                    }
                },
                city1: {
                    value: [],
                    metadata: {
                        needObservable: true
                    }
                }
            },
            methods: {
                provinceChange: function () {
                    var value=this.provinceCode.value();

                    var citys = cty.city.filter(function (arr) {
                        return arr.parentArea == value;
                    });
                    this.city1.value(citys);
                }
            }

        }, cx);
        return model;
    }
    return m;
});