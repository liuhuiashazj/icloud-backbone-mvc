 define([
    'views/iboxdocs/iboxdocs',
    'text!views/team/team.css',
    'text!views/team/welcome.tpl'
], function (DocView, css, welcomeTpl) {
    var docEvent = DocView.prototype.events;
    var View = DocView.extend({
        el: '#wrapteam',
        cssText: css,

        dirtpl: _.template('<%for(var i =0,l=tree.length;i<l;i++){%><span class="<%if(i!=l-1){%>dirs<%}%>" title="<%=tree[i].filename%>" data-id="<%=tree[i].fid%>"><%=tree[i].filename%></span><%if(i!==l-1){%>&gt;<%}%><%}%>'),
        tpl403: _.template('<%if(data.name){%><div class="inner">如需要可联系管理员: <span><%=data.name%></span><%if(data.hi){%><span>Hi: <a href="baidu://message/?id=<%=data.hi%>"><%=data.hi%></a></span><%}%><span>  E-mail: <a href="mailto:<%=data.email%>"><%=data.email%></a></span></div><%}%>'),
        welcomeTpl: _.template(welcomeTpl),
        events: $.extend({
            'click .sort':"sortDocs"
        }, docEvent),
        initExtend: function () {
            var self = this;
            this.bindResize();
            Backbone.Events.on('UpdateTree', function (fid) {
                fid = fid != undefined ? fid : self.fid;
                var url = self.url + '?vfid=' + fid;
                self.tree && self.tree.reloadTree(url);

            });

        },
        useSort:1,
        sort:{},
        pasteId: '#pastewrapteam',
        display: function (options, ops) {
            var self = this, str;
            options.fid = options.fid || '0';
            self.options.parentid = options.fid;
            this.$el.css({
                opacity: 0
            }).show();
            if (options.fid == '0') {
                this.$el.html(this.introducetpl(options));
                self.displayParent();
                return;
            } else {
                self.$el.css({
                    position: 'relative'
                });
            }
            this.showParent(ops);
            self.getFromShare(options.fid);
            self.initModal();
            self.initDropDown();

            self.showDocList(options.fid);
            self.initDrag();

        },
        showParent: function (ops) {
            var self = this, str;
            str = self.template(self.options);
            self.$el.html(str);
            self.$paste = self.$el.find(self.pasteId);
            self.initUploader();
        },
        getDir: function (e) {
            var fid = $(e.currentTarget).attr('data-id') || 0;
            this.goTeamPage({fid: fid});

        },
        setAuthorShow: function (data) {
            var total=data.allow_upload+
                      data.allow_addfolder+
                      data.allow_delete+
                      data.allow_rename+
                      data.allow_download;
            if(total==0){
                this.$el.find('.op1').hide();
                return;
            }
            this.$el.find('.op1').show();
            this.$el.find('#fileupload').css({
                display:data.allow_upload?'inline-block':'none'
            });
            this.$el.find('.newdir').css({
                display:data.allow_addfolder?'inline-block':'none'
            });
            this.$el.find('.del').css({
                display:data.allow_delete?'inline-block':'none'
            });
            this.$el.find('.rename').css({
                display:data.allow_rename?'inline-block':'none'
            });
            this.$el.find('.down').css({
                display:data.allow_download?'inline-block':'none'
            });




        },
        displayParent: function () {
            this.$el.css({
                opacity: 1
            });
        },
        sortDocs:function(e){
            var obj=$(e.currentTarget).find('.by'),sort,order;
            sort=obj.attr('data-sort');
            order=obj.hasClass('asc')?'desc':'asc';
            obj.removeClass().addClass('by '+order);
            this.sort={
                sort:sort,
                by:order
            };
            this.showDocList(this.options.parentid);
        },
        showDocList: function (fid) {
            var self = this, url = $.urlMap.iboxList, options = this.options, data = {}, fromShare = this.fromShare;
            window.hasInputFocus = 0;
            if (this.fromShare) {/*表示文件夹*/
                url = $.urlMap.tfilelist;

            } else {
                url = $.urlMap.tfilelist;
            }
            data.fid = fid;
            $.extend(data,self.sort);
            $.ajax({
                url: url,
                data: data,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    switch (data.errno) {
                        case 30002:/*文件不存在*/
                        case 60004:/*空间不存在*/
                            self.$el.html($('<div class="m404"></div>'));
                            self.displayParent();
                            return;
                            break;

                        case 30008:/*无权限页*/
                            $.ajax({
                                url: $.urlMap.ownerinfor,
                                dataType: 'json',
                                type: 'GET',
                                cache: false,
                                data: {
                                    vfid: fid
                                },
                                success: function (data) {
                                    data = data.result;

                                    var str = $('<div class="m403"></div>').html(self.tpl403({
                                        data: data
                                    }));
                                    self.$el.html(str);
                                    self.displayParent();
                                    return;
                                }
                            });

                            break;
                    }

                    if (data.errno) {
                        return;
                    }

                    var newData, fileInfor, access_type, str, str2;
                    data = data.result;
                    var auths = data.auths || {};

                    if (data.docs.length == 0 && auths.allow_upload == '0') {
                        self.$el.html($('<div class="m405"></div>'));
                    }
                    self.setAuthorShow(auths);
                    fileInfor = data.fileInfor || {};
                    access_type = fileInfor.access_type;
                    self.isShare = access_type == 1 ? 1 : 0;
                    newData = $.extend({}, options);
                    newData.tree = data.tree;
                    newData.docs = data.docs;
                    newData.isSearch = 0;
                    newData.showWrap = 1;
                    newData.showLoad = 1;
                    newData.fromShare = fromShare;
                    self.mData = data.docs.length ? 1 : 0;
                    self.mDir = 0;
                    newData.useSort=self.useSort;
                    newData.sort=self.sort;
                    str = self.detailstpl({data: newData});
                    self.$el.find('.doclistinner').html(str);
                    str2 = self.dirtpl(newData);
                    /*路径树*/
                    self.$el.find('.op8').html(str2);
                    self.initRightDropDown();
                    self.displayParent();

                }
            });
        }

    });
    return View;
});