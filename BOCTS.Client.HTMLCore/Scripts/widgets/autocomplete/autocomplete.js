
/**
 * 针对（autocomplete）自动完成的扩展
 * autocomplete: 对应 ko.observableArry() 数据源
 * autoVal: 对应 ko.observable() 当前值
 * autoOpt: 其他设置 {
 *    titleKey: 'title'
 * }
 */

define(["widgets/autocomplete/jquery.autocomplete"],
    function() {

        ko.bindingHandlers.autocomplete = {
            init: function(element, valueAccessor, allbinding) {
                var autoVal = allbinding.get("autoVal");

                //  处理参数相关  
                var autoSource = ko.unwrap(valueAccessor());
                var autoOpt = allbinding.get("autoOpt") || {};

                autoOpt.valueKey = autoOpt.titleKey = autoOpt.titleKey || "title";
                if (!autoOpt.source) {
                    autoOpt.source = [autoSource];
                }

                var $element = $(element);
                $element.autocomplete(autoOpt);

                $element.on("selected.xdsoft",
                    function(e, datum) {
                        autoVal(datum);
                    });
            },


            update: function (element, valueAccessor) {

                var autoSource = ko.unwrap(valueAccessor());

                var $element = $(element);
                var source = $element.autocomplete("getSource", 0);
                source = autoSource;
                
                //$element.autocomplete("options", {
                //    source: [autoSource]
                //});
            }
        };


    });