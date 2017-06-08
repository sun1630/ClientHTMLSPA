define(['jsRuntime/dataManager', 'jsRuntime/configManager',
    'jsRuntime/viewManager', 'jsRuntime/workflowManager', 'jsRuntime/resourceManager', 'jsRuntime/eventAggregator',
    'jsRuntime/utility', 'jsRuntime/actionManager', 'plugins/dialog', 'jsRuntime/styleManager'],
    function (dm, cm, vm, wm, rm, evtAggregator, utility, am, dialog, sm) {
        var m = {
            dm: dm,
            wm: wm.global,
            rm: rm.global,
            vm: vm,
            cm: cm,
            tabArray: vm.tabViewAreas,

            activate: function () {

            },
            compositionComplete: function () {
                //JSON.stringify();

            },

            startFlow: function (flowid, para) {
                m.wm.startFlow(flowid, para);
            },
            startFlow2: function (flowid, para) {
                m.wm.startFlow2(flowid, para);
            },
            afterEvent: function (elements, data) {
                console.debug("eventId:" + data.tabId);
                //注测当前TabDialog
                if (data.tabId != null)
                    m.vm.registerDialog(data.tabId);

                //var diaCx=dialog.getContext(data.wfId);
                //console.debug("diaCx:" + diaCx);retun object/undefined

                //var x = elements
            },
            removeCSS: function () {
                console.log("removeCSS");
                sm.detachCssLink("Styles/Appearance/default/default.css");
            },
            addCSS: function () {
                console.log("addCSS");
                sm.attachCssLink("Styles/Appearance/default/default.css");
            }
        };
        return m;
    });