define(['jsRuntime/parManager', 'jsRuntime/resourceManager', 'jsRuntime/actionManager',
    'widgets/popupSelect', 'widgets/maskInput', 'jsRuntime/workflowManager',
     'jsRuntime/utility'
],
    function (pm, rm, am, popupSelect, maskInputs, wm, utility) {
        var m = function (cx) {
            var self = this;
            this.cx = cx;
            this.rm = rm.global;
            this.am = am.global;
            this.wm = cx.wm;
            this.dm = cx.dm;
            this.instanceid = cx.instanceId;
            this.tabId = cx.tabId;

            this.selectProvince = null;
            this.selectCity = null;
            this.str1 = ko.observable('');
            this.str2 = ko.observable('');
            this.str3 = ko.observable('');
            this.str4 = ko.observable('');

            this.viewState = 'new';
            this.account = ko.observable(12).extend({ required: { params: true, message: "不能为空" }, ByteMaxLength: { params: 5, message: '最长不能超过5个字节', onlyIf: function () { return true } } });
            this.accountuse = ko.observable();
            this.password = ko.observable().extend({ required: { params: true, message: "密码不能为空" } });

            this.province1Value = ko.observable();
            this.province1Diaplay = ko.observable();

            this.cityValue = ko.observable();
            this.cityDiaplay = ko.observable();


            this.maskTypeArray = ko.observableArray([{ "name": "人民币", 'maskInput': { "type": "numeric", "format": { "thouSep": ",", "deciNumber": 4 } } },
                { "name": "美元", 'maskInput': { "type": "numeric", "format": { "thouSep": ",", "deciNumber": 2 } } },
                { "name": "日元", 'maskInput': { "type": "numeric", "format": { "thouSep": ",", "deciNumber": 3 } } }]);

            this.maskFormatNumeric = ko.observable({ 'maskInput': { "type": "numeric", "format": { "thouSep": ",", "deciNumber": 4 } } });
            this.maskFormatTelePhone = ko.observable({ 'maskInput': { "type": "telePhone", "format": "9{1,4}-9999999" } });
            this.maskFormatEmail = ko.observable({ 'maskInput': { "type": "email", "format": "email" } });
            this.maskNA = ko.observable({ 'maskInput': { "type": "telePhone", "format": "A{0,2}" } });


            this.number = ko.observable().extend({ required: true });;//11111.122
            this.TelePhone = ko.observable();
            this.email = ko.observable();

            this.upperNumber = ko.computed(function () {
                if (self.number() != null)
                    return self.am.numericToUpper((self.number()).replace(",", ""));
                return self.number();
            })
            this.formatNumber = ko.observable(self.am.formatNumeric("11111111111111.126", "2"));

            this.getCursortPosition = function (ctrl) {
                var CaretPos = 0;	// IE Support
                if (document.selection) {
                    ctrl.focus();
                    var Sel = document.selection.createRange();
                    Sel.moveStart('character', -ctrl.value.length);
                    CaretPos = Sel.text.length;
                }
                    // Firefox support
                else if (ctrl.selectionStart || ctrl.selectionStart == '0')
                    CaretPos = ctrl.selectionStart;
                return (CaretPos);
            }

            this.setCaretPosition = function (ctrl, pos) {
                if (ctrl.setSelectionRange) {
                    ctrl.focus();
                    ctrl.setSelectionRange(pos, pos);
                }
                else if (ctrl.createTextRange) {
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }

            this.activate = function () {
                //创建组件
                self.selectProvince = new popupSelect();
                self.selectProvince.filter = {
                    Culture: 'zh-cn',
                    BranchNo: 100101,
                    MainTranNo: '02000',
                    select: 'TranNo,TranDesc,FlowID,Icon'
                };
                self.selectCity = new popupSelect();
                //ko.mapper.fromJS(testArray, {}, self.maskTypeArray);
            };

            this.isContinu = function () {
                return true;
            }


            this.compositionComplete = function () {
                am.instance.processElementControll(cx.wm.currentViewArea);
                //am.instance.pageTimeout(cx.wm,5);

                //self.selectProvince.IsProvFlag = false;
                self.selectProvince.isVisibleButton(true);
                //组件选中项值
                self.selectProvince.selectValue = self.province1Value;
                //组件选中项显示文本
                self.selectProvince.displayText = self.province1Diaplay;
                //子
                self.selectProvince.childrens.push(self.selectCity);
                //初始化组件
                //self.selectProvince.init(cx.currentViewArea);
                self.selectProvince.init(self.tabId);


                self.selectCity.isVisibleButton(true);
                //组件选中项值
                self.selectCity.selectValue = self.cityValue;
                //组件选中项显示文本
                self.selectCity.displayText = self.cityDiaplay;
                //初始化组件
                //self.selectCity.init(cx.currentViewArea);
                self.selectCity.init(self.tabId);

                var datetime = new Date();
                //self.am.initDateFormat();
                var str1 = datetime.Format("yyyy-MM-dd HH:mm:ss");
                var str2 = datetime.Format("yyyy-MM-dd");
                var str3 = datetime.Format("HH:mm:ss");
                var str4 = datetime.Format("E");
                self.str1(str1);
                self.str2(str2);
                self.str3(str3);
                self.str4(str4);

                //self.am.initStringFormat();
                var template1 = "我是{0}，今年{1}了";
                var template2 = "我是{name}，今年{age}了";
                var result1 = template1.format("loogn", 22);
                var result2 = template2.format({ name: "loogn", age: 22 });

               

                //utility.log.trace("trace log");
                //utility.log.error("error log");
            }

            this.next = function (data) {
                var _para = {
                    isDispMaskLayer: true,
                    maskLayerMessge: "imjaiqiwewfiwefj",
                    isFullMask: false,
                    isContinue: self.isnext
                };
                console.debug("Click:"+self.instanceid);
                self.wm.continueFlow(_para);
            }
            this.isnext = function () {
                return true;
            };

            this.stattWf = function () {
                var para = { "viewModelId": "Shells/Counter/wfAsk", transTitle: "测试A", startPath: 'center' };
                wm.global.startFlow('CS1012/CS1012-11', para);


                //测试push flowID
                //var para = { "flowObj": "CS1012" };
                //wm.pushFlow(para)

                //测试push obj
                //var para = { onFinishing:self.butA };
                //wm.global.startFlow("CS1012", para);
            };

            this.method1 = function () {
                //var psr = { 'serverName': 'wf', 'urlPra': '', 'type': 'get', 'inputPars': {} };
                //self.am.connectServer(psr).done(function (ret) {
                //});"runningWf": "stack",
                var para = { "runningWf": "stack", "isTab": true, "tabId": self.tabId, 'isBackground': null };
                wm.global.startFlow("CS1012", para);
            };

            this.method = function (obj, event) {
                //var viewModel = cx.wm.currentViewModel
                //am.instance.enableElement(viewModel.__vmInstanceId__ + 'mybutton');
                //alert(self.am.getOpenDialogNumber());
                self.am.showDialog('Shells/Counter/wfAsk', null, 'mainView').then(function () { alert(self.am.getOpenDialogNumber()) });
                //window.setTimeout(function () { alert(self.am.getOpenDialogNumber()); },1000);
                //self.accountuse(self.account());
                //self.am.showMessage('确定要退出吗', '请确认',
                //        [{ text: "确认", value: "Yes" }, { text: "取消", value: "No" }, { text: "忽略", value: 'ignore' }], false).
                //       then(function (data) { alert(data) });
                //self.number(undefined);

                //var psr = { 'serverName': 'wf', 'urlPra': 'CTUAPZM', 'type': 'post', 'dataType': 'json', 'inputPars': { 'Mobile': '13501316657' } };
                //self.am.connectServer(psr).done(function (ret) {
                //});
                //$("#maskNumber").val("1.");

                //alert($("#maskNumber").val());
                //$("#maskNumber").val("99,999,999,999,999.999")
                //$("#maskNumber").val("99,999,999,999,999.990")

                //self.number()
                //self.am.sendMessgeForAd(null);
                //var paobj = new pa("ZHGD000001",false);
                //paobj.show();
                //self.am.sendMessgeForAd(null);
                //alert(parseFloat("99999999999999.999"));
            };

            this.butA = function () {

                self.am.showDialog('Shells/wfAsk', null,self.tabId).then(function () { });
                //self.am.showMessage('ButA', '请确认',
                //        [{ text: "确认", value: "Yes" }, { text: "取消", value: "No" }, { text: "忽略", value: 'ignore' }], false).
                //       then(function (data) { });

                //self.am.isExistDialogAndMaskLayer();
            };
            this.butB = function () {
                self.am.showMessage('ButB', '请确认',
                        [{ text: "确认", value: "Yes" }, { text: "取消", value: "No" }, { text: "忽略", value: 'ignore' }], false, self.tabId).
                       then(function (data) { });
            };

            this.delNubmer = function (obj, event) {
                var x = "";
                var tempValue = $("#maskNumber").val();
                $("#maskNumber").val(tempValue.substring(0, tempValue.length - 1));
                $("#maskNumber").trigger('keydown');
                $("#maskNumber").trigger('input');
                $("#maskNumber").trigger('keyup');
            }

            this.submit = function (data, event) {
                //var x = self.account.isValid();
                //am.validate([self.account,self.password]);
                //self.am.validation([self.account, self.password]);
                var formatStr = String.format("Hello {0}!", "world");
                cx.wm.continueFlow(data, event);//,{'abc':'a123'},self.isContinu
            }

            this.processAnimate = function (source) {
                var animateConfig = {
                    sourceObject: $(source),//如：$('#id')
                    flyObjectHeight: '50px',
                    flyObjectWidth: '120px',
                    flyObjectZindex: '100',
                    effect: 'shake',
                };
                am.global.processAnimate(animateConfig);
            }

            //this.openNumMiniKeyboard = function () {
            //    var options = {
            //        target: event.target,
            //        cssHead: 'pcpd',
            //        gridClass: 'ui-bar-a',
            //        buttonNumberClass: 'ui-link ui-btn ui-btn-b ui-shadow ui-corner-all',
            //        buttonFunctionClass: 'ui-link ui-btn ui-btn-a ui-shadow ui-corner-all',
            //        keyboardType: 'num'
            //    };
            //    var padkb = new miniKeyboard(options);
            //    padkb.open($(options.target));
            //}

            //this.openAmountMiniKeyboard = function () {
            //    var options = {
            //        target: event.target,
            //        cssHead: 'atpd',
            //        keyboardType: 'amount',
            //        changeAtblur: false,
            //    };
            //    var padkb = new miniKeyboard(options);
            //    padkb.open($(options.target));
            //}

            self.checkedAry = ko.observableArray();
            self.E_bankType = ko.observableArray(
                [{
                    name: ko.observable('电子银行'),
                    value: ko.observable('001'),
                    state: ko.observable('0'),
                    connect: ko.observable('0'),
                    choice: ko.observable()
                },
                {
                    name: ko.observable('电话银行'),
                    value: ko.observable('002'),
                    state: ko.observable('1'),
                    connect: ko.observable('0'),
                    choice: ko.observable()
                },
                {
                    name: ko.observable('短信通知'),
                    value: ko.observable('003'),
                    state: ko.observable('1'),
                    choice: ko.observable()
                },
                {
                    name: ko.observable('电子式国债'),
                    value: ko.observable('004'),
                    state: ko.observable('0'),
                    connect: ko.observable('0'),
                    choice: ko.observable()
                },
                {
                    name: ko.observable('记帐式国债'),
                    value: ko.observable('005'),
                    state: ko.observable('0'),
                    connect: ko.observable('0'),
                    choice: ko.observable()
                },
                {
                    name: ko.observable('步步高'),
                    value: ko.observable('006'),
                    state: ko.observable('0'),
                    connect: ko.observable('0'),
                    choice: ko.observable()
                },
                {
                    name: ko.observable('智能通'),
                    value: ko.observable('007'),
                    state: ko.observable('0'),
                    connect: ko.observable('0'),
                    choice: ko.observable()
                },
                {
                    name: ko.observable('大额存单'),
                    value: ko.observable('008'),
                    state: ko.observable('0'),
                    connect: ko.observable('0'),
                    choice: ko.observable()
                }
                ]
                );

            self.checkValue = function (selectValue) {
                if (selectValue() == '001') {
                    self.checkedAry.remove('002');

                }
                else if (selectValue() == '002') {
                    self.checkedAry.remove('001');

                }
                //var x = self.checkedAry();
                return true;
            }

            self.choiceBus = function () {
                /*
                初始化签约已选标识
                */
                self.BOCNet_Selected(false);
                self.CCS_Selected(false);
                self.SMS_Selected(false);
                self.BONDS_Ele_Selected(false);
                self.BONDS_Acc_Selected(false);
                self.BuBuGao_Selected(false);
                self.ZhiNengTong_Selected(false);
                self.LargeAmtCertificate_Selected(false);

                for (var i = 0; i < self.checkedAry().length; i++) {
                    if (self.checkedAry()[i] == "001") {
                        self.BOCNet_Selected(true);
                    }
                    else if (self.checkedAry()[i] == "002") {
                        self.CCS_Selected(true);
                    }
                    else if (self.checkedAry()[i] == "003") {
                        self.SMS_Selected(true);
                    }
                    else if (self.checkedAry()[i] == "004") {
                        self.BONDS_Ele_Selected(true);
                    }
                    else if (self.checkedAry()[i] == "005") {
                        self.BONDS_Acc_Selected(true);
                    }
                    else if (self.checkedAry()[i] == "006") {
                        self.BuBuGao_Selected(true);
                    }
                    else if (self.checkedAry()[i] == "007") {
                        self.ZhiNengTong_Selected(true);
                    }
                    else if (self.checkedAry()[i] == "008") {
                        self.LargeAmtCertificate_Selected(true);
                    }
                }

                if (!self.BuBuGao_Selected() || !self.ZhiNengTong_Selected()) {
                    cx.wm.continueFlow(self);
                }
            };
        }

        return m;
    });
