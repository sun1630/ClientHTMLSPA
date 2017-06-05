define(['durandal/system', 'plugins/dialog', 'jsRuntime/parManager', 'jsRuntime/configManager', 'jsRuntime/utility', ],
    function (system, dialog, pm, cm, utility) {
        var m = function (cx) {
            var self = this;
            //菜单项
            this.menuItems = ko.observableArray([]);
            //菜单项ID
            this.menuId = ko.observable(system.guid());
            //返回值是否对象
            this.rtnIsObj = ko.observable(true);
            //是否显示确定取消按钮
            this.isVisibleButton = ko.observable(true);
            //选中项显示文本
            this.displayText = "";
            //选中项值
            this.selectValue = {};
            //过滤条件
            this.filter = null;
            //当前显示区域
            this.ViewArea = null;
            //子菜单
            this.childrens = [];
            //是否分行菜单，true分行，false:全国菜单，可不设置默认值为:false
            this.IsProvFlag = false;

            //打开静态菜单
            //filter:是根据属性名称进行过滤，示例：filter = '($.code == 1 || $.code == 2)  && $.name="test"'  filter='$.province=="guangdong"'
            this.openStaticMenus = function (fileName) {
                var viewArea = $("div[satm-attr='" + self.ViewArea + "']");
                viewArea.addClass('customModalParent');
                var blockout = $('<div id="blockout_' + self.menuId() + '" class="customModalBlockout"></div>')
                    .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 0.7 })
                    .appendTo(viewArea);

                if (viewArea[0].scrollWidth > viewArea.innerWidth())
                    blockout.width(viewArea[0].scrollWidth);

                var host = $('<div id="host_' + self.menuId() + '" class="customModalHost"></div>')
                    .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 1 })
                    .appendTo(viewArea);
                var calculateTop = viewArea.offset().top + (viewArea.outerHeight() / 2);
                //由于mainView底部被遮罩了部分高度，需要<div class='tile-cont'>重新计算mainView的实际高度。
                if (self.ViewArea == cm.client.defaultArea) {
                    var tileContent = $("div[satm-attr='tileContent']");
                    // 如果mainView的父级div有溢出，说明mainView被遮盖部分高度，需要重新计算实际高度。
                    if (tileContent[0] != null && (tileContent[0].scrollHeight > tileContent.innerHeight()))
                        calculateTop = viewArea.offset().top + ((tileContent.outerHeight() - (viewArea.offset().top - tileContent.offset().top)) / 2);

                    if (tileContent[0] == null) {
                        utility.log("layout.html not exists tileContent");
                        console.log("layout.html not exists tileContent");
                    }
                }
                host.css('top', calculateTop + 'px');

                var menu = $("#" + self.menuId());
                menu.appendTo(host);

                var filter = null;
                if ($.isFunction(self.filter))
                    filter = self.filter();

                pm.getStaticParameter(fileName, self.menuItems, filter, self.IsProvFlag).done(function () {
                    self.reposition();
                    menu.show();
                });
            };

            //打开动态菜单
            //filter:是根据属性名称进行过滤示例：filter="OptionGroupName eq 'promono11032' and Culture eq 'zh-cn' and BranchNO eq 2704",
            this.openDynamicMenus = function (menuName) {
                var viewArea = $("div[satm-attr='" + self.ViewArea + "']");
                viewArea.addClass('customModalParent');
                var blockout = $('<div id="blockout_' + self.menuId() + '" class="customModalBlockout"></div>')
                    .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 0.7 })
                    .appendTo(viewArea);

                if (viewArea[0].scrollWidth > viewArea.innerWidth())
                    blockout.width(viewArea[0].scrollWidth);

                var host = $('<div id="host_' + self.menuId() + '" class="customModalHost"></div>')
                    .css({ 'z-index': dialog.getNextZIndex(), 'opacity': 1 })
                    .appendTo(viewArea);
                var calculateTop = viewArea.offset().top + (viewArea.outerHeight() / 2);
                //由于mainView底部被遮罩了部分高度，需要<div class='tile-cont'>重新计算mainView的实际高度。
                if (self.ViewArea == cm.client.defaultArea) {
                    var tileContent = $("div[satm-attr='tileContent']");
                    // 如果mainView的父级div有溢出，说明mainView被遮盖部分高度，需要重新计算实际高度。
                    if (tileContent[0] != null && (tileContent[0].scrollHeight > tileContent.innerHeight()))
                        calculateTop = viewArea.offset().top + ((tileContent.outerHeight() - (viewArea.offset().top - tileContent.offset().top)) / 2);

                    if (tileContent[0] == null) {
                        utility.log("layout.html not exists tileContent");
                        console.log("layout.html not exists tileContent");
                    }
                }
                host.css('top', calculateTop + 'px');

                var menu = $("#" + self.menuId());
                menu.appendTo(host);

                var filter = self.filter;
                if ($.isFunction(self.filter))
                    filter = self.filter();

                pm.getDynamicParameter(menuName, self.menuItems, filter).done(function () {
                    self.reposition();
                    menu.show();
                });
            };

            //清除子对象值与显示值
            this.clearChildren = function () {
                for (var i = 0; i < self.childrens.length; i++) {
                    self.childrens[i].displayText("");
                    self.childrens[i].selectValue({});
                    //childrens[i].childrens("");
                }
            }

            //居中菜单
            this.reposition = function () {
                var view = $("#" + self.menuId());
                var viewArea = $("div[satm-attr='" + self.ViewArea + "']");

                //We will clear and then set width for dialogs without width set 
                if (!view.data("predefinedWidth")) {
                    view.css({ width: '' }); //Reset width
                }
                var width = view.outerWidth(false),
                    height = view.outerHeight(false),
                    viewAreaHeight = viewArea.height() - 20; //leave at least 20 pixels free
                if (self.ViewArea == cm.client.defaultArea) {
                    var tileContent = $("div[satm-attr='tileContent']");
                    // 如果mainView的父级div有溢出，说明mainView被遮盖部分高度，需要重新计算实际高度。
                    if (tileContent[0] != null && (tileContent[0].scrollHeight > tileContent.innerHeight()))
                        viewAreaHeight = tileContent.height() - (viewArea.offset().top - tileContent.offset().top) - 20;

                    if (tileContent[0] == null) {
                        utility.log("layout.html not exists tileContent");
                        console.log("layout.html not exists tileContent");
                    }
                }
                var viewAreaWidth = viewArea.width() - 10, //leave at least 10 pixels free
                    constrainedHeight = Math.min(height, viewAreaHeight),
                    constrainedWidth = Math.min(width, viewAreaWidth);

                view.css({
                    'margin-top': (-constrainedHeight / 2).toString() + 'px',
                    'margin-left': (-constrainedWidth / 2).toString() + 'px'
                });

                if (height > viewAreaHeight) {
                    view.css("overflow-y", "auto").outerHeight(viewAreaHeight);
                } else {
                    view.css({
                        "overflow-y": "",
                        "height": ""
                    });
                }

                if (width > viewAreaWidth) {
                    view.css("overflow-x", "auto").outerWidth(viewAreaWidth);
                } else {
                    view.css("overflow-x", "");

                    if (!view.data("predefinedWidth")) {
                        //Ensure the correct width after margin-left has been set
                        view.outerWidth(constrainedWidth);
                    } else {
                        view.css("width", view.data("predefinedWidth"));
                    }
                }
            };
            //关闭菜单
            this.closeMenus = function () {
                var viewArea = $("div[satm-attr='" + self.ViewArea + "']");
                var menu = $("#" + self.menuId());
                var blockout = viewArea.find('#blockout_' + self.menuId());
                var host = viewArea.find('#host_' + self.menuId());
                menu.attr('style', '');
                menu.hide();
                host.css('opacity', 0);
                blockout.css('opacity', 0);
                menu.insertAfter(host);
                host.remove();
                blockout.remove();
                viewArea.removeClass('customModalParent');
            };

            //初始化
            this.init = function (viewArea) {
                self.ViewArea = viewArea;
            }

            //单击菜单项
            var tempValue;
            this.itemClick = function (item, event) {
                $(event.target).parent().parent().siblings().each(function (index, li) {
                    $(li).find('.pure-radio-group').removeClass('button-choose-dote');
                });
                $(event.target).parent().addClass('button-choose-dote');
                var va = ko.toJS(item);

                if (self.rtnIsObj()) {
                    tempValue = va;
                }
                else {
                    tempValue = va.name;
                }

                if (!self.isVisibleButton()) {
                    if (tempValue != null) {
                        if ($.isFunction(self.selectValue))
                            self.selectValue(tempValue);
                        else
                            self.selectValue = tempValue;

                        if ($.isFunction(self.displayText))
                            self.displayText(tempValue.text);
                        else
                            self.displayText = tempValue.text;
                    }
                    tempValue = null;
                    self.clearChildren();
                    self.closeMenus();
                }
            };

            //确定按钮
            this.confirm = function () {
                if (tempValue != null) {
                    if ($.isFunction(self.selectValue))
                        self.selectValue(tempValue);
                    else
                        self.selectValue = tempValue;

                    if ($.isFunction(self.displayText))
                        self.displayText(tempValue.text);
                    else
                        self.displayText = tempValue.text;
                }
                tempValue = null;
                self.clearChildren();
                self.closeMenus();
            };

            //取消按钮
            this.cancel = function () {
                tempValue = null;
                self.closeMenus();
            };
        };
        return m;
    });