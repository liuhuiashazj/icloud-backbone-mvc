/**
 * Created by liuhui on 15/8/20.
 */
/**
 * fnav.jsCreated by liuhui on 15/8/18.
 */
define([
    'text!views/fnav/fnav.tpl',
    'text!views/fnav/fnav.css',
], function (tpl, css) {
    var View = Backbone.BaseView.extend({
        el: '#fnav',
        cssText: css,
        template: _.template(tpl),
        events: {
            'click .lnav li a':'preventDefault',
            'click .lnav li': 'goRoute'
        },
        init: function () {
        },
        display: function (options,ops) {
            this.options = options;

            this.$el.html(this.template({data:ops}));//插入dom元素

            this.$el.find('li').removeClass('cur');

            if (options.route == 'search' && options.tab == 'docs') {

            } else if (options.route == 'ibox' || (options.route == 'file' && options.fid.match(/ibox/))) {
                this.$el.find('.ibox').addClass('cur');
            } else if (options.route == 'team') {
                this.$el.find('.team').addClass('cur');
            } else {
                this.$el.find('.meeting').addClass('cur');
            }

        },
        preventDefault:function(e){
            e.preventDefault();
        },
        goRoute: function (e) {

            var cls = $(e.currentTarget).attr('class').replace('cur', '');
            switch (cls) {
                case 'ibox':
                    Backbone.Events.trigger('UpdateTree', 0);
                    break;
                case 'meeting':
                    break;
                default:
                    break;
            }
            this.goMainPage(cls);/*todo */

        }
    });
    return View;
});