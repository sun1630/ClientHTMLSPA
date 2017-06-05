define(['durandal/system', 'require', 'jsRuntime/eventAggregator', 'jsRuntime/utility'], function (system, require, evtAgtor, util) {
    requirejs.config({
        paths: {
            'config/client': 'Config/client',
            'config/data': 'Config/data',
            'config/services': 'Config/services',
            "inputmask.dependencyLib": "Scripts/mask/inputmask.dependencyLib.jquery",
            "inputmask": "Scripts/mask/inputmask",
            "inputmaskExtend": "Scripts/mask",
            "jqui": "Scripts/jquery-ui-1.11.4.min"
        },
        shim: {}
    });
    var initConfig = function (cm, feature) {
        var features = cm.client.features;
        feature.config(features);
    }

    var cfg = {
        config: function () {
            return system.defer(function (dfd) {
                require(["jsRuntime/configManager", "jsRuntime/feature"], function (cm, feature) {
                    initConfig(cm, feature);
                    dfd.resolve();
                    //dfd.reject();
                });
            }).promise();
        }
    };
    return cfg;
});