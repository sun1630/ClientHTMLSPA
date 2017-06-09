define(['jsRuntime/viewManager', 'jsRuntime/utility', 'jsRuntime/resourceManager'],
    function (vm, utility, rm) {
    var act = function () {
        this.$inputs = "*";
        this.$outputs = "*";
        this.activityName = 'ShowScreenActivity';
        this.displayArea = null;
    }
     
    act.prototype.Execute = function (context, done) {
       //todo:
        done(); 
    }; 
    return act;
})