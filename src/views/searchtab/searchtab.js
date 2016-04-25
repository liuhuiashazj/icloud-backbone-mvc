/**
 * Created by liuhui on 15/11/6.
 */
define([
    'text!views/searchtab/tab.tpl',
    'text!views/searchtab/tab.css'
], function (tpl, css) {
    var View = Backbone.BaseView.extend({
        el: '#searchtop',
        tpl: _.template(tpl),
        cssText: css,
        events: $.extend({
            'click .optabs': 'switchTab'

        }, Backbone.BaseView.baseEvents),
        display: function (options) {
            this.options = options;
            this.$el.html(this.tpl({data: options}));

        },
        switchTab: function (e) {
            var $obj = $(e.target);
            var tab = $obj.attr('data-tab');
            if (!tab || tab == this.options.tab) return;
            var options = this.options;

            var word = (options.word);
            var url = encodeURI('#search/' + tab + '/' + word);
            Backbone.history.navigate(url, {
                trigger: true
            });

        }

    });
    return View;
});