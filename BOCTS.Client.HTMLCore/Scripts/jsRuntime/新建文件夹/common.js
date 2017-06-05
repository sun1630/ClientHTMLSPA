//该文件主要是定义一些全局的变量与机制
// 1 可用于require的单例模式
// 2 $log重定向
(function (Global, document, undefined) {
    if (Global.$singleon) return;
    var caches = {};
    


    Global.$singleon = function (name,isFactory,factory) {
        var item = caches[name]
        if (item !== undefined) return item;
        if (factory === undefined) {
            factory = isFactory; isFactory = false;
        }
        return caches[name] = isFactory?factory():factory;
    }

})(window, document);