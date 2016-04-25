/**
 * main.js Created by liuhui on 15/8/18.
 */
'use strict';
var date = new Date().getTime();
var _appVersion = date;

require.config({
    map: {},
    baseUrl: '.',
    shim: {
        jquery: {
            exports: '$'
        },
        underscore: {
            exports: '_'
        },

        backbone: {
            deps: [
                'jquery',
                'underscore'
            ],
            exports: 'Backbone'
        }
    },
    urlArgs: "ver=" + _appVersion,
    paths: {
        jquery: 'libs/jquery',
        underscore: 'libs/underscore',
        backbone: 'libs/backbone',
        text: 'libs/text'
    }
});
require([
    'backbone',
    'text',
    'common/js/router'

], function (Backbone, text, Router) {
    $.get($.urlMap.personlize,{
        _:new Date().getTime()
    }, function (data) {
        if(data.errno){
            return;
        }
        document.title=data.result.title;
        var router = new Router(data.result);
        Backbone.history.start();
    });

});