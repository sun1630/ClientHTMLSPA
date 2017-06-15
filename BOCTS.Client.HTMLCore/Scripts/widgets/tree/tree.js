
/**
 * 针对树形控件（ostree）的扩展
 * 
 */

define(["widgets/tree/jquery.ostree"],
    function () {

        ko.bindingHandlers.tree = {
            init: function (element, valueAccessor, allbinding) {
              
            },

            update: function (element, valueAccessor, allbinding) {

                //var treeSource = ko.unwrap(valueAccessor());
            
                //var $element = $(element);
                //var opt = $element.data("os.tree").opt;
           

                //if (!!opt && !!opt.methods) {

                //    $element.html("");
                //    opt.methods.getDataFunc = function (node, loadFun) {
                //        loadFun($.extend(true,[], treeSource));
                //    }

                //    $element.ostree("render", $element);
                //}
              
                var $element = $(element);

                var treeSource = ko.unwrap(valueAccessor());

                var treeOpt = allbinding.get("treeOpt") || {};
                var treeVal = allbinding.get("treeVal");

                treeOpt.methods = treeOpt.methods || {};

                if (!!treeSource) {
                    treeOpt.methods.getDataFunc = function (node, loadFun) {
                        loadFun($.extend(true, [], treeSource));
                    }
                }
                if (!treeOpt.methods.chosen) {
                    treeOpt.methods.chosen = function (dataItem, element) {
                        treeVal(dataItem);
                    }
                }

                $element.data("os.tree", null);
                $element.html("");
                $element.ostree(treeOpt);
            }
        };


    });