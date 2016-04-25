/**
 * items.js
 * Created by liuhui on 15/9/25.
 */
define([
    'text!views/items/items.css',
    'views/items/itemsCollection',
    'text!common/tpl/meeting.tpl'
], function (css, collection, listtpl) {

    var View = Backbone.BaseView.extend({
        /*显示详情页*/
        el: '#items',
        cssText: css,
        events: $.extend({
            'click .detail': 'goDetail',
            'click .delmeet': 'delMeet',
            'click .status': 'goStatus',
            'click .by': 'sortBy'
        }, Backbone.BaseView.baseEvents),
        listtpl: _.template(listtpl),
        
        pagetpl: _.template('已加载<%=data.index%>/全部<%=data.totalPn%>'),
        drop: {},
        rn: 20,
        options: {},
        init: function () {
            var self = this;
            this.collection = new collection({
                onRemove: function (model, collection, options) {
                    var strpage = self.pagetpl({
                        data: {
                            index: collection.length,
                            totalPn: collection.totalPn
                        }
                    });
                    self.$el.find('.page').html(strpage);
                    self.$el.find('table .total').html('(' + collection.totalPn + ')');
                    options.obj.remove();
                    $.fn.tips("删除成功！", 1);
                }
            });

            this.initSort();
            this.parentEl = this.$el.parents('.lists')[0];

        },
        isLast: function (options) {
            for (var i in options) {
                var last = this.options;
                if (options[i] != last[i]) {
                    return false;
                }
            }
            return true;
        },

        display: function (options) {
            options = $.extend({}, options);
            console.log(options);
            if(options.route=='meeting'&&
                options.role===undefined&&
                options.product===undefined){
                this.$el.html(this.introducetpl(options)).show();
                return;
            }
            var page = options.page || 1;
            if (this.isLast(options) && !window.updateItem && options.route != 'search') {
                this.$el.show();
                this.parentEl.scrollTop = this.lastTop;
                return;
            }
            window.updateItem = false;
            this.options = options;
            this.currentPage = parseInt(page);
            this.$el.show();
            this.reset();
            if (options.route == 'search') {/*搜索*/
                this.showSearchList();
            } else {
                this.showMeetList();
            }

        },
        loadMore: function () {
            var self = this;
            if (!this.hasMore) {
                return;
            }
            this.currentPage++;
            if (this.options.route == 'search') {/*搜索*/
                this.showSearchList(1);
            } else {
                this.showMeetList(1);
            }

        },
        destory: function () {
            this.$el.hide();
        },

        /*导航到详情页*/
        goDetail: function (e) {
            var mid = $(e.currentTarget).attr('data-mid');
            if (!mid) return;
            var options = $.extend({}, this.options);
            var route = options.route;
            options.route = route == 'product' ? 'detailp' : 'detailm';
            options.detail = route == 'product' ? options.product : options.role;
            options.page = mid;
            this.lastTop = this.parentEl.scrollTop;
            this.goDetailPage(options);
        },

        sortBy: function (e) {
            e.stopPropagation();
            var $obj = $(e.currentTarget);
            var value = $obj.attr('data-by');
            var newValue = value == 'asc' ? 'desc' : 'asc';
            this.options.by = newValue;
            $obj.removeClass(value).addClass(newValue).attr('data-by', newValue);
            this.reset();
            this.showMeetList(2);
        },
        initSort: function () {
            var self = this;
            this.drop.sort = new $.fn.Dropdown({
                parent: '#items',
                el: '.sort',
                id: 'dropdown5',
                type: 1,
                lists: [{
                    name: '会议开始时间',
                    value: 'stime'
                },
                    {
                        name: '会议创建时间',
                        value: 'ctime'
                    }
                ],
                css: {
                    width: 150
                },
                leftOffset: 0,
                topOffset: 0,
                tpl: '<%for(var i=0;i<lists.length;i++){%><li data-value="<%=lists[i].value%>" ><%=lists[i].name%></li><%}%>',
                tplSpan: '<span class="op5"><%=name%></span>',

                selectCallback: function ($obj) {
                    var value = $obj.attr('data-value');
                    self.options.sort = value;
                    self.reset();
                    self.showMeetList(2);
                }
            });
        },
        reset: function () {
            this.currentPage = 1;
            this.collection.reset();
        },
        goStatus: function (e) {
            var self = this;
            var $obj = $(e.target);
            var classify = $obj.attr('data-classify');
            $obj.parents('.status').find('li').removeClass();
            $obj.parents('li').addClass('on');
            if (classify == undefined) return;
            self.options.classify = classify;
            self.reset();
            self.showMeetList(2);
        },

        /*显示会议列表*/
        showMeetList: function (loadMore) {
            if (this.isLoading) return;
            this.isLoading = 1;
            var self = this;
            var options = this.options;
            var role = options.role === 'all' ? '' : options.role;
            var product = options.product === 'all' ? '' : options.product;
            var sort = options.sort || 'ctime';
            var by = options.by || 'desc';
            var page = this.currentPage;
            var classify = options.classify || '';

            this.collection.getData({
                role: role,
                product: product,
                page: page,
                pageSize: self.rn,
                sort: sort,
                by: by,
                classify: classify,
                callback: function (data) {
                    self.isLoading = 0;
                    data = _.pluck(data, 'attributes');
                    var result = $.extend({}, self.options);
                    result.data = data;
                    result.pn = page;
                    result.meeting = $.allConfig.mapMeeting[options.role];
                    result.index = this.length;
                    /*当前多少条*/
                    result.totalPn = this.totalPn;
                    result.showWrap = 1;
                    result.hasMore = this.hasMore;
                    self.hasMore = this.hasMore;
                    result.sort = sort;
                    result.by = by;
                    result.classify = classify;
                    var strlist;
                    var strpage = self.pagetpl({data: result});
                    if (!loadMore) {/*整体刷新*/
                        strlist = self.listtpl({data: result});
                        self.$el.html(strlist);
                        self.$el.find('.page').html(strpage);
                        !this.hasMore && self.showNoMore(1);

                    } else if (loadMore == 1) {/*加载更多时*/
                        result.showWrap = 0;
                        strlist = self.listtpl({data: result});
                        self.$el.find('table tbody').append(strlist);
                        self.$el.find('.page').html(strpage);
                        !this.hasMore && self.showNoMore(0);

                    } else {/*局部刷新*/
                        result.showWrap = 0;
                        result.hideNo = 1;
                        strlist = self.listtpl({data: result});
                        self.$el.find('table .detail').remove();
                        self.$el.find('table tbody').append(strlist);
                        self.$el.find('.page').html(strpage);
                        self.$el.find('table .total').html('(' + result.totalPn + ')');
                        if (this.hasMore) {
                            var $load = self.$el.find('#listwrap .loading');
                            if ($load.length == 0) {
                                $load = $('<div class="loading" ></div>');
                                self.$el.find('#listwrap').append($load);
                            }
                            $load.removeClass('nomore').html('').show();
                        } else {
                            self.showNoMore(1);
                        }
                        //!this.hasMore && self.showNoMore(1);

                    }

                }
            });
        },

        delMeet: function (e, mid) {
            var self = this, obj;
            e.stopPropagation();
            if (!mid) {
                obj = $(e.currentTarget).parents('tr');
                mid = obj.attr('data-mid');
            }

            this.openConfirm1(mid, function () {

                self.collection.remove(self.collection.get(mid),{
                    obj:obj
                });


            });
            return;

        },

        showSearchList: function (loadMore) {
            var options = this.options;
            var self = this;
            $.ajax({
                cache: false,
                url: $.urlMap.searchMeet,
                dataType: 'json',
                type: 'GET',
                data: {
                    kw: options.word,
                    page: self.currentPage,
                    pageSize: self.rn
                },
                success: function (data) {
                    if (data.errno) return;
                    data = data.result;
                    var newData = {};
                    self.hasMore = data.has_more;
                    newData.hasMore = self.hasMore;
                    newData.isSearch = 1;
                    //newData.totalPn = data.meetings.length;
                    newData.pn = self.currentPage;
                    newData.data = data.meetings;
                    if (!loadMore) {
                        newData.showWrap = 1;
                        var str = self.listtpl({data: newData});
                        self.$el.html(str);
                        !self.hasMore && self.showNoMore(1);
                    } else {
                        newData.showWrap = 0;
                        var str2 = self.listtpl({data: newData});
                        self.$el.find('table tbody').append(str2);
                        !self.hasMore && self.showNoMore(0);
                    }

                }

            });
        }

    });
    return View;
});