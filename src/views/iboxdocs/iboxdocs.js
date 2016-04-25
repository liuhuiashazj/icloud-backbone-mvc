/**
 * Created by liuhui on 15/12/8.
 */
define([
    'views/doclist/doclist',
    'text!views/iboxdocs/share.tpl',
    'text!views/iboxdocs/ibox.css'
], function (DocView, sharetpl, iboxcss) {
    var docEvent = DocView.prototype.events;

    var View = DocView.extend({
        dirtpl: _.template('<%if(fromShare){%><span class="all share dirs" data-id="share" >来自共享</span><%}else{%><span class="all dirs" >我的文件</span><%}%><%for(var i =0,l=tree.length;i<l;i++){%>&gt;<span class="<%if(i!=l-1){%>dirs<%}%>" data-id="<%if(fromShare){%>share<%}%><%=tree[i].fid%>"><%=tree[i].filename%></span><%}%>'),
        shareTree: '<span class="jstree-whole"></span>' +
                   '<div class="jstree-witem "><i class="jstree-icon "></i><div class="jstree-wname" >' +
                   '<%if(!this.isInput){%>' +
                   '<%if(this.treepic){%><img src="<%this.treepic%>" alt=""/><%}%>' +
                   '<span class="jstree-anchor" data-fid="<%this.treeid%>" data-stype="<%this.stype%>" data-img="<%this.treepic%>"  draggable="true"><%this.text%></span>' +
                   '<%}else{%>' +
                   '<input class="jstree-input"  type="text" value="<%this.text%>"/><span class="jstree-cancel"></span>' +
                   '<%}%>' +
                   '</div></div>',

        sharetpl: _.template(sharetpl),
        events: $.extend({
            'mousedown .fname ': 'evtDragstart',
            'mouseenter .fname': 'evtDragover',
            'mouseleave .fname ': 'evtDragout'
            //'mousemove .fname': 'evtDrag',
            //'dragend': 'evtDragend',
            //'mouseup .fname': 'evtDrop'
        }, docEvent),
        dataAuthor: {},
        //showAuthorData: {},
        popParent: '.listLeft2',
        stopshareurl: $.urlMap.iboxStopShare,
        authorurl: $.urlMap.setIboxRule,
        pasteId: '#pastewrapibox',
        upModalId: '#wrapupibox',

        initDragFile: function () {
            var self = this;
            this.$dragText = $('<div />').addClass('drag-icon drag-iconibox').appendTo('body').hide();
            $('body').on('mousemove', function (e) {
                self.evtDrag(e);
            }).on('mouseup', function (e) {
                self.evtDrop(e);
            });
        },
        initExtend: function () {
            var self = this;
            this.selectPerson = 0;
            this.selectPersonMap = {};
            this.authorId = 'wrapiboxauthor';

            /*debugger start*/
            /*Object.observe(this.showAuthorData, function (changes) {
             changes.forEach(function (change) {

             console.log(change.type, change.name, change.oldValue,self.showAuthorData);
             });
             });*/

            /*debugger end*/

            this.bindResize();
            this.insertCss(iboxcss);
            this.createDragModal();
            this.initDragFile();

            Backbone.Events.on('selectuser', function () {
                var opt = [].slice.apply(arguments)[0], str;

                if (self.selectPerson >= 5) {
                    $.fn.tips('最多只能分享给5个群组！');
                    return;
                }

                if (self.selectPersonMap[opt.id]) {
                    $.fn.tips('已添加！');
                    return;
                }
                self.selectPerson++;
                self.selectPersonMap[opt.id] = 1;
                str = _.template('<li data-id="<%=id%>" data-stype="<%=stype%>"><%if(imgurl){%><img src="<%=imgurl%>" alt=""><%}%><span class="text"><%=value%></span><span class="del"></span></li>');
                $('#wrapupshare .slists ul').append(str(opt));
                $('#wrapupshare .head').html('转发给Hi群（' + self.selectPerson + '/5）');
            });
            Backbone.Events.on('showShare', function (opt) {
                var str;
                self.showModal('share');
                str = _.template('<span class="icon <%=type%> "></span><%=name%>');
                $('#wrapupshare .doctit').html(str(opt)).attr('data-fid', opt.fid);

            });
            Backbone.Events.on('movesuccess', function (data) {
                var fid = data.fid, tr;
                tr = self.$el.find('#f' + fid);
                if (tr.length) tr.remove();
            });

        },
        /*绑定事件 拖拉操作*/
        bindResize: function () {
            var self = this;
            $('body').on('mousedown', function (e) {
                e.stopPropagation();
                var $obj = $(e.target);
                if ($obj.hasClass('resize')) {
                    self.resizeObj = $obj;
                    self.resizeMouseDown = 1;
                    $obj.addClass('resizeon');
                }
            })
            .on('mousemove', function (e) {
                e.stopPropagation();
                if (!self.resizeMouseDown) return;

                Backbone.Events.trigger('dragleft', e.clientX);
            })
            .on('mouseup', function (e) {
                e.stopPropagation();
                if (!self.resizeMouseDown) return;
                self.resizeMouseDown = 0;
                self.resizeObj.removeClass('resizeon');
            });

        },

        display: function (options) {
            var self = this, str;
            if(options.fid===null){
                this.$el.html(this.introducetpl(options)).show();
                return;
            }
            options.fid = options.fid || '0';
            self.options.parentid = options.fid;
            str = self.template(options);
            self.$el.html(str).hide();

            self.$el.show();
            self.$paste = self.$el.find(self.pasteId);
            self.getFromShare(options.fid);
            self.initModal();
            self.initDropDown();
            self.initUploader();

            self.showDocList(options.fid);
            self.initModalShare();
            self.initDrag();

        },
        getFromShare: function (fid) {
            var cls1 = 'person', cls2 = 'share';
            if (!(/^\d+$/.test(fid))) {
                this.fromShare = 1;
                this.$el.removeClass(cls1).addClass(cls2);
            } else {
                this.fromShare = 0;
                this.$el.removeClass(cls2).addClass(cls1);
            }
            return;
        },
        showDocList: function (fid) {
            var self = this, url = $.urlMap.iboxList, options = this.options, data = {}, fromShare = this.fromShare;
            window.hasInputFocus = 0;

            if (this.fromShare) {
                fid = fid.replace('share', '');
                if (/^\d+$/.test(fid)) {
                    data = {
                        fid: fid
                    };
                } else {
                    data = {
                        uname: fid
                    };
                }

                url = $.urlMap.userList;
                fromShare = 1;
                self.$el.find('.op1').addClass('limitSize');
            } else {
                if (fid != 0) data.fid = fid;
                self.$el.find('.op1').removeClass('limitSize');
            }
            $.ajax({
                url: url,
                data: data,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    switch (data.errno) {
                        case 20009:
                        case 30002:
                            self.$el.html($('<div class="m403"></div>'));
                            break;
                        case 20001:
                            self.$el.html($('<div class="m403"></div>'));
                            break;
                    }
                    if (data.errno) return;
                    var newData, fileInfor, access_type, str, str2;
                    data = data.result;
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
                    newData.useSort=self.useSort;
                    self.mData = data.docs.length ? 1 : 0;
                    self.mDir = 0;
                    str = self.detailstpl({data: newData});
                    self.$el.find('.doclistinner').html(str);
                    str2 = self.dirtpl(newData);
                    self.$el.find('.op8').html(str2);
                    self.initRightDropDown();
                    if (!data.docs.length && self.fromShare) {
                        self.$el.find('.wrapop1').hide();
                    } else {
                        self.$el.find('.wrapop1').show();
                    }

                }
            });
        },
        getDir: function (e) {
            var fid = $(e.currentTarget).attr('data-id') || 0;
            Backbone.Events.trigger('UpdateCur', fid);
            if (!fid) {
                Backbone.history.navigate('#ibox/0', {trigger: true});
                return;
            }
            this.goIboxPage({fid: fid});

        },

        /*拖拽控制*/

        createDragModal: function () {
            this.dndImage = new Image();
            this.dndImage.src = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';
            this.$dragText = $('<div />').addClass('drag-icon').appendTo('body').hide();
        },
        evtDragstart: function (ev) {
            var $obj = $(ev.target), tr, id, draggable;
            ev = ev.originalEvent;
            if (ev.target.tagName == 'INPUT') return;
            /*重命名时不能阻止,否则会有bug*/
            ev.preventDefault();

            tr = $.ldom.getParentByTag(ev.target, 'tr');
            id = tr.getAttribute('data-fid');
            draggable = $obj.attr('draggable');
            if (!draggable) return;

            //ev.dataTransfer.setData('Text', id);

            this.tips = $(ev.target).html();
            this.dragId = id;
            this.$dragobj = $obj;
            this.startX = ev.clientX;
            this.startY = ev.clientY;
            this.isClick = 1;

        },
        evtDrag: function (ev) {
            var offsetX, offsetY;
            ev = ev.originalEvent;
            offsetX = Math.abs(ev.clientX - this.startX);
            offsetY = Math.abs(ev.clientY - this.startY);
            if (!this.isClick) return;
            if (offsetX > 10 || offsetY > 10) {
                //debugger;
                this.isMoving = 1;
                Backbone.Events.trigger('dragfile', this.dragId);
            } else {
                return;
            }
            if (ev.clientX == 0) {
                this.$dragText.hide();
            } else {
                this.$dragobj.addClass('dragstart');
                this.$dragText.css({
                    left: ev.clientX + 10,
                    top: ev.clientY + 10,
                    zIndex: 1000
                });
                this.$dragText.html(this.tips).show();
            }

        },

        evtDragover: function (ev) {
            if (!this.isMoving) return;
            var $obj = $(ev.target), $tr, isdir;
            $tr = $($.ldom.getParentByTag(ev.target, 'tr'));
            isdir = $tr.attr('data-isdir');
            if (!isdir) {
                $obj.css('cursor', 'no-drop');
                return;
            }
            $obj.css('cursor', 'pointer');
            $(ev.target).addClass('dragstart');

        },
        evtDragout: function (ev) {
            $(ev.target).removeClass('dragstart');
            $(ev.target).css('cursor', 'pointer');
        },
        evtDrop: function (ev) {

            var $li, $obj = $(ev.target), fid, did, tr, isdir;
            tr = $.ldom.getParentByTag(ev.target, 'tr');
            isdir = $(tr).attr('data-isdir');
            ev = ev.originalEvent;
            //ev.preventDefault();
            this.isClick = 0;
            if (!this.isMoving) {
                return;
            }

            this.isMoving = 0;
            this.$dragText.hide();
            this.$dragobj.removeClass('dragstart');
            $obj.removeClass('dragenter');
            fid = this.dragId;
            if (!fid || !isdir) return;
            if (!$obj.hasClass('fname')) {/*拖拽到别处不执行,拖拽结束,通知treeleft*/
                Backbone.Events.trigger('dragfileend');
                return;
            }

            Backbone.Events.trigger('dragfileend');
            $(ev.target).removeClass('dragstart');

            did = tr.getAttribute('data-fid');
            $.ajax({
                data: {
                    dest_fid: did,
                    source_fids: fid
                },
                url: $.urlMap.moveurl,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }
                    Backbone.Events.trigger('movesuccess', {
                        did: did,
                        fid: fid
                    });
                    $.fn.tips('移动成功', 1);

                }
            });
        },

        /*分享到hi群*/
        shareDoc: function ($obj) {
            var tr = $obj.parents('tr'), name, fid, type;
            name = tr.attr('data-name');
            fid = tr.attr('data-fid');
            type = tr.attr('data-ext');

            Backbone.Events.trigger('showShare', {
                name: name,
                fid: fid,
                type: type == '' ? 'dir' : type
            });

        },

        /*分享到hi群弹层*/
        initModalShare: function () {
            var self = this;
            if (this.hasInitModalShare) return;
            this.hasInitModalShare = true;
            self.modal.share = new $.fn.Modal({
                id: '#wrapupshare',
                layid: '#lay5',
                closeButton: ".close6",
                okButton: '#ok4',
                stopClickClose: 1,
                events: {
                    'click .del': self.removePerson,
                    'input .searchtree': self.searchHi
                },
                getData: function () {
                    var deferred = $.Deferred();
                    $.get($.urlMap.hiGroup, {
                        _: new Date().getTime()
                    }, function (data) {
                        if (parseInt(data.errno)) return;
                        deferred.resolve(data.result);

                    });
                    return deferred.promise();
                },
                closeCallBack: function () {
                    self.resetPerson();
                },
                okCallBack: function (e) {
                    self.sumbitShare();
                },
                showCallBack: function () {
                    self.initHitree();
                },
                callScope: self,
                tpl: self.sharetpl
            });
            //self.showModal('share');
        },
        searchHi: function (e) {
            var word = e.currentTarget.value;

            var url = word == '' ? $.urlMap.hiGroup : $.urlMap.searchTree;
            var data2 = {
                kw: word,
                _: new Date().getTime()
            };

            this.tree.updateTree({
                url: $.urlMap.searchTree,
                getData: function () {
                    var deferred = $.Deferred();
                    $.get(url, data2, function (data) {
                        if (parseInt(data.errno)) return;
                        deferred.resolve(data.result.groups);

                    });
                    return deferred.promise();
                }
            });

        },

        /*构建分享树*/
        initHitree: function () {
            var self = this;
            if (this.initTreeData) return;
            this.initTreeData = 1;
            this.tree = $.BaseTree2.getExample({
                parentId: 'treehi',
                getData: function (id) {
                    var deferred = $.Deferred();

                    $.get($.urlMap.hiGroup, {
                        _: new Date().getTime()
                    }, function (data) {
                        if (parseInt(data.errno)) return;
                        deferred.resolve(data.result);

                    });
                    return deferred.promise();

                },
                litpl: self.shareTree,
                alias: function (props) {
                    var alias = {
                        id: 'treeid',
                        text: 'treename',
                        hasChild: 'haschild',
                        child: 'childs',
                    };
                    return alias[props] || props;
                },
                depth: 1,
                open: true,

                plugins: [/*'remote',*/
                ],

                callbacks: {
                    onClick: function (e) {
                        var val, stype, imgurl, fid = e.target.getAttribute('data-fid') - 0;
                        val = e.target.innerHTML;
                        stype = e.target.getAttribute('data-stype');
                        imgurl = e.target.getAttribute('data-img');
                        if (!fid) return;
                        Backbone.Events.trigger('selectuser', {
                            id: fid,
                            value: val,
                            stype: stype,
                            imgurl: imgurl
                        });

                    }
                }
            });
        },
        /*删除分享群*/
        removePerson: function (e) {
            var li = $.ldom.getParentByTag(e.currentTarget, 'li'), id;
            id = li.getAttribute('data-id');
            li.parentNode.removeChild(li);
            delete this.selectPersonMap[id];
            this.selectPerson--;
            $('#wrapupshare .head').html('转发给Hi群（' + this.selectPerson + '/5）');

        },
        /*分享hi群重置*/
        resetPerson: function () {
            var self = this;
            self.selectPerson = 0;
            self.selectPersonMap = {};
            $('#wrapupshare .head').html('转发给Hi群');
            $('#wrapupshare .slists ul').html('');

        },
        /*提交分享信息*/
        sumbitShare: function () {
            var $file, $list, obj, arr = [], self = this;
            $file = $('#wrapupshare .doctit');
            $list = $('#wrapupshare .slists li');
            $list.each(function (index, ele) {
                var lobj = {
                    gid: ele.getAttribute('data-id'),
                    stype: ele.getAttribute('data-stype')

                };
                arr.push(lobj);
            });
            if (!arr.length) {
                $.fn.tips('请至少选中一项');
                return;
            }
            obj = {
                fid: $file.attr('data-fid'),
                source: 'person',
                shares: JSON.stringify(arr)
            };
            $.ajax({
                url: $.urlMap.shareDoc,
                type: 'post',
                data: obj,
                dataType: 'json',
                success: function (data) {
                    if (data.errno) return;
                    self.hideModal('share');
                    $.fn.tips('转发成功', 1);

                }
            });

        },

        /*共享弹层设置*/
        initAuthorModal: function () {
            var self = this;
            /*权限共享弹层初始化*/

            self.modal.author = new $.fn.Modal({
                id: '#' + self.authorId,
                layid: '#lay2',
                closeButton: ".close",
                okButton: '#ok',
                stopClickClose: true,

                closeCallBack: self.closeAuthor,
                okCallBack: self.sumbitAuthor,
                events: {
                    'click .stop': function () {
                        self.showModal('stopshare');
                    },
                    'click .head': function () {
                        self.toggleAuthor();
                    }
                },
                callScope: self,
                tpl: self.authortpl,
                showCallBack: function () {
                    self.initAuthorContext();
                    self.modal.author.$parent.find('.wrapmem tr').remove();
                }
            });
            this.showAuthorList = 0;
        },

        /*共享权限设置*/
        openAuthor: function (e) {
            var self = this;
            e = e || {};
            e.stopPropagation && e.stopPropagation();
            var $tr = $(e.currentTarget).parents('tr');
            var fid = $tr.attr('data-fid');
            this.options.fid = fid;

            self.getSharedList(fid);
            this.showModal('author');
        },
        getSharedList: function (fid) {
            var self = this;
            $.ajax({
                url: $.urlMap.shareList,
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {
                    fid: fid
                },
                success: function (data) {
                    $('.haslist table').html(self.atabtpl(data));

                }
            });
        },
        /*共享权限里面添加权限和已共享功能切换*/
        toggleAuthor: function () {
            if (this.showAuthorList) {
                this.hideAuthor();
            } else {
                this.showAuthor();
            }

        },
        hideAuthor: function () {
            if (this.showAuthorList === 0) return;
            this.showAuthorList = 0;
            $('.haslist').removeClass('unfold');
            $('.haslist .wtable').animate({
                height: '0'
            });
            $('.wrapmem').animate({
                height: '230px'
            });
        },
        showAuthor: function () {
            if (this.showAuthorList === 1) return;
            this.showAuthorList = 1;

            $('.haslist').addClass('unfold');
            $('.haslist .wtable').animate({
                height: '230px'
            });
            $('.wrapmem').animate({
                height: '0'
            });
        },
        initAuthorContext: function () {
            var self = this;
            self.dataAuthor = {};
            self.initSearchDropDown();

        },
        /*权限搜索下拉提示*/
        initSearchDropDown: function () {
            var self = this;
            if (this.hasInitSearch) return;
            this.hasInitSearch = 1;
            $.InputDropDown.getExample({
                el: '.sauthor',
                $tpl: '',
                parent: 'body',
                css: {
                    width: 509,
                    height: 150,
                    maxHeight: 150
                },
                leftOffset: -13,
                topOffset: 1,
                tpl: '<%for(var i=0;i<this.lists.length;i++){ list=this.lists[i];%><li class="linfo <%if(list.hasShow){%>added<%}%>" data-value="<%list.key%>" data-depart="<%list.departmentName%>" data-name="<%list.truename%>" data-rtype="<%list.type%>" ><%list.truename%>(<%list.departmentName%>)<div><%list.key%>@baidu.com</div><span class="status"><%if(list.hasShow){%>已共享<%}%></span></li><%}%>',
                getData: function (e) {
                    var self = this, $obj = $(e.target), val,
                    deferred = $.Deferred();
                    val = $obj.val();

                    $.ajax({
                        url: $.urlMap.searchUser,
                        cache: false,
                        type: 'get',
                        dataType: 'json',
                        data: {
                            kw: val,
                            filter: 'noself'
                        },
                        success: function (data) {
                            data = data.result;
                            self.lists = data;
                            deferred.resolve();
                        }
                    });

                    return deferred.promise();
                },

                tplSpan: '<span class="op5"><%=name%></span>',
                delCallback: function ($obj) {
                },
                enterCallback: function ($obj) {
                },

                selectCallback: function ($obj) {
                    var email = $obj.attr('data-value'), str,
                    name = $obj.attr('data-name'),
                    rtype = $obj.attr('data-rtype'),
                    depart = $obj.attr('data-depart');
                    if (self.dataAuthor[email]) {
                        $.fn.tips('已添加该人!');
                        return;
                    }
                    self.dataAuthor[email] = 1;
                    str = self.atabtpl({
                        result: [{
                            "email": email + "@baidu.com",
                            "name": email,
                            "realname": name,
                            "depart": depart,
                            "rtype": rtype,
                            "isview": 1,
                            "isdownload": 1,
                            "isedit": 0,
                            "chmod": "110",
                            "isadmin": false
                        }
                        ]
                    });
                    self.hideAuthor();
                    $('#' + self.authorId + ' .wrapmem  table').append(str);
                    this.$el.val('');
                    this.hide();
                }
            });
        },
        destory: function () {

            this.$el.html('').hide();
        }

    });
    return View;

});