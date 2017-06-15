define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility', 'udl/vmProvider', 'Config/fieldType', "widgets/tree/tree"
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
                treeSource: ko.observableArray([
                    { id: 1, name: "ceshi1", parentId: 0 },
                    { id: 2, name: "ceshi2", parentId: 1 },
                    { id: 3, name: "ceshi3", parentId: 0 },
                    { id: 4, name: "ceshi4", parentId: 2 }
                ]),
                treeVal: ko.observable({ name: "无" })
            },
            methods: {
                //activate: function () {
                //    alert();
                //},
                addTreeLeaf: function(d, e) {
                    d.treeSource.push( { id:10, name: "ceshimmmmm", parentId: 2 });
                },
                compositionComplete: function () {
                }
            }
        }, cx);
        return model;
    }
    return m;
});