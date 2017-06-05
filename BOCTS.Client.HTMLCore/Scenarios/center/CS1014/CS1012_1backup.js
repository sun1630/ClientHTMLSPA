define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
    'widgets/popupContent/popupAgreement', 'widgets/miniKeyboard'],
    function (pm, rm, am, popupSelect, maskInputs, wm, pa, miniKeyboard) {
        var m = function (cx) {
            var self = this;
            this.cx = cx;
            this.rm = rm.global;
            this.am = am.global;
            this.wm = cx.wm;
            this.dm = cx.dm;
            this.instanceid = cx.instanceId;

            this.CurrentAttending = ko.observable("");
            this.CssCurrentAttending = ko.observable("");
            this.CurrentAttendingErrorMsg = ko.observable("");

            this.NewCurrentAttending = ko.observable("");

            this.checkCurrentAttending = function () {
                // 检查工作单位/就读学校是否为空，或填写内容是否满足格式要求
                var vCurrentAttending = $("#CurrentAttending").val();
                if (vCurrentAttending.trim() == "") {
                    self.CssCurrentAttending("input_erro");
                    self.CurrentAttendingErrorMsg("");
                    // self.CurrentAttendingErrorMsg(self.rm.message.RequiredError());
                    return false;
                } else if (!(new RegExp(/^[\w\u4E00-\u9FA5-#&]+$/).test(vCurrentAttending))) {
                    self.CssCurrentAttending("input_erro");
                    self.CurrentAttendingErrorMsg(self.rm.message.InputTextFormatError());
                    return false;
                } else {
                    self.CssCurrentAttending("");
                    self.CurrentAttendingErrorMsg("");
                }
                return true;
            };
        }
        return m;
    });
