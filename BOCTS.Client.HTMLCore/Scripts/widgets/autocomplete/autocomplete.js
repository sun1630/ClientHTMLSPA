
/**
 * 针对（autocomplete）自动完成的扩展
 * autocomplete: 对应 ko.observableArry() 数据源
 * autoVal: 对应 ko.observable() 当前值
 */

define(["widgets/autocomplete/jquery.autocomplete"],
    function() {

        ko.bindingHandlers.autocomplete = {
            init: function(element, valueAccessor,allbinding) {
                var autoVal = allbinding.get("autoVal");
                
                var autoSource = ko.unwrap(valueAccessor());
                var $element = $(element);
                $element.autocomplete({
                    source: [autoSource]
                });

                $element.off("keyup").on("keyup",
                    function() {
                        autoVal($(this).val());
                    });
            },
            update: function (element, valueAccessor) {

                var autoSource = ko.unwrap(valueAccessor());

                var $element = $(element);
                $element.autocomplete("options", {
                    source: [autoSource]
                });
            }
        };


    });