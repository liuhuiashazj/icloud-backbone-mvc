/**
 * nav.js
 * Created by liuhui on 15/8/18.
 */
define([
    'text!views/nav/nav.tpl',
    'text!views/nav/nav.css'
], function (tpl, css) {
    var View = Backbone.BaseView.extend({
        el: '#nav',
        cssText: css,
        template: _.template(tpl),
        events: {
            'click .listnav li': 'goList',
            'click .addnew': 'addNew',
            'click .tabnav li': 'switchRoute'
        },
        init: function () {
        },
        display: function (options) {
            var self = this;
            this.options = options;
            if (options.route == 'product' || options.route=='detailp') {
                $.ajax({
                    cache:false,
                    url: $.urlMap.productList,
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        if (data.errno) {
                            $.fn.tips(data.errmsg);
                            return;
                        }
                        options.data = data.result;
                        self.$el.html(self.template(options));//插入dom元素
                    }
                });
            } else {
                self.$el.html(self.template(options));//插入dom元素
            }

        },
        goList: function (e) {
            var role = $(e.target).attr('data-role');
            var product = $(e.target).attr('data-product');
            var options = this.options;

            options.page = 1;
            if (role) {
                options.role = role;
                options.route = 'meeting';
                options.product = 'all';
                this.goListPage(this.options);
            } else if (product) {
                options.route = 'product';
                options.product = product;
                options.role = 'all';
                this.goListPage(this.options);
            }
        },
        switchRoute: function (e) {
            var route = $(e.target).attr('data-route');
            this.options.route = route;
            this.options.product = 'all';
            this.options.role = 'all';
            this.goListPage(this.options);
        },
        addNew: function () {
            var w1 = 850;
            var h1 = 620;
            var iTop = (window.screen.height - 30 - h1) / 2; //获得窗口的垂直位置;
            var iLeft = (window.screen.width - 10 - w1) / 2; //获得窗口的水平位置;
            var str = 'toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,top=' + iTop + ',height=' + h1 + ',width=' + w1 + ',left=' + iLeft;
            window.open('index.html#newmeet', '_blank', str);
        }
    });
    return View;
});