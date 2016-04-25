/**
 * Created by liuhui on 15/8/20.
 */

define(['jquery',
    'backbone',
    'text!common/tpl/confirm.tpl',
    'text!common/tpl/introduce.tpl'
], function ($, Backbone, confirmtpl,introducetpl) {
    var baseEvents = {
        'mouseenter table tr': 'mouseon',
        'mouseleave table tr': 'mouseout',
        'click .back': 'goBack',
        'click .cancel': 'goBack'
    };
    var View = Backbone.View.extend({
        init: $.fn.emptyFn,
        display: $.fn.emptyFn,
        template: $.fn.emptyFn,
        confirmtpl: _.template(confirmtpl),
        introducetpl:_.template(introducetpl),
        data: {},
        modal: {},
        events: baseEvents,
        cssText: '',
        initialize: function (options) {
            var self = this;
            this.insertCss();
            this.on('loadMore', function () {
                self.loadMore && self.loadMore();
            });
            this.init && this.init(options);

        },

        insertCss: function (css) {
            if (css) {
                $('head').append($("<style>" + css + "</style>"));
                return;
            }
            if (this.hasInsertCss) return;
            this.hasInsertCss = true;
            if (this.cssText) {
                $('head').append($("<style>" + this.cssText + "</style>"));
            }

        },
        beforeDisplay: function () {
            /*var id=this.$el.attr('id');
             this.drop.rightClick = new $.fn.Dropdown({
             parent: '#'+id,
             el: '.fname',
             id: 'dropdown6',
             type: 3,
             useClickCoord:1,
             leftOffset: 0,
             clickCallback:function($obj){
             $obj=$obj.parents('tr');
             var $tab=$obj.parents('table');
             $tab.find('tr').removeClass('select');
             $obj.addClass('select');
             var fid=$obj.attr('data-fid');
             //$obj.find('input').click();
             var down=$obj.attr('data-down');
             var edit=$obj.attr('data-edit');
             var del=$obj.attr('data-del');
             var rename=$obj.attr('data-del');
             var lists=[];
             down&&lists.push({
             name:'下载',
             value:down?'down':0,
             fid:fid
             });
             edit&&lists.push({
             name:'编辑',
             value:edit?'edit':0,
             fid:fid
             });
             del&&lists.push({
             name:'删除',
             value:del?'del':0,
             fid:fid
             });
             rename&&lists.push({
             name:'重命名',
             value:rename?'rename':0,
             fid:fid
             });
             this.options.lists=lists;

             },
             tpl: '<%for(var i=0;i<lists.length;i++){var l=lists[i];%><%if(l.value){%><li data-fid="<%=l.fid%>" data-value="<%=l.value%>" ><%=l.name%></li><%}%><%}%>',

             selectCallback: function ($obj) {
             var value = $obj.attr('data-value');
             var fid=$obj.attr('data-fid');
             var el='#f'+fid+' .'+value;
             var $target=self.$el.find(el);
             $target.click();

             }
             });*/
        },

        render: function (options,pop) {
            //this.$el.append(this.template());
            this.beforeDisplay && this.beforeDisplay.call(this, options,pop);
            this.isGoBack = 0;
            this.isShowing=1;
            this.display(options,pop);
            this.afterDisplay && this.afterDisplay.call(this, options,pop);
        },
        mouseon: function (e) {
            $(e.currentTarget).addClass('on');
        },
        mouseout: function (e) {
            $(e.currentTarget).removeClass('on');
        },

        openConfirm1: function (mid, callback) {
            var self = this;

            self.modal.confirm1 = new $.fn.Modal({
                id: '#wrapdel3',
                closeButton: ".close2",
                okButton: '.bbutton',
                layid: '#lean_overlay6',
                stopClickClose: 1,
                cls: 'wrapdel',
                data: {
                    tips: '删除后会议中上传的文件也将一并删除且不可恢复，确定删除？'
                },

                okCallBack: function (e) {
                    self.upDelMeet(mid, callback);
                    self.modal.confirm1.hide();
                },
                callScope: self,
                tpl: self.confirmtpl
            });

            self.modal.confirm1.show();
        },
        openConfirm2: function (fid, mid, callback) {
            /*删除文件前二次确认*/
            var self = this;
            self.modal.confirm2 = new $.fn.Modal({
                id: '#wrapdel2',
                closeButton: ".close2",
                okButton: '.bbutton',
                layid: '#lean_overlay5',
                cls: 'wrapdel',
                stopClickClose: 1,
                css: {
                    zIndex: 12000
                },

                data: {
                    tips: '删除后不可恢复，确定删除？'
                },
                okCallBack: function (e) {
                    self.upDelFile(fid, mid, callback);
                    self.modal.confirm2.hide();
                },
                callScope: self,
                tpl: self.confirmtpl
            });

            self.modal.confirm2.show();
        },
        upDelFile: function (fid, mid, callback) {
            var self = this;
            $.ajax({
                cache: false,
                url: $.urlMap.delFile,
                type: 'POST',
                dataType: 'json',
                data: {
                    fids: fid,
                    source: self.source || 'meeting',
                    sid: mid
                },
                success: function (data) {
                    if (data.errno) return;
                    callback && callback.call(self);
                }
            });

        },
        upDelMeet: function (mid, callback) {
            $.ajax({
                cache: false,
                url: $.urlMap.cancelMeet,
                data: {
                    mid: mid
                },
                type: 'POST',
                dataType: 'json',
                success: function (data) {

                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }
                    callback && callback.call(self);

                }
            });
        },
        goListPage: function (options) {
            if (!options.role) options.role = 'all';
            if (!options.product) options.product = 'all';
            if (!options.page) options.page = 1;
            Backbone.history.navigate('#meeting/' + options.route + '/' + options.role + '/' + options.product + '/' + options.page, {trigger: true});
        },

        goDetailPage: function (options) {
            Backbone.history.navigate('#detail/' + options.route + '/' + options.detail + '/' + options.page, {trigger: true});
        },
        goEditPage: function (options) {
            options.copy = options.copy || 0;
            Backbone.history.navigate('#editmeet/' + options.mid + '/' + options.copy, {trigger: true});
        },
        
        goIboxPage: function (options) {
            var url = options ? '#ibox/' + options.fid : '#ibox/0';
            Backbone.history.navigate(url, {trigger: true});
        },
        goTeamPage:function(options){
            var url = options ? '#team/' + options.fid : '#team/0';
            Backbone.history.navigate(url, {trigger: true});
            Backbone.Events.trigger('LoadTeamCTree',options.fid);
        },
        goCatePage:function(cate){
            var url = '#'+cate;
            Backbone.history.navigate(url, {trigger: true});

        },
        goMainPage: function (cate) {
            if(this.isIbox){
                this.goIboxPage();
                return;
            }
            Backbone.history.navigate('#'+cate, {trigger: true});
        },

        show: function () {
            this.$el.show();
        },
        hide: function () {
            this.$el.hide();
        },
        switchViews: function (viewName) {
            for (var i in this.views) {
                if (i == viewName) this.views[i].show();
                else {
                    this.views[i].isShowing=0;
                    this.views[i].hide();
                    this.views[i].destory && this.views[i].destory();
                }
            }
            return;

        },
        initView: function (View, viewName) {
            var self = this;
            if (!self.views[viewName]) {
                self.views[viewName] = new View();

            }
            self.switchViews(viewName);
            return;

        },
        stopDefault: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        /*返回上一级*/
        goBack: function () {
            this.isGoBack = 1;
            if (window.history.length == 1) {

                window.close();
                return;
            }
            window.history.go(-1);

        },
        showNoMore: function (hideFirst) {
            if (hideFirst) {
                this.$el.find('.loading').hide();
                return;
            }
            this.$el.find('.loading').addClass('nomore').html('没有更多了').show();

        }

    });
    Backbone.BaseView = View;
    Backbone.BaseView.baseEvents = baseEvents;
    return View;
});