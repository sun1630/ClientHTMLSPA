define([
        'jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
        'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
        'jsRuntime/utility', 'udl/vmProvider', 'Config/fieldType', "widgets/autocomplete/autocomplete"
    ],
    function(pm, rm, am, popupSelect, maskInputs, wm, utility, vmp, cfg, auto) {
        var m = function(cx) {
            var model = new vmp({
                    data: {
                        cx: cx,
                        rm: rm.global,
                        am: am.global,
                        wm: cx.wm,
                        dm: cx.dm,
                        instanceid: cx.instanceId,
                        tabId: cx.tabId,
                        autoval: ko.observable(""),
                        //autoSource: ko.observableArray(["abb", "abc", "abd"])
                        autoSource: ko.observableArray([
                            { value: 1, title: "test1" },
                            { value: 2, title: "test2" },
                            { value: 3, title: "test3" }
                        ])
                    },
                    methods: {
                        autochosen: function(d, event) {
                            //alert("选中！");
                            if (event.keyCode == 13) {
                                var val = d.autoval();

                                console.log("ko值 ");
                                console.log(val);
                                console.log("文本框值 " + $(event.target).val());

                            }


                        },


                
                        activate: function() {


                        },
                        compositionComplete: function() {

                        }
                    }
                },
                cx);
            return model;
        }
        return m;
    });