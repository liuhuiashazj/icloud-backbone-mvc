/**
 * head.js Created by liuhui on 15/8/18.
 */
define([
    'text!views/head/search.tpl',
    'text!views/head/search.css'
], function (tpl, css) {
    var View = Backbone.BaseView.extend({
        el: '#head',
        cssText: css,
        template: _.template(tpl),
        tplUser: _.template('<img src="<%=avatar%>" alt="<%=realName%>"/><span class="arrow"></span><div class="more">Hello，<%=realName%><br/><%if(isadmin){%><a href="/admin/loglist">系统日志</a><br/><%}%><span class="logout">退出</span><span class="ar"></span></div>'),
        events: {
            /*'keyup .searchinput': 'suggest',*/
            'focus .searchinput': 'focus',
            'blur .searchinput': 'blur',
            'click .close': 'close',
            'click .logout': 'logout',
            'click .arrow': 'unfold',
            'click .more': 'more',
            'click .listsearch': 'search'
        },
        drop: {},
        init: function (pop) {
            var self = this;
            this.$el.html(this.template({data:pop}));//插入dom元素
            $('body').click(function () {
                self.$el.find('.more').hide();
                self.$el.find('.arrow').removeClass('unfold');
            });
            $.ajax({
                cache:false,
                url: $.urlMap.userInfo,
                dataType: 'json',
                success: function (data) {
                    $.userInfos = data.result;
                    self.$el.find('.avatar').html(self.tplUser(data.result));
                }
            });
            this.initSearchDropDown();
        },
        initSearchDropDown: function () {
            var self = this;
            this.drop.suggest = new $.fn.Dropdown({
                parent: 'body',
                id: 'dropdown3',
                el: '.searchinput',
                type: 2,
                leftOffset: 0,
                topOffset: -2,
                defaultSelect: 1,
                lists: [{
                    name: '相关文档',
                    value: 'docs'
                },
                    {
                        name: '相关会议',
                        value: 'meet'
                    }

                ],
                css: {
                    minWidth: 199,
                    width: 272
                },

                tpl: '<div class="sug"><%for(var i=0;i<lists.length;i++){%><li data-tab="<%=lists[i].value%>" data-word="<%=word%>">搜<span><%=word%></span><%=lists[i].name%></li><%}%></div>',
                selectCallback: self.search,
                enterCallback: function ($obj, $li) {
                    self.search($li);

                }
            });
        },
        display: function (options,pop) {


        },
        search: function ($obj) {

            var word = $obj.attr('data-word');
            var tab = $obj.attr('data-tab')||'docs';
            //this.hideSugLater();
            if (!word) {/*没有下拉提示时也默认搜索会议*/
                word=this.$el.find('.searchinput').val();
            }
            Backbone.history.navigate('#search/' + tab + '/' + word, {
                trigger: true
            });

        },
        focus: function (e) {
            $(e.target).parent().addClass('focus');
        },
        blur: function (e) {
            var self = this;
            self.hideSugLater(e);


        },
        hideSugLater: function (e) {
            var self = this;
            if (this.hideSug) clearTimeout(this.hideSug);
            this.hideSug = setTimeout(function () {
                self.$el.find('.listsearch').hide();
                $(e.target).parent().removeClass('focus');
            }, 200);
        },
        close: function (e) {
            this.$el.find('.searchinput').val("");
        },

        logout: function (e) {
            window.location.href = $.urlMap.logout;

        },
        more: function (e) {
            e.stopPropagation();
        },
        unfold: function (e) {
            e.stopPropagation();
            $(e.target).toggleClass('unfold');
            var show = $(e.target).hasClass('unfold');
            if (show) {
                this.$el.find('.more').show();
            } else {
                this.$el.find('.more').hide();
            }
        }
    });
    return View;
});