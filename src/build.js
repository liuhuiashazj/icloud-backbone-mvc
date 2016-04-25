/**
 * Created by liuhui on 15/4/17.
 */
({
    map: {
        '*': {
            'css': 'libs/css'
        }
    },
    baseUrl: '.',
    dir: '../build',
    fileExclusionRegExp: /^(r|build)\.js$/,

    optimizeCss: "standard",
    /*optimize: "none",*/
    modules: [{
        name: 'main'
    },{
        name:'views/detail/detail',
        exclude:['main']
    },{
        name:'views/doclist/doclist',
        exclude:['main']
    },{
        name:'views/edit/edit',
        exclude:['main']
    },{

        name:'views/fnav/fnav',
        exclude:['main']
    },{
        name:'views/head/head',
        exclude:['main']
    },
    {
        name:'views/nav/nav',
        exclude:['main']
    },
    {
        name:'views/items/items',
        exclude:['main']
    },
    {
        name:'views/searchtab/searchtab',
        exclude:['main']
    },
    {
        name:'views/file/file',
        exclude:['main']
    },
    {
        name:'views/iboxdocs/iboxdocs',
        exclude:['main']
    },
    {
        name:'views/iboxleft/iboxleft',
        exclude:['main']
    },
    {
        name:'views/team/team',
        exclude:['main']
    },
    {
        name:'views/teamleft/teamleft',
        exclude:['main']
    }

    ],
    /*urlArgs: "ver=" + (new Date()).getTime(),*/
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
    removeCombined: true,
    paths: {
        jquery: 'libs/jquery',
        underscore: 'libs/underscore',
        backbone: 'libs/backbone',
        text: 'libs/text'
    }

})