/**
 * Created by liuhui on 15/9/10.
 */
define([
    'views/items/itemsModel'
], function (model) {
    var Collection = Backbone.Collection.extend({
        model: model,
        url: $.urlMap.meetList,
        initialize: function (options) {
            var self=this;
            this.hasMore = 1;
            this.bind('remove',function(){
                --self.totalPn;
            },this);

            if(options.onRemove){
                this.bind('remove',options.onRemove,this);

            }

        },
        parse: function (response) {
            if (!response.errno) {
                var result = response.result;
                var len = result.meetings.length;
                this.totalPn = parseInt(result.total);
                this.hasMore = len < this.totalPn ? 1 : 0;
                this.currentPage = parseInt(result.page);
                return result.meetings;
            } else {
            }
        },
        range: function (start, rn) {
            var begin = start;
            return this.slice(begin, begin + rn);
        },

        getData: function (options) {
            var self = this, rn = options.rn, callback = options.callback, getData, data;

            /*data=this.where({page:options.pn});
             if (data.length == rn||(this.length!=0&&this.length==this.totalPn)) {
             callback && callback.call(this, data);
             return;
             }*/
            this.fetchServer(options);
        },

        fetchServer: function (options) {
            var self = this, timer, callback = options.callback;
            this.currentPage = options.page;
            this.rn = options.rn;

            this.fetch({
                cache:false,
                data: {
                    pageSize: options.pageSize,
                    page: options.page,
                    role: options.role,
                    product: options.product,
                    sort: options.sort,
                    classify:options.classify,
                    by: options.by

                },
                success: function () {
                    if (self.totalPn == self.length) self.hasMore = 0;
                    var data = self.where({page: parseInt(options.page)});

                    callback && callback.call(self, data);

                },
                error: function () {
                    //console.log("error");
                },
                dataType: "json",
                remove: false,
                add: true,
                merge: true
            })

        }
    });
    return Collection;
});