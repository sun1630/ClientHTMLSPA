require(["jQuery"], function ($) {
    
    //s(document.getElementById("abc"));
    $.fn.inputFormat = function(opts){
        var opts = $.extend({},opts);
        var reg = opts.reg;
        
        var evtname = opts.evtname || "keyup";
        $(this).bind(evtname, function (evt) {
            var value = $(this).val();
            if (!value.match(reg)) {
                if (this.__oldValue !== undefined) this.value = this.__oldValue;
                else this.value = "";
                return false;
            }
        });
    }
    require("jsRuntime/jqueryExtend", function () { return $; });
    require("jqueryExtend", function () { return $; });
});