define([], function () {
    var c = {
        //mode: "devalopment",       
        shellsBaseUrl: 'Shells/',
        errorPage: 'error',
        culture: 'zh-cn',
        theme: 'dark',
        staticMenuPath: "Option/",
        resourceIndexPath: "res/index",
        resourceBasePath: "res/",
        defaultArea: "mainView",
        defaultCenter: 'center',//全国路径名称
        wfStartPath: { center: 'center', common: 'common', branch: 'branch' },//工作流启动路径
        /*全局特殊字符过滤*/
        globalMaskSpecialSymbol: true,
        features: {
            //"vconsole": { path: 'jsRuntime/feature.vconsole', priority: 10 }
        }
    };
    return c;
});