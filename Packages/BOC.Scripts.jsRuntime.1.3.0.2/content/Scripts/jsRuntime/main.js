'use strict';
var baseUrl = '/';

window.onerror = function fnErrorTrap(sMsg, sUrl, sLine) {
    if (window.AppHost) window.AppHost.getLogHelper().error(sMsg + sUrl + sLine);
    return false;
}
requirejs.config({
    baseUrl: baseUrl,
    paths: {
        'text': 'Scripts/text',
        'durandal': 'Scripts/durandal',
        'plugins': 'Scripts/durandal/plugins',
        'transitions': 'Scripts/durandal/transitions',
        'activities': 'Scripts/activities',
        'knockvalidation': 'Scripts/knockout.validation',
        'jsRuntime': 'Scripts/jsRuntime',
        'widgets': 'Scripts/widgets',
    },
    shim: {
    }
});
define('jquery', function () { return jQuery; });
define('knockout', ko);

define('knockvalidation', function (kovalidation) {
    ko.validation.configure({
        decorateElement: false,
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: false,
        parseInputAttributes: true,
        messageTemplate: null,
        errorClass: 'error'
    });
});

//给KO添加扩展
ko.bindingHandlers.timetext = {
    init: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor()); // Get the current value of the current property we're bound to
        $(element).html(value.substring(11, 19)); // jQuery will hide/show the element depending on whether "value" or true or false
    },
    update: function (element, valueAccessor, allBindings) {
        // Leave as before
    }
};
var scripts = document.getElementsByTagName('script');
var runtimeConfig = null;
for (var i = scripts.length - 1; i >= 0 ; i--) {
    runtimeConfig = scripts[i].getAttribute('data-runtime-config');
    if (runtimeConfig)
        break;
}

define(['require', 'durandal/system', 'durandal/viewLocator', 'durandal/app'],
    function (require, system, viewLocator, app) {

        var appInit = function () {
            require(['jsRuntime/configManager', "jsRuntime/workflowManager", 'jsRuntime/appBridge'], function (cm, wm, appBridge) {
                var root = 'Shells/' + cm.client.shell + '/layout';
                system.acquire(root).then(function (modul) {
                    viewLocator.locateViewForObject(modul).then(function () {
                        app.title = cm.client.appTitle;
                        app.configurePlugins({
                            dialog: true
                        });
                        $log("debug", "app start..");
                        app.start().then(function () {
                            viewLocator.useConvention();
                            app.setRoot(root);
                        });
                    });
                });
            });
        }
        var appError = function () {
            require(['jsRuntime/configManager'], function (cm) {
                var errorPage = 'Shells/' + cm.client.shell + '/' + (cm.client.errorPage || 'error');
                system.acquire(errorPage).then(function (modul) {
                    viewLocator.locateViewForObject(modul).then(function () {
                        app.title = cm.client.appTitle;
                        app.start().then(function () {
                            viewLocator.useConvention();
                            app.setRoot(errorPage);
                        });
                    })
                })
            });
        }
        if (runtimeConfig) {
            requirejs.config({
                paths: {
                    'appConfig': runtimeConfig
                }
            });
            require([runtimeConfig], function (cfg) {
                cfg.config().then(function () {
                    require(["jsRuntime/actionManager"], function (am) {
                        am.global.swalllowCardAndSendWq({ "wqMessge": "App Starting swalllowCardAndSendWq" }).always(function (ret) {
                            am.global.enableSiu();
                            appInit();
                        });
                    });
                }).fail(function () {
                    appError();
                });
            });
        }
        else {
            console.debug('need data-runtime-config attribute in script link.');
        }

    });
