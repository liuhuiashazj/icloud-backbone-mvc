/**
 * Created by liuhui on 15/11/16.
 *
 */
define([
    'text!views/file/file.tpl',
    'text!views/file/file.css'
], function (tpl, css) {
    var View = Backbone.BaseView.extend({
        el: '#file',
        tpl: _.template(tpl),
        cssText: css,
        tpl403: _.template('<div class="inner">如有问题请联系<%if(data.isIbox){%>文件所有者<%}else{%>会议负责人<%}%>：<span><%=data.name%></span><%if(data.hi){%><span>Hi: <a href="baidu://message/?id=<%=data.hi%>"><%=data.hi%></a></span><%}%><span>E-mail: <a href="mailto:<%=data.email%>"><%=data.email%></a></span></div>'),

        events: $.extend({
            'click .op8 span': 'clickop8',
            'click .editname': 'editname',
            'keydown .fname input': 'enterFname',
            'blur .fname input': 'blurName',
            'click .crename': 'clickCancelRename',
            'click .gomain': 'goMainPage',
            'click .gomeet': 'goMeet'

        }, Backbone.BaseView.baseEvents),
        init:function(){
            var self=this;
            $(window).on('resize',function(){
                if(self.isShow){
                    self.reRender();
                }
            });
        },
        reRender:function(){
            var self=this;
            self.insertData(self.lastData);
        },
        destory:function(){
            this.isShow=0;
        },
        display: function (options) {
            var self = this, fid = options.fid, url;
            this.isShow=1;
            this.options = options;
            if (!/^\d+$/.test(fid)) {
                this.isIbox = 1;
                fid = fid.replace('ibox', '');
                this.options.fid = fid;
                url = $.urlMap.iboxfileInfo;
            } else {
                this.isIbox = 0;
                url = $.urlMap.fileInfo;
            }

            $.ajax({
                url: url,
                data: {
                    fid: fid,
                    source: self.isIbox ? 'person' : 'meeting'

                },
                dataType: 'json',
                type: 'get',
                success: function (data) {
                    var url = self.isIbox ? $.urlMap.iboxfileInfo : $.urlMap.meetInfo;
                    switch (data.errno) {
                        case 20009:
                        case 30008:

                            $.ajax({
                                url: url,
                                dataType: 'json',
                                type: 'GET',
                                cache: false,
                                data: {
                                    fid: self.options.fid,
                                    isnotify: self.isIbox ? 1 : 0
                                },
                                success: function (data) {
                                    if (data.errno) return;
                                    data = data.result;
                                    data.isIbox = self.isIbox;

                                    var str = $('<div class="m404 f404"></div>').html(self.tpl403({
                                        data: data
                                    }));
                                    self.$el.html(str);
                                }
                            });
                            return;
                            break;
                        case 30002:
                            self.$el.html($('<div class="m403 f403"></div>'));
                            return;
                            break;

                    }
                    self.lastData=data.result;

                    self.insertData(data.result);

                }
            });

        },
        insertData: function (data) {

            var w1 = this.$el.width() - 0,
            h1 = window.innerHeight - 175,
            h2=window.innerHeight-180,
            str;
            this.options.mid = data.meetingInfor.mid;
            data.infor.width = w1;
            //data.infor.height = !this.isIbox?h1:h2;
            data.infor.height=h1;
            data.infor.meet = data.meetingInfor.title;
            data.infor.mid = data.meetingInfor.mid;
            data.isIbox = this.isIbox;
            str = this.tpl({data: data});
            this.$el.html(str);
        },
        clickop8: function (e) {/*文档列表图标操作*/
            e.stopPropagation();
            var obj = $(e.currentTarget);
            var name = obj.attr('class');
            if (name.match(/down/)) {
                this.downfile(e);
            } else if (name.match(/del/)) {
                this.delfile(e);
            } else if (name.match(/edit/)) {
                this.goEditFile(obj);
            } else if (name.match(/rename/)) {
                //this.editname(obj);

            }

        },
        downfile: function (e) {
            var fid = this.options.fid;
            var mid = this.options.mid || 0;
            var source = this.isIbox ? '' : 'meeting';
            window.open($.urlMap.downFile + '?fid=' + fid + '&source=' + source + '&sid=' + mid + '&t=' + new Date().getTime());

        },
        goEditFile: function (obj) {
            var url = obj.attr('data-url');
            window.open(url, '_blank');
        },
        delfile: function (e, type) {
            var self = this;
            var fid = this.options.fid;
            var mid = this.options.mid || 0;
            this.openConfirm2(fid, mid, function () {
                $.fn.tips('删除成功！', 1);
                self.goMainPage();
            });
        },
        goMeet: function (e) {
            if (this.isIbox) {
                var fid = $(e.target).attr('data-fid');
                Backbone.Events.trigger('UpdateTree', fid);
                this.goIboxPage({fid: fid});
                return;
            }
            var options = {
                route: 'detailm',
                detail: 'all',
                page: this.options.mid
            };
            this.goDetailPage(options);

        },
        editname: function (e) {
            this.$el.find('.editname').hide();
            var fname = this.$el.find('.fname');
            var useCancel = 1;
            var name = fname.attr('data-name');
            var ext = fname.attr('data-ext');
            fname.attr('data-editing', 1);

            var nameWithoutExt = name.replace(/\.\w+$/, '');

            var str = _.template('<input value="<%=name%>"/><%if(ext){%>.<%=ext%><%}%><%if(useCancel){%><span class="crename"></span><%}%>')({
                name: nameWithoutExt,
                ext: ext,
                useCancel: useCancel
            });
            fname.html(str);
            fname.find('input').select().focus();

        },
        clickCancelRename: function (e) {
            this.lockCancel = 1;
            e.stopPropagation();
            var obj = $(e.currentTarget);
            var $fname = obj.parents('.fname');
            $fname.attr('data-editing', 0);
            $fname.html($fname.attr('data-name'));
            this.$el.find('.editname').show();

        },
        enterFname: function (e) {/*重命名事件*/
            var $obj = $(e.currentTarget);
            var val = $obj.val();
            if (e.keyCode == 13) {
                e.preventDefault();
                if (!val) {
                    $.fn.tips('名字不能为空');
                    return;
                }
                $obj[0].blur();
            }
        },
        blurName: function (e) {
            var self = this;
            //alert('blur');
            setTimeout(function () {
                self.resetName(e);
            }, 200);
        },
        resetName: function (e) {/*设置重命名*/
            if (this.lockCancel) {
                this.lockCancel = false;
                return;
            }
            var self = this;
            var $obj = $(e.currentTarget);
            var val = $obj.val();
            var $fname = $obj.parents('.fname');
            var ext = $fname.attr('data-ext');
            val = ext ? (val + '.' + ext) : val;

            $.ajax({
                cache: false,
                url: $.urlMap.renameFile,
                type: 'POST',
                dataType: 'json',

                data: {
                    fid: self.options.fid,
                    name: val,
                    sid: self.options.mid,
                    source: self.isIbox ? '' : 'meeting'
                },
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }
                    $fname.attr('data-editing', 0);
                    $fname.html(val);
                    $fname.attr('data-name', val);
                    self.$el.find('.editname').show();
                    $.fn.tips('修改成功！', 1);

                }
            });

        }

    });
    return View;
});