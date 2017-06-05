define(['jsRuntime/actionManager', 'jsRuntime/configManager', 'jsRuntime/parManager', 'jsRuntime/resourceManager' ],
    function (am, cm,pm,rm) {
        var m = function (context) {
            var self = this;
            this.cx = context;
            this.instanceId = context.instanceId;
            this.rm = rm.global;
            this.am = am.global;

            this.viewState = ko.observable('new');
            this.addr = ko.observable({ 'a': 'aa' });
            this.name = ko.observable().extend({ required: true });


            this.birthday = ko.observable().extend({ required: true, dateISO: true });
            this.account = ko.observable().extend({ required: true });

            this.message = function () {
                alert(context.dm.account());
            };

            this.compositionComplete = function () {
                self.addr({ 'a': 'bb' })
            }

            //this.instanceId= ko.computed(function () {
            //    return cx.instanceId;
            //});
        };
        return m;
    });