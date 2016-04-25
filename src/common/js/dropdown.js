/**
 * Created by liuhui on 15/10/10.
 */
/*
 * 右键选择框,基于underscore模板引擎
 * by liuhui
 * @class Dropdown
 * @param
 * {
 *   parent：父级选择器
 *   el:响应click选择器
 *   id: dropdownId  唯一标识
 *   type:1|2  1左键响应 2输入响应 3右键响应，
 *
 *   lists：[{
 *       name：'查看'
 *       value:'see'
 *   }],
 *   url:是否需要远程获取数据,
 *   data:远程请求data
 *   getListCallback:远程获取数据回调
 *   元素必须有data-url属性
 *
 *   tpl：'<li><%=name%><%=value%></li>'列表每项模板
 *   clickCallback：右键回调
 *   selectCallbck:点击回调,
 *   topOffset:
 *   leftOffset:居左偏移
 * }
 *
 * */
require(['jquery'], function ($) {

    $.fn.Dropdown = function (options) {
        var defaultops = {
            id: 'dropdown1',
            leftOffset: 0,
            topOffset: 0,
            lists: []
        };
        var self = this;
        $.extend(defaultops, options);
        options = defaultops;
        this.options = defaultops;
        var tpl = self.options.tpl;
        tpl = _.template(tpl);
        self.$tpl = tpl;

        var $parent = $(options.parent || 'body');
        self.$parent = $parent;
        $('body').on('click', function () {
            self.hide();
        });
        //$parent.off();
        $parent.off('click', options.id + ' li');
        $parent.on('click', '.' + options.id + ' li', function (e) {
            e.stopPropagation();
            var $obj = $(e.currentTarget);
            if(!self.isShow) return;
            options.selectCallback && options.selectCallback.call(self, $obj);

            self.hide();

        });
        if (options.type == 3) {/*右键下拉*/
            $parent.off('contextmenu', options.el);
            $parent.on('contextmenu', options.el, function (e) {

                return false;
            });
            $parent.off('mousedown', options.el);
            $parent.on('mousedown', options.el, function (e) {
                var $obj = $(e.currentTarget);
                e.preventDefault();
                e.stopPropagation();
                /*var ie678 = !-[1,];
                 if (e.button != 0 && !ie678) return;*/
                self.offsetParentLeft = e.offsetX;
                self.offsetParentTop = e.offsetY;
                if (e.button != 2) return;
                options.clickCallback && options.clickCallback.call(self, $obj);

                self.$obj = $obj;
                self.getPos($obj);
                self.setList($obj);

                return;

            });

        } else if (options.type == 1) {/*左键下拉*/
            $parent.off('click', options.el);
            $parent.on('click', options.el, function (e) {
                var $obj = $(e.currentTarget);
                e.stopPropagation();
                if (self.isShow) {
                    self.hide();
                    return;
                }

                self.$obj = $obj;
                self.getPos($obj);
                self.setList();
                return;
            });

        } else if (options.type == 2) {/*输入下拉提示*/
            $parent.off('keydown', options.el);
            $parent.on('keydown', options.el, function (e) {
                var $obj = $(e.currentTarget);
                if (e.keyCode == 8 && !$obj.val()) {/*回退*/
                    e.preventDefault();
                    options.delCallback && options.delCallback.call(self, $obj);
                } else if (e.keyCode == 38) {/*向上键*/
                    e.preventDefault();
                    self.goPrev(e);
                } else if (e.keyCode == 40) {/*向下键*/
                    e.preventDefault();
                    self.goNext(e);
                }
            });
            $parent.off('keyup', options.el);
            $parent.on('keyup', options.el, function (e) {
                var $obj = $(e.currentTarget);
                var val = $obj.val();
                if (e.keyCode == 13 && val == self.lastWord) {/*回车并且值没有变化*/
                    e.preventDefault();
                    var $li = self.$currentLi && self.$currentLi[0] ? self.$currentLi : (self.$drop ? self.$drop.find('li:first-child') : []);
                    options.enterCallback && options.enterCallback.call(self, $obj, $li);
                    self.hide();
                } else if (e.keyCode != 38 && e.keyCode != 40) {
                    /*if (self.lastWord != val) {*/
                    self.options.word = val;
                    self.getAjaxLists($obj);
                    /*}*/

                }
                self.lastWord = val;
            });

        }

    };
    $.extend($.fn.Dropdown.prototype, {
        scrollToEle: function () {
            var top = this.$drop.find('.cur')[0].offsetTop;
            var curTop = this.$drop.find('.sug')[0].scrollTop;
            if (top > (curTop + 85) || top <= curTop) {
                this.$drop.find('.sug').scrollTop(top);
            }
        },
        goPrev: function () {
            var self = this;
            if (self.$drop[0]) {
                if (!self.$currentLi) {
                    self.$currentLi = self.$drop.find('li:last-child').addClass('cur');
                } else {
                    var $cur = self.$currentLi.prev()[0] ? self.$currentLi.prev() : self.$drop.find('li:last-child');
                    self.$currentLi.removeClass('cur');
                    self.$currentLi = $cur.addClass('cur');

                }
                self.scrollToEle();

            }
        },
        goNext: function () {
            var self = this;
            if (!self.$currentLi) {
                self.$currentLi = self.$drop.find('li:first-child').addClass('cur');
            } else {
                var $cur = self.$currentLi.next()[0] ? self.$currentLi.next() : self.$drop.find('li:first-child');
                self.$currentLi.removeClass('cur');
                self.$currentLi = $cur.addClass('cur');
            }
            self.scrollToEle();
        },
        setCur: function () {
            var self = this;
            self.$currentLi = self.$drop.find('li:first-child').addClass('cur');
        },

        getAjaxLists: function ($obj) {
            var self = this;
            var options = this.options;
            var role = $obj.attr('data-role');
            var data = $obj.attr('data-data');
            var newData = {};
            if (data) {
                newData = $.urlToJson(data);
            }
            var word, url;
            url = $.urlMap[role];
            self.$obj = $obj;
            word = $obj.val();
            if (!word) {
                this.hide();
                return;
            }
            self.getPos($obj);
            if (!url) {/*不需要远程调取数据时*/
                self.setList();
                return;
            }
            clearTimeout(self.ajax1);
            self.ajax1 = $.ajax({
                cache: false,
                url: url,
                dataType: 'json',
                type: 'GET',
                data: $.extend({
                    kw: word
                }, newData),
                success: function (data) {
                    options.getListCallback && options.getListCallback.call(self, data);
                    self.setList();
                }
            });
        },
        setList: function () {
            var self = this;
            if (!this.options.lists.length) {
                this.hide();
                return;
            }
            this.createDrop();
            var tpl = self.$tpl;
            self.$drop.css({
                left: self.options.left,
                top: self.options.top
            });

            var str = tpl(self.options);
            self.$drop.html(str);
            if (this.options.defaultSelect) self.setCur();
            self.show();

        },
        getPos: function ($obj) {
            var self = this;
            self.$obj = $obj;
            var $parent = this.$parent;
            var offsetParent = $parent.offset();
            var offset = $obj.offset();
            var options = this.options;
            var left = self.offsetParentLeft || 0;
            var top = self.offsetParentTop || 0;
            options.left = offset.left - offsetParent.left + options.leftOffset;
            options.top = offset.top - offsetParent.top + $obj.height() + options.topOffset;
            if (self.options.useClickCoord) {/*使用点击坐标*/
                options.left = left + offset.left - offsetParent.left + options.leftOffset + 5;
                options.top = top + offset.top - offsetParent.top + options.topOffset + 5;
            }
            if (self.options.limitSpace) {/*限制下拉框的范围*/
                var llen = this.options.lists.length * 28 + 10;
                var maxTop = $parent.height() - llen;
                options.top = options.top < maxTop ? options.top : (options.top - llen);
            }

            return;
        },
        createDrop: function () {
            var $drop, self = this, options = this.options;
            var $parent = this.$parent;
            $drop = $('.' + options.id);
            $drop.remove();
            $drop = $('<div class="' + options.id + '"></div>');
            if (options.css) $drop.css(options.css);
            $drop.appendTo($parent).addClass('dropdown');
            self.$drop = $drop;
        },

        show: function () {
            this.isShow = 1;
            this.$drop && this.$drop.show();

        },
        hide: function (time) {
            var self = this;
            time = time || 0;
            setTimeout(function () {
                if (!self.$drop) return;
                self.$drop.html('');
                self.isShow = 0;
                self.$drop.hide();
                delete self.$currentLi;
            }, time);

        }
    });
});
