/**
 * edit.js Created by liuhui on 15/9/16.
 */
define([
    'text!common/tpl/top.tpl',
    /*页面上部*/
    'text!views/edit/edit.css',
    'text!views/edit/suggest.tpl',
    'common/js/jquery.datetimepicker'

], function (tpl, css, tplsug) {

    var View = Backbone.BaseView.extend({
        el: '#editmeet',
        cssText: css,
        template: _.template(tpl),
        tplsug: _.template(tplsug),
        events: $.extend({
            'focus .wnew input': 'focusInput',//校验
            'blur .wnew input': 'blurInput',
            'click .sright span': 'delSpan', /*删除已填*/
            'click .sright': 'focusInput',
            'click .send': 'submitForm',
            'click .save': 'submitForm'

        }, Backbone.BaseView.baseEvents),
        modal: {},
        drop: {},
        init: function () {
            var self = this;
            window.onbeforeunload = function () {
                self.isSave && window.opener.onCloseNewMeet(self.options.mid);
            };
            this.date = $.fn.getCurDate();
        },

        display: function (options) {
            var self = this;
            this.options = options;
            options.data = {};
            options.date = this.date;
            this.insertData(function () {
                self.initDrop();
                self.setDateTime();
            });

        },
        insertData: function (callback) {
            var self = this;
            var tdata = {};
            var options = this.options;
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
                    data = data.result;

                    self.options.mid = data.mid;
                    Backbone.Events.trigger('updateData', {mid: data.mid});
                    if (data.meeting_stime) {
                        self.date.stime = data.meeting_stime.split(' ');
                        self.date.etime = data.meeting_etime.split(' ');
                    }

                    self.options.data = data;
                    self.options.htitle = self.options.copy == 1 ? '会议复制' : '编辑会议';
                    self.$el.html(self.template(options));
                    Backbone.Events.trigger('insertDoclist', options);
                    callback && callback.call(self);
                }
            });
        },
        destory: function () {
            this.$el.html('');
        },
        initDrop: function () {
            /*输入框搜索下拉提示*/
            var self = this;
            var eleid = this.$el.attr('id');
            this.drop.sug = new $.fn.Dropdown({
                parent: '#' + eleid,
                id: 'dropdown2',
                el: '.wnew input[data-role]',
                type: 2,
                leftOffset: 0,
                topOffset: 0,
                defaultSelect: 1,
                css: {
                    minWidth: 202
                },
                tpl: tplsug,
                getListCallback: function (data) {
                    var $obj = this.$obj;
                    var role = $obj.attr('data-role'), pid = $obj.attr('id');
                    this.options.role = role;
                    this.options.pid = pid;
                    if (role == 'person') {
                        this.options.lists = data.result;
                    } else if (role == 'address') {
                        this.options.lists = data.result.rows || [];
                    } else if (role == 'product') {
                        this.options.lists = data.result.rows || [];
                    }

                },
                selectCallback: function ($obj) {
                    if (this.options.role != 'product' && this.options.role != 'address') {
                        self.buildSug($obj);
                        return;
                    }
                    var content = $obj.attr('data-name');
                    this.$obj.val(content);
                },
                delCallback: function ($obj) {
                    var $parent = $obj.parent();
                    $parent.find('span').last().remove();

                },
                enterCallback: function ($obj, $li) {
                    if (!$li.length && $obj.val()) {
                        //创建li
                        var val = $obj.val().split('@')[0], pid = $obj.attr('id');
                        $li = $('<li></li>').attr({
                            'data-id': val,
                            'data-name': val,
                            'data-pid': pid
                        }).html(val);

                    }
                    if (!$li.length) return;
                    if (this.options.role != 'product' && this.options.role != 'address') {
                        self.buildSug($li);
                        return;
                    } else {
                        var content = $li.attr('data-name');
                        content && $obj.val(content);
                        return;
                    }

                }

            });
        },

        focusInput: function (e) {
            var $obj = $(e.currentTarget);
            if ($obj.hasClass('sright')) {
                $obj.find('input').focus();
            } else {

                $obj = $obj.parent();
            }
            $obj.removeClass('errno').addClass('focus');
        },
        blurInput: function (e) {
            var $obj = $(e.currentTarget);
            var self = this;
            var $parent = $obj.parent();
            var tips = $obj.attr('data-tips');

            $parent.removeClass('focus');
            clearTimeout(this.checking);
            this.checking = setTimeout(function () {
                self.checkInput($obj);
            }, 200);

        },
        checkInput: function ($obj) {
            var check = $obj.attr('data-check');
            if (!check || this.isGoBack)return true;
            var $parent = $obj.parent();
            if (!$parent) return false;
            var tips = $obj.attr('data-tips');

            if (check.match(/need/) && tips == 'self' && !$obj.val()) {
                $.fn.tips('该项不能为空！');
                $parent.addClass('errno');
                return false;
            }
            if (check.match(/need/) && tips == 'parent' && $parent.find('span').length < 1) {
                $.fn.tips('该项不能为空！');
                $parent.addClass('errno');
                return false;
            }
            if (check.match(/only/) && tips == 'parent' && $parent.find('span').length > 1) {
                $.fn.tips('仅允许输入一项！');
                $parent.addClass('errno');
                return false;
            }
            return true;

        },

        submitForm: function () {
            var self = this;
            var resDate = this.checkDate();
            var res = this.checkall();
            res = res && resDate;
            if (!res) return;
            var data = this.getFormData();
            data.mid = this.options.mid;
            var url = $.urlMap.submitMeet;
            if (this.options.route == 'editmeet' && this.options.copy != 1) {
                url = $.urlMap.updateMeet;
                delete(data.files);
            }
            $.ajax({
                cache: false,
                url: url,
                type: 'POST',
                dataType: 'json',
                data: data,
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }
                    $.fn.tips("保存成功！", 1);
                    if (self.options.route == 'newmeet') {
                        self.isSave = true;
                        setTimeout(function () {
                            window.close();

                        }, 1000);

                    } else {

                        var options = {
                            route: 'detailm',
                            detail: 'all',
                            page: self.options.mid
                        };
                        window.updateItem = true;

                        self.goDetailPage(options);

                    }

                }

            });

        },
        checkDate: function () {
            var start = [], end = [];
            this.$el.find('.wtime input').each(function (index, input) {
                var t1 = $(input).attr('data-time');
                if (index <= 1) {
                    start.push(t1);
                } else {
                    end.push(t1);
                }
            });
            var str1 = start.join(' ').replace(/-/g, '/');
            var str2 = end.join(' ').replace(/-/g, '/');
            var stime = new Date(str1);
            var etime = new Date(str2);
            if (stime >= etime) {
                $.fn.tips('结束时间要大于开始时间!');
                this.$el.find('.wtime input').addClass('errno');
                return false;
            }
            this.$el.find('.wtime input').removeClass('errno');
            return true;
        },
        checkall: function () {
            var self = this;
            var $inputs = this.$el.find('input');
            var res = true;
            for (var i = 0, l = $inputs.length; i < l; i++) {//检查不通过
                var $obj = $($inputs[i]);
                var c1 = self.checkInput($obj);
                res = res && c1;
                if (!c1) {
                    break;
                }
            }

            return res;
        },

        getFormData: function () {
            var $inputs = this.$el.find('input');
            var obj = {};
            $inputs.each(function (index, input) {
                var name = $(input).attr('name');
                var val = $(input).val();
                if (name) {
                    if ($(input).attr('type') == 'checkbox') {
                        val = input.checked ? 1 : 0;
                    }
                    obj[name] = val;
                }

            });
            //debugger;
            //obj.address = this.$el.find('.wadress .val').html();
            obj.owner = this.$el.find('.wperson .val').attr('data-id');
            var $attends = this.$el.find('.wattend .val'), arr = [];
            $attends.each(function (index, li) {
                arr.push($(li).attr('data-id'));
            });
            obj.attends = arr.join(',');
            var start = [], end = [];
            this.$el.find('.wtime input').each(function (index, input) {
                var t1 = $(input).attr('data-time');
                if (index <= 1) {
                    start.push(t1);
                } else {
                    end.push(t1);
                }
            });
            obj.meeting_stime = start.join(' ');
            obj.meeting_etime = end.join(' ');
            /*由于文件上传时及已和会议绑定，故不需要再传*/
            //obj.files = this.getFileStr();
            return obj;
        },

        buildSug: function ($obj) {
            var id = $obj.attr('data-id'), name = $obj.attr('data-name'), pid = $obj.attr('data-pid');
            var $span = $('<span class="val" />').attr('data-id', id).html(name);
            var has = $('#' + pid).parent().find('span[data-id="' + id + '"]').length;
            $('#' + pid).val('').focus();
            if (has) {
                $.fn.tips('已经添加了');
                return false;
            }
            $span.insertBefore('#' + pid);
            return true;

        },
        delSpan: function (e) {
            var $obj = $(e.currentTarget);
            $obj.remove();
        },

        setDateTime: function () {
            var self = this;
            var $d1 = $('#datemonth'), $d2 = $('#datetimer'), $d3 = $('#datemonth1'), $d4 = $('#datetimer1');

            var configDate = {
                dayOfWeekStart: 1,
                lang: 'zh',
                format: 'Y-m-d',
                /*minDate: self.date.minDate,*/
                maxDate: self.date.maxDate,
                formatDate: 'Y-m-d',
                step: 5,
                timepicker: false,
                yearStart: 2015,
                yearEnd: 2020,
                style: 'color:red',
                validateOnBlur: true
            };
            var configTime = {
                lang: 'zh',
                datepicker: false,
                format: 'H:i',
                step: 30
            };
            $d1.datetimepicker($.extend({
                value: self.date.stime[0],
                onChangeDateTime: function (ct) {
                    var time = ct.dateFormat('Y-m-d');
                    $d1.attr('data-time', time);
                    $d3.val(time).attr('data-time', time);
                }
            }, configDate));

            $d2.datetimepicker($.extend({
                value: self.date.stime[1],
                onChangeDateTime: function (ct) {
                    var time = ct.dateFormat('H:i');
                    var end= $.addTimeHours(ct,1).dateFormat('H:i');
                    $d2.attr('data-time', time);
                    $d4.val(end).attr('data-time', end);
                }
            }, configTime));
            $d3.datetimepicker($.extend({
                value: self.date.etime[0],
                onChangeDateTime: function (ct) {
                    var time = ct.dateFormat('Y-m-d');
                    $d3.attr('data-time', time);
                }
            }, configDate));

            $d4.datetimepicker($.extend({
                value: self.date.etime[1],
                onChangeDateTime: function (ct) {
                    var time = ct.dateFormat('H:i');
                    $d4.attr('data-time', time);
                }
            }, configTime));
        }
    });
    return View;
});