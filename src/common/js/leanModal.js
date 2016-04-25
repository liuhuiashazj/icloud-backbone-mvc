/*by liuhui
 *
 * 默认构建弹层内容，但不显示
 *
 弹出层组件：
 id：弹层容器选择器
 layid：遮罩层选择器
 zIndex:弹层起始z-index
 closebutton：关闭按钮选择器
 closeCallback：关闭回调
 okcallback：确认按钮选择器
 show:显示弹层
 hide:隐藏弹层


 *
 *
 * */
require(['jquery'], function ($) {

    $.fn.Modal = function (options) {
        var id, width, $overlay, $parent, maskid, okButton, css, data, self = this,height;
        this.options = options;
        data = options.data || {};
        okButton = options.okButton || '#ok';
        options.callScope=options.callScope||this;
        maskid = options.layid || "#lean_overlay";
        id = options.id;
        css = $.extend({
            display: "block",
            position: "fixed",
            opacity: 0,
            left: 50 + "%",
            top: 50+"%",
            overlay: 0.5,
            zIndex: 11000
        }, options.css);
        this.css = css;

        $parent = $(id);
        $parent.remove();
        $parent = $("<div></div>").attr('id', id.split('#')[1]);
        $("body").append($parent);
        $parent.addClass('wrapup');
        if(options.cls) $parent.addClass(options.cls);

        $overlay = $(maskid);
        $overlay.remove();
        $overlay = $("<div></div>").attr('id', maskid.split('#')[1]);
        $("body").append($overlay);
        $overlay.addClass('lean_overlay');

        this.$parent = $parent;
        this.$overlay = $overlay;
        width = $parent.outerWidth();
        height=$parent.outerHeight();

        this.width = width;
        css.zIndex && this.$overlay.css('zIndex', css.zIndex);
        css["margin-left"] = -(width / 2) + "px";
        css['margin-top']=-(height / 2) + "px";
        css["z-index"] = css.zIndex + 1;

        var events = options.events || {};
        for (var i in events) {
            var arr = i.split(" ");
            var func = events[i];
            var event = arr.shift();
            var selector = arr.join(" ");
            (function (func) {
                $parent.on(event, selector, function (e) {
                    func && func.call(options.callScope, e);
                })
            })(func);

        }


        $overlay.click(function () {
            !options.stopClickClose&&self.close_modal(id);
        });
        /*绑定关闭事件*/
        $parent.on('click', options.closeButton, function () {
            self.close_modal(id);
        });

        /*绑定确定事件*/
        $parent.on('click', okButton, function (e) {
            var okData=options.okData||{};
            options.okCallBack && options.okCallBack.call(options.callScope,e,okData);
        });
        var htmlparent = options.tpl(data);
        $parent.html(htmlparent);
        //创建成功回调
        options.createCallBack && options.createCallBack.call(options.callScope);

    };
    $.extend($.fn.Modal.prototype, {
        show: function () {
            var self = this;
            var $overlay = this.$overlay;
            var $parent = this.$parent;
            var options = this.options;

            $overlay.css({
                display: "block",
                opacity: 0.5
            });
            options.beforeShow&&options.beforeShow.call(options.callScope);
            //$overlay.fadeTo(200, self.css.overlay);
            $parent.css(self.css);
            $parent.fadeTo(200, 1);
            options.showCallBack && options.showCallBack.call(options.callScope);
        },
        hide: function () {
            var self = this;
            var $overlay = this.$overlay;
            var $parent = this.$parent;
            var options = this.options;
            $overlay.fadeOut(200);
            $parent.css({"display": "none"});
             options.closeCallBack && options.closeCallBack.call(options.callScope);
        },
        close_modal: function () {

            this.hide();

        },
        remove: function () {
            this.$parent.remove();
            this.$overlay.remove();
        }
    });

});

