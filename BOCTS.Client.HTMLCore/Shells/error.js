define(['jsRuntime/dataManager'],function (dm) {
    var vm = function () {
        this.errorMsg = dm.__errorMessage__ || "出错了，请联系管理员。";
    };
    return vm;
})