define(['durandal/system', 'jsRuntime/actionManager', 'jsRuntime/dataManager', 'jsRuntime/configManager',
    'jsRuntime/viewManager', 'jsRuntime/resourceManager', 'jsRuntime/utility'],
    function (system, am, dm, cm, vm, rm, utility) {
        var m = function () {
            var self = this;
            this.cm = cm;
            this.rm = rm.global;
            this.am = am.global;
           

            this.mainView = vm.registerViewArea(cm.client.defaultArea);

            this.compositionComplete = function () {
            };
        };
        return m;
    });
