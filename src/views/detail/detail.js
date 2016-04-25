/**
 * Created by liuhui on 15/11/5.
 */
define([
    'text!common/tpl/top.tpl',
    'text!views/detail/detail.css',
    'common/js/jquery.datetimepicker'
], function (tpl, css) {
    var View = Backbone.BaseView.extend({
        el: '#detail',
        cssText: css,
        template: _.template(tpl),
        tpl403: _.template('<div class="inner">如有问题请联系会议负责人：<span><%=data.name%></span><%if(data.hi){%><span>Hi: <a href="baidu://message/?id=<%=data.hi%>"><%=data.hi%></a></span><%}%><span>E-mail: <a href="mailto:<%=data.email%>"><%=data.email%></a></span></div>'),
        events: $.extend({
            'click .op3>span': 'clickop3'

        }, Backbone.BaseView.baseEvents),
        modal: {},
        init: function () {
            var self = this;
            window.onbeforeunload = function () {
                self.isSave && window.opener.onCloseNewMeet(self.options.mid);
            };
            this.date = $.fn.getCurDate();
        },
        destory: function () {
            this.$el.html('').hide();
        },
        display: function (options) {
            var self = this;
            this.options = options;
            this.$el.show();
            this.insertData();

        },
        insertData: function (callback) {
            var self = this;
            var options = this.options;
            var tdata = {};
            if (options.mid) {
                tdata.mid = options.mid;
            }
            if ((options.route == 'editmeet' && options.copy == 1) || options.route == 'newmeet') {
                tdata.act = 'incr';
            }
            $.ajax({
                cache: false,
                url: $.urlMap.meetDetail,
                data: tdata,
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    if (data.errno) {
                        switch (data.errno) {
                            case 20009:
                            case 30008:
                                $.ajax({
                                    url: $.urlMap.meetInfo,
                                    dataType: 'json',
                                    type: 'GET',
                                    cache: false,
                                    data: {
                                        sid: self.options.mid
                                    },
                                    success: function (data) {
                                        if(data.errno) return;
                                        data=data.result;
                                        var str = $('<div class="m404"></div>').html(self.tpl403({
                                            data: data
                                        }));
                                        self.$el.html(str);
                                    }
                                });

                                break;
                            case 20001:
                            case 30002:
                                self.$el.html($('<div class="m403"></div>'));
                                break;

                        }
                        return;
                    }
                    data = data.result;
                    options.mid = data.mid;
                    self.date.stime = data.meeting_stime.split(' ');
                    self.date.etime = data.meeting_etime.split(' ');
                    options.data = data;
                    switch (options.route) {
                        case 'detailm':
                            options.htitle = $.allConfig.mapMeeting[options.role];
                            break;
                        case 'detailp':
                            options.htitle = self.options.role;
                            break;
                        case 'meeting':
                            options.htitle = $.allConfig.mapMeeting[options.role];
                            break;
                        case 'editmeet':
                            options.htitle = options.copy == 1 ? '会议复制' : '编辑会议';
                            break;
                    }

                    self.$el.html(self.template(options));
                    Backbone.Events.trigger('insertDoclist', options);
                }
            });
        },
        clickop3: function (e) {
            var obj = $(e.currentTarget);
            e.preventDefault();
            var name = obj.attr('class');
            if (name.match(/edit/)) {
                this.goEdit(e);
            } else if (name.match(/del/)) {
                this.delMeet(e, this.options.mid);

            } else if (name.match(/copy/)) {
                this.goCopyMeet(e);
            } /*else if (name.match(/add/)) {
                this.addSum(e);
            }*/
        },
        delMeet: function (e, mid) {
            var self = this, obj;
            e.stopPropagation();
            if (!mid) {
                obj = $(e.currentTarget).parents('tr');
                mid = obj.attr('data-mid');
            }

            this.openConfirm1(mid, function () {
                $.fn.tips("删除成功！", 1);
                window.updateItem=true;
                self.goMainPage('meeting');
            });
            return;

        },
        /*addSum: function (e) {*//*添加会议纪要*//*
            var $obj=$(e.currentTarget),url;
            url=$obj.attr('data-url');
            window.open(url, 'newwindow');
            *//*var self = this;
            console.log(e.target);
            var options = self.options;
            $.ajax({
                cache: false,
                url: '/v1/disk/createdoc',
                data: {
                    filename: options.data.title,
                    source: 'meeting',
                    sid: self.options.mid
                },
                dataType: 'json',
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }
                    var url=data.result.url;
                    window.open(url, 'newwindow');

                }
            });*//*
        },*/
        goEdit: function () {/*跳转至编辑页*/
            var options = this.options;
            this.goEditPage(options);
        },
        goCopyMeet: function (e) {/*跳转至复制会议页*/
            var options = this.options;
            options.copy = 1;
            this.goEditPage(options);
        }
    });
    return View;
});