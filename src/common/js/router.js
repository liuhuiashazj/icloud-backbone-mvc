/**
 * router.js Created by liuhui on 15/8/18.
 */
define([

    'common/js/base',
    'common/js/baseView',
    'common/js/webuploader',
    'common/js/leanModal',
    'common/js/dropdown',
    'common/js/jquery.datetimepicker',
    'common/js/base2',
    'common/js/dropdown1',

    'common/js/treedata2',
    'common/js/tree2',

    'text!common/tpl/confirm.tpl',
    'text!common/tpl/doclist.tpl',
    'text!common/tpl/meeting.tpl',
    'text!common/tpl/preview.tpl',
    'text!common/tpl/upload.tpl'
], function () {
    var Router = Backbone.Router.extend({
        routes: {
            /*cate meeting|product*/
            /*role 对应角色或者产品线*/
            /*meeting/meeting/creator/all/1*/
            /*meeting/product/all/安师大发水电费/1*/
            'meeting/:cate/:role/:product/:page': 'meeting',
            'meeting':'meeting',
            /*cate meet|product*/
            /*detail/detailp/a-stream/1726*/
            /*detail/detailm/all/1726*/
            'detail/:cate/:role/:mid': 'detailmeet',
            /*copy 1|0*/
            'editmeet/:mid/:copy': 'editmeet',
            'newmeet': 'newmeet',
            /*cate meet|doc*/
            'search/:tab/:word': 'search',
            'file/:fid': 'file',

            'myfile/:fid': 'myfile',
            'ibox': 'ibox',
            'ibox/': 'ibox',
            'ibox/:fid': 'ibox',

            'team': 'team',
            'team/:fid': 'team',

            "*actions": "all"

        },
        views: {},
        currentViews: [],
        handler: function (typename) {
            return function () {
                var ops = [].slice.call(arguments);
                this.handleRoute(typename, ops);
            }

        },
        showFnav:function(options){
            var team=options.team- 0,person=options.person- 0,meeting=options.meeting- 0,total;
            total=team+person+meeting;
            return total>1;

        },
        initialize: function (options) {
            var self = this;
            self.poptions=options;
            window.onCloseNewMeet = function (mid) {
                window.updateItem = true;
                Backbone.history.navigate(
                '#detail/detailm/all/' + mid, {
                    trigger: true
                });

            };
            Backbone.Events.on('updateData', function (options) {
                $.each(self.views, function (index, view) {
                    view.trigger('updateData', options);
                });
            });
            $.fn.scrollLoadMore({
                /*添加滚动loadmore功能*/
                el: '.lists'
            });
            Backbone.Events.on('loadMore', function (options) {
                $.each(self.currentViews, function (index, view) {
                    view.trigger('loadMore', options);
                });
            });
            Backbone.Events.on('insertDoclist', function (options) {
                $.each(self.currentViews, function (index, view) {
                    view.trigger('insertDoclist', options);
                });
            });
            var shownav=this.showFnav(options);
            !shownav&&$('body').addClass('hidefnav');
            window.TOTALLEFT = shownav?70:0;
            Backbone.Events.on('dragleft', function (x) {
                var minLeft = shownav?191:204+window.TOTALLEFT, maxLeft = 450;
                x = self.limit(x, minLeft, maxLeft);
                $('#wrapibox').css({
                    left: x
                });
                $('#treeleft').css({
                    width: x - window.TOTALLEFT
                });
                $('#treeleft2').css({
                    width: x - window.TOTALLEFT
                });
            });

        },
        limit: function (i, min, max) {
            return i < min ? min : i > max ? max : i;
        },
        /*每个route配置项*/
        getViewConfig: function (route, ops) {

            var config = {

                meeting: {
                    options: {
                        route: ops[0] || 'meeting',
                        role: ops[1] ,
                        product: ops[2] ,
                        page: ops[3] || 1
                    },
                    paths: [
                        {path: 'views/head/head'},
                        {path: 'views/fnav/fnav'},
                        {path: 'views/nav/nav'},
                        {path: 'views/items/items', el: '#items'}
                    ]
                },
                detailmeet: {
                    options: {
                        route: ops[0] || 'detailm',
                        role: ops[1] || 'all',
                        mid: ops[2]
                    },
                    paths: [
                        {path: 'views/head/head'},
                        {path: 'views/fnav/fnav'},
                        {path: 'views/nav/nav'},
                        {path: 'views/detail/detail'},
                        {path: 'views/doclist/doclist', el: '#doclist'}
                    ]
                },
                editmeet: {
                    options: {
                        route: 'editmeet',
                        role: 'all',
                        copy: parseInt(ops[1]),
                        mid: ops[0]
                    },
                    paths: [
                        {path: 'views/head/head'},
                        {path: 'views/fnav/fnav'},
                        {path: 'views/nav/nav'},
                        {path: 'views/edit/edit', el: '#editmeet'},
                        {path: 'views/doclist/doclist', el: '#doclist'}
                    ]
                },
                search: (function () {
                    var module = ops[0] == 'docs' ? {
                        path: 'views/doclist/doclist',
                        el: '#searchall'
                    } : {
                        path: 'views/items/items',
                        el: '#searchall'
                    };
                    return {
                        options: {
                            route: 'search',
                            tab: ops[0],
                            word: ops[1]
                        },
                        paths: [
                            {path: 'views/head/head'},
                            {path: 'views/fnav/fnav'},
                            {path: 'views/searchtab/searchtab'},
                            module
                        ]
                    }
                })(),
                file: {
                    options: {
                        route: 'file',
                        fid: ops[0]
                    },
                    paths: [
                        {path: 'views/head/head'},
                        {path: 'views/fnav/fnav'},
                        {path: 'views/file/file'}
                    ]
                },
                newmeet: {
                    options: {
                        route: 'newmeet'
                    },
                    paths: [
                        {path: 'views/edit/edit', el: '#newtop'},
                        {path: 'views/doclist/doclist', el: '#newtab'}
                    ]
                },
                ibox: {
                    options: {
                        route: 'ibox',
                        fid: ops[0]
                    },
                    paths: [
                        {path: 'views/head/head'},
                        {path: 'views/fnav/fnav'},
                        {path: 'views/iboxleft/iboxleft'},
                        {path: 'views/iboxdocs/iboxdocs', el: '#iboxlist'}
                    ]
                },
                team: {
                    options: {
                        route: 'team',
                        fid: ops[0]
                    },
                    paths: [
                        {path: 'views/head/head'},
                        {path: 'views/fnav/fnav'},
                        {path: 'views/teamleft/teamleft'},
                        {path: 'views/team/team'}
                    ]

                }
            };
            return config[route];
        },
        /*每个route view渲染*/
        handleRoute: function (type, ops) {
            var self = this;
            var conf = this.getViewConfig(type, ops);
            var options = conf.options;
            var viewConfig = conf.paths;
            var urls = _.pluck(viewConfig, 'path');
            require(urls, function () {
                var views = [].slice.call(arguments);
                self.renderView(views, viewConfig, options);

            });

        },
        /*单个view渲染*/
        renderView: function (views, viewConfig, options) {
            var self = this;
            self.data = {};
            var currentViews = [];
            $('#wrapper').removeClass().addClass('r' + options.route);
            $.each(this.currentViews, function (index, view) {/*摧毁之前的view*/
                view.destory && view.destory(options);
            });

            $.each(views, function (index, View) {/*渲染新的view*/
                var name = viewConfig[index].path;
                var el = viewConfig[index].el;
                var view = self.views[name];
                if (!self.views[name]) {
                    view = new View(self.poptions);
                }
                if (el) {
                    view.setElement(el);
                }
                view.parent = self;
                self.views[name] = view;
                view.render(options,self.poptions);
                currentViews.push(view);
            });

            this.currentViews = currentViews;

        },
        team: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('team', ops);

        },

        meeting: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('meeting', ops);
        },

        detailmeet: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('detailmeet', ops);

        },

        editmeet: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('editmeet', ops);
        },

        search: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('search', ops);

        },

        file: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('file', ops);

        },

        newmeet: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('newmeet', ops);
        },

        ibox: function () {
            var ops = [].slice.call(arguments);
            this.handleRoute('ibox', ops);

        },
        all:function(){
            var options=this.poptions;
            var ops = [].slice.call(arguments);
            if(options.person=='1'){
                this.handleRoute('ibox', ops);
            }else if(options.meeting=='1'){
                this.handleRoute('meeting', ops);
            }else if(options.team=='1'){
                 this.handleRoute('team', ops);
            }



        }
    });
    return Router;
});
