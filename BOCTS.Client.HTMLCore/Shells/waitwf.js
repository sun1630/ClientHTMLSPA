define(['jsRuntime/resourceManager', 'jsRuntime/actionManager'],
    function (rm, am) {
        var m = function () {
            var self = this;
            this.rm = rm.global;
            this.am = am.global;

            //生命周期函数  页面加载前执行
            this.activate = function () {
                
            };

            //生命周期函数  页面加载后执行
            this.compositionComplete = function () {
                
            }
        };
        return m;
    });