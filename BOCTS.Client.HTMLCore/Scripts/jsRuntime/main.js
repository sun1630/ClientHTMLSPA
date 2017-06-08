'use strict';
var baseUrl = '/';

//window.onerror = function fnErrorTrap(sMsg, sUrl, sLine) {
//    if (window.AppHost) window.AppHost.getLogHelper().error(sMsg + sUrl + sLine);
//    return false;
//}
requirejs.config({
    urlArgs:'v=1125',
    //urlArgs: 'bust=' + (new Date()).getTime(),
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
        'udl': 'Scripts/udl',
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
            require(['jsRuntime/configManager'], function (cm) {
                var root = 'Shells/layout';
                system.acquire(root).then(function (modul) {
                    viewLocator.locateViewForObject(modul).then(function () {
                        system.debug(true);
                        app.title = cm.client.appTitle;
                        app.configurePlugins({
                            dialog: true
                        });
                        
                        //$log("debug", "app start..");
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
                var errorPage = 'Shells/'+ (cm.client.errorPage || 'error');
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
            require([runtimeConfig], function (cfg) {
                cfg.config().then(function () {
                    appInit();
                }).fail(function () {
                    appError();
                });
            })
        }
        else {
            console.debug('need data-runtime-config attribute in script link.');
        }
});