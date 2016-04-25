/**
 * Created by liuhui on 15/11/5.
 * reset test
 */
define([
    'text!views/doclist/doclistall.tpl',
    'text!views/doclist/doclist.css',
    'text!common/tpl/doclist.tpl',
    'text!common/tpl/upload.tpl',
    'text!views/doclist/author.tpl',
    'text!views/doclist/authorlist.tpl',
    'text!views/doclist/newtd.tpl',
    'text!common/tpl/confirm.tpl',
    'text!common/tpl/preview.tpl',
], function (tpl, css, detailstpl, uptpl, authortpl, atabtpl, tdtpl, stoptpl, previewtpl) {
    var View = Backbone.BaseView.extend({
        el: '#doclist',
        cssText: css,
        authorurl: $.urlMap.setRule,
        pasteId: '#pastewrap',
        template: _.template(tpl),
        detailstpl: _.template(detailstpl),
        uptpl: _.template(uptpl),
        authortpl: _.template(authortpl),
        atabtpl: _.template(atabtpl),
        tdtpl: _.template(tdtpl),
        stoptpl: _.template(stoptpl),
        previewtpl: _.template(previewtpl),
        dirtpl: _.template('<span class="all dirs" >全部文件</span><%for(var i =0,l=tree.length;i<l;i++){%>&gt;<span class="<%if(i!=l-1){%>dirs<%}%>" data-id="<%=tree[i].fid%>"><%=tree[i].filename%></span><%}%>'),
        events: $.extend({
            'keydown .fname input': 'enterFname',
            'click .fname input': 'stopDefault',
            'blur .fname input': 'blurName',
            'click .fname': 'clickFname',
            'click .crename': 'clickCancelRename',
            'click .selectall': 'selectall',
            'click .selectone': 'selectone',
            'click .op1>span': 'clickop1',
            'click .op2>span': 'clickop2',
            'click .category a': 'switchToDetail',

            'click .meeting': 'goMeeting',
            'click .author': 'openAuthorDrop',
            'click .dirs': 'getDir'
        }, Backbone.BaseView.baseEvents),
        drop: {},
        modal: {},
        files: {},
        options: {},
        rn: 20,
        rightOps: {
            'down': {
                name: '下载',
                value: 'down'
            },
            'del': {
                name: '删除',
                value: 'del'
            },
            'edit': {
                name: '编辑',
                value: 'edit'
            },
            'rename': {
                name: '重命名',
                value: 'rename'
            },
            'share': {
                name: '转发到hi',
                value: 'share'
            },
            'authoring': {
                name: '共享',
                value: 'authoring'
            },
            'email': {
                name: '发送电子邮件',
                value: 'email'
            },
            'hi': {
                name: '发送Hi提醒',
                value: 'hi'
            }
        },
        stopshareurl: $.urlMap.stopShare,
        upModalId: '#wrapup',

        init: function () {
            var self = this;
            this.date = $.fn.getCurDate();
            this.authorId = 'wrapauthor';
            this.on('updateData', function (options) {
                for (var i in options) {
                    self.options[i] = options[i];
                }
            });
            this.on('insertDoclist', function (options) {
                self.$paste = self.$el.find(self.pasteId);

                self.options.mid = options.mid;
                self.showDocList();
                self.$el.show();
                self.initUploader();

            });
            this.initPoptips();
            this.initExtend();

        },
        initRightDropDown: function () {
            if (this.initRightFlag) {
                return;
            }
            this.initRightFlag = 1;
            var self = this, obj;
            obj = {
                el: '.fname',
                parent: self.el, /*相对于谁来绝对定位*/
                leftOffset: 10,
                topOffset: 10,
                useClickCoord: 1,
                cls: 'rdropdown',
                tpl: '<%for(var i=0;i<this.lists.length;i++){ list=this.lists[i];%><li data-value="<%list.value%>" ><%list.name%></li><%}%>',

                getData: function (e) {
                    var $tr, down, edit, share, ops, isMail, authoring,
                    del, rename, email, hi, lists = [],
                    target = e.currentTarget, deferred = $.Deferred();
                    ops = self.rightOps;
                    $tr = $(target).parents('tr');
                    down = $tr.attr('data-down') && lists.push(ops['down']);
                    edit = $tr.attr('data-edit') && lists.push(ops['edit']);

                    rename = $tr.attr('data-del') && lists.push(ops['rename']);
                    del = $tr.attr('data-del') && lists.push(ops['del']);
                    self.options.route == 'ibox' && !self.fromShare && lists.push(ops['authoring']);
                    share = !$tr.attr('data-isdir') && self.options.route == 'ibox';
                    share && lists.push(ops['share']);
                    isMail = !$tr.attr('data-isdir') && self.options.route.match(/detail/);
                    email = isMail && lists.push(ops['email']);
                    hi = isMail && lists.push(ops['hi']);

                    this.lists = lists;

                    deferred.resolve();
                    return deferred.promise();
                },

                tplSpan: '<span class="op5"><%=name%></span>',
                selectCallback: function ($obj) {
                    var $parentNode = this.$obj, $tr, e = {}, obj,
                    type = $obj.attr('data-value');
                    $tr = $parentNode.parents('tr');
                    obj = $parentNode[0];
                    e.currentTarget = obj;
                    self.handleOps(type, e, $parentNode);

                }
            };
            this.rightDropdown = $.RightDropDown.getExample(obj);
        },
        handleOps: function (type, e, $parent) {
            var self = this;
            switch (type) {
                case 'down':
                    self.downfile(e);
                    break;
                case 'del':
                    self.delfile(e);
                    break;
                case 'rename':
                    self.editname($parent);
                    break;
                case 'edit':
                    self.goEditFile(e);
                    break;
                case 'share':
                    self.shareDoc && self.shareDoc($parent);
                    break;
                case 'email':
                    self.confirmBeforeEmail(e);
                    //self.sendEmail && self.sendEmail(e);
                    break;
                case 'hi':
                    self.confirmBeforeEmail(e, 1);
                    //self.sendEmail && self.sendEmail(e, 1);
                    break;
                case 'authoring':
                    self.hideAuthor && self.hideAuthor();
                    self.openAuthor(e);
                    break;
                default :
                    break;
            }
        },

        initPoptips: function () {
            var self = this, parent = self.popParent || '.listLeft';
            if (this.initPoptipsFlag) {
                return;
            }
            this.initPoptipsFlag = 1;
            $.fn.poptips({
                parent: parent,
                selector: '.op2>span',
                left: -24,
                top: -2,
                width: 55
            });
        },

        initDrag: function () {
            /*init drag*/
            var self = this;

            if (this.initDragFlag) return;
            this.initDragFlag = 1;

            $('body').on('dragenter', function (e) {
                if (!self.isShowing) {
                    return;
                }
                e = e.originalEvent;
                var fromSystem = $.lutils.containsFiles(e);
                if (!fromSystem) {
                    return;
                }
                var $mask = self.$paste;
                var mark = self.mData + self.mDir;
                var cls = 'top' + mark;
                $mask.removeClass().addClass(cls).show();

            });
            /*this.$el.on('dragenter', '.wrapdoclist', function (e) {
             e = e.originalEvent;
             if (self.fromShare) return;
             var $mask = self.$paste;
             var cls, mark = self.mData + self.mDir;
             var fromSystem = $.lutils.containsFiles(e);
             if (!fromSystem || self.dragFid) {
             return;
             }
             self.isDragFromSystem = 1;
             cls = 'top' + mark;
             //e.preventDefault();
             e.stopPropagation();

             /!*!/!*由于webuploader中阻止事件冒泡,导致不能事件代理*!/
             self.$paste[0].ondragleave = function () {

             };*!/
             $mask.removeClass().addClass(cls).show();
             });*/
            $('body').on('mouseleave', function () {
                self.$paste&&self.$paste.hide();
            });

        },
        initExtend: function () {
            var self = this;
            window.meetDocClose = function () {
                self.showDocList();
            }
        },
        switchToDetail: function (e) {
            e.preventDefault();
            var $obj, from, mid, name, pid, url,
            td = $.ldom.getParentByTag(e.target, '.category');
            $obj = $(td);
            from = $obj.attr('data-from');
            mid = $obj.attr('data-mid');
            name = $obj.attr('data-name');
            pid = $obj.attr('data-pid');
            if (from == 1) {
                url = '#detail/detailm/all/' + mid;

            } else if (from == 2) {
                url = '#ibox/' + pid;
                Backbone.Events.trigger('UpdateTree', pid);

            } else {
                url = '#ibox/' + name;
                Backbone.Events.trigger('UpdateTree', name);
            }

            Backbone.history.navigate(url, {trigger: true});
        },
        addSum: function () {
            var url = this.docurl;
            url && window.open(url);
        },
        destory: function () {
            window.hasInputFocus = 0;
            this.$el.html('').hide();
        },
        beforeDisplay: function (options) {
            var selft = this;
            this.options = $.extend(self.options, options);
            this.source = options.route == 'ibox' ? 'person' : options.route == 'team' ? 'team' : 'meeting';
        },
        display: function (options) {
            var self = this;
            this.currentPage = 1;

            var str = self.template(options);
            self.$el.html(str).hide();
            self.initModal();
            self.initDropDown();
            if (this.options.route != 'search') {
                self.initDrag();
            }

            /*初始化上传*/
            if ((options.route == 'editmeet' && options.copy == 1) || options.route == 'newmeet') return;

            if (options.route == 'search') {
                self.$el.show();
                self.showSearchList();
                //self.initUploader();
            } else {
                //self.showDocList();
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
            }

        },

        showSearchList: function (loadMore) {
            var options = this.options;
            var self = this;
            $.ajax({
                url: $.urlMap.searchFile,
                dataType: 'json',
                type: 'GET',
                cache: false,
                data: {
                    kw: options.word,
                    page: self.currentPage,
                    pageSize: self.rn
                },
                success: function (data) {

                    if (data.errno) return;
                    var newData;
                    data = data.result;
                    newData = $.extend({}, options);
                    self.hasMore = data.has_more;
                    newData.has_more = data.has_more;
                    newData.docs = data.files;
                    newData.totalPn = 100;
                    newData.isSearch = 1;
                    if (newData.docs.length == 0) {
                        self.$el.find('.wtablist .op1').hide();
                    }

                    if (!loadMore) {
                        newData.showWrap = 1;
                        newData.showLoad = 1;
                        var str = self.detailstpl({data: newData});
                        self.$el.find('.doclistinner').html(str);

                        !self.hasMore && self.showNoMore(1);
                    } else {
                        newData.showLoad = 0;
                        newData.showWrap = 0;
                        var str = self.detailstpl({data: newData});
                        $('.doclistinner table tbody').append(str);
                        !self.hasMore && self.showNoMore(0);
                    }

                }

            });
        },
        getDir: function (e) {
            var fid = $(e.currentTarget).attr('data-id') || '';
            this.showDocList(fid);

        },
        showDocList: function (fid) {
            var self = this;
            var options = this.options;
            fid = fid || '';
            window.hasInputFocus = 0;
            self.options.parentid = fid;
            $.ajax({
                url: $.urlMap.meetDocs,
                data: {
                    mid: options.mid,
                    pn: self.currentPage,
                    pageSize: self.rn,
                    fid: fid
                },
                cache: false,
                dataType: 'json',
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }
                    data = data.result;
                    data.showWrap = 1;
                    data.showLoad = 0;
                    self.docurl = data.docurl;
                    data.route = self.options.route;
                    data.useSort=self.useSort;
                    var str = self.detailstpl({data: data});
                    self.$el.find('.doclistinner').html(str);
                    data.mid = self.options.mid;
                    self.mData = data.docs.length ? 1 : 0;
                    self.mDir = fid ? 2 : 0;

                    if (!fid) {/*全部目录时不显示目录树*/
                        self.$el.find('.op7').hide();
                    } else {
                        var str2 = self.dirtpl(data);
                        self.$el.find('.op7').html(str2).show();
                    }

                    self.checkOp1();
                    self.initRightDropDown();

                }
            });

        },
        initUploader: function () {

            var self = this;
            self.uploader = window.WebUploader.create({
                pick: {
                    id: '#fileupload'
                },
                swf: 'common/imgs/Uploader.swf',
                runtimeOrder: 'html5,flash',
                sendAsBinary: false,
                fileNumLimit: 10,
                dnd: self.pasteId,
                paste: '.wtablist',
                disableGlobalDnd: true,
                formData: {
                    source: self.source,
                    sid: self.options.mid || '',
                    is_himsg: 0,
                    is_mail: 0

                },
                server: $.urlMap.upFile,
                fileSizeLimit: 5000 * 1024 * 1024,
                fileSingleSizeLimit: 1000 * 1024 * 1024
            }).on('fileQueued', function (file) {
                this.options.formData.sid = self.options.mid;
                this.options.formData.parentid = self.options.parentid;
                self.files[file.id] = file;
                self.$paste.hide();
                file.on('statuschange', function (cur, prev) {
                    if (cur == 'complete') {
                        self.setOk(file);
                    }
                    if (cur == 'progress') {
                        self.setInit(file);
                    }
                    if (cur == 'interrupt' || cur == 'error') {
                        self.setFail(file);
                    }
                });
            }).on('error', function (type, file) {
                if (type == 'Q_TYPE_DENIED') {
                    self.$paste.hide();
                }

            }).on('filesQueued', function (files) {
                self.showModal('upload');
                self.fileNum = files.length;
                self.setStatusDefault();
                $(self.upModalId + ' .files').html(self.tdtpl({docs: files, status: 0}));
                $(self.upModalId + ' .start').attr('data-status', 'pending').html('开始').removeClass('close2');
            }).on('uploadProgress', function (file, per) {/*动画效果*/
                self.setPer(file, per);
            }).on('all', function (type) {
                var stats = this.getStats();
                self.setStatus(stats);
            }).on('uploadSuccess', function (file, data) {
                if (data.errno) {
                    $.fn.tips(data.errmsg);
                    self.setFail(file);
                    return;
                }
                self.setOk(file);

            });

        },
        setStatus: function (status) {
            var self = this, total = status.successNum + status.uploadFailNum;
            if (status.progressNum || status.successNum || status.uploadFailNum || status.interruptNum) {
                var obj = $.extend({}, status);
                obj.status = 1;
                var tpl = this.tdtpl(obj);
                $(self.upModalId + ' .sts').html(tpl);
            }
            if (this.fileNum == total) {
                $(self.upModalId + ' .start').attr('data-status', 'pending').html('完成').addClass('close2');
            }

        },
        startall: function (e) {/*开始上传*/
            var self = this;
            var $obj = $(e.currentTarget);
            var status = $obj.attr('data-status');
            if (status == 'pending') {/*开始上传*/
                this.uploader.upload();
                $obj.attr('data-status', 'uploading').html('全部终止');
            } else if (status == 'uploading') {/*终止上传*/
                this.uploader.stop(true);
                $obj.attr('data-status', 'pending').html('重新上传');
            } else if (status == 'interrupt') {
                this.uploader.stop(true);
                this.uploader.upload();
                $obj.attr('data-status', 'uploading').html('全部终止');
            }

        },

        retryuploader: function (e) {
            var id = $(e.currentTarget).parents('span').attr('data-id');
            var file = this.files[id];
            this.uploader.upload(file);
        },
        removeFile: function (e) {
            var self = this, $obj = $(e.currentTarget);
            var tr = $obj.parents('.item');
            var fid = tr.attr('id');
            var status = $obj.attr('data-status');
            if (status == 'uploading') {/*终止*/
                var file = this.files[fid];
                this.setFail(file);
                $(self.upModalId + ' .start').attr('data-status', 'interrupt').html('继续上传');
                this.uploader.stop(file);
            } else if (status == 'pending' || status == 'fail') {/*删除*/
                var tr = $('#' + fid);
                tr.remove();
                this.fileNum--;

                this.setStatusDefault();
                this.uploader.removeFile(fid);
                if (this.fileNum == 0) {
                    this.hideModal('upload');
                }
            }
            return;

        },
        setStatusDefault: function () {
            var self = this;
            $(self.upModalId + ' .sts').html('上传' + this.fileNum + '个文件到云平台！');
        },
        resetUpload: function () {/*重置uploader*/
            $(self.upModalId + ' .files').html('');
            this.uploader.reset();
            this.showDocList(this.options.parentid);
        },
        insertDocs: function (docs) {
            var route = this.options.route;
            var $table = this.$el.find('.doclistinner table');
            var showWrap = $table.length == 0 ? 1 : 0;
            var str = this.detailstpl({
                data: {
                    showWrap: showWrap,
                    showLoad: 0,
                    total: docs.length,
                    docs: docs,
                    route: route
                }
            });
            if (showWrap) {
                this.$el.find('.nolist2').hide();
                this.$el.find('.doclistinner').append(str);
            } else {
                $table.find('tr:first-child').after(str);
            }
            return;
        },
        setInit: function (file) {
            /*设置进度条*/
            var $obj = $('#' + file.id + ' .progress');
            var obj = $obj[0];
            $obj.parent().removeClass('fail').removeClass('ok');
            $obj.parent().find('.status').html('').attr('data-id', file.id);
            $obj.parent().find('.delfile').html('删除').attr('data-status', 'pending');
            obj.style.width = '0';
        },

        setOk: function (file) {
            /*设置进度条*/
            var $obj = $('#' + file.id + ' .progress');
            var obj = $obj[0];
            $obj.parent().removeClass('fail').addClass('ok');
            $obj.parent().find('.status').html('').attr('data-id', file.id);
            $obj.parent().find('.delfile').html('').attr('data-status', 'success');
            $obj.stop(true);
            obj.style.width = '0';
        },
        setFail: function (file) {
            /*设置进度条*/
            var $obj = $('#' + file.id + ' .progress');
            var obj = $obj[0];
            $obj.parent().removeClass('ok').addClass('fail');
            $obj.parent().find('.status').html('<i class="retry">重试</i>').attr('data-id', file.id);
            $obj.parent().find('.delfile').html('删除').attr('data-status', 'fail');
            $obj.stop(true);
            obj.style.width = '0';
        },
        setPer: function (file, per) {
            var $obj = $('#' + file.id + ' .progress');
            $('#' + file.id + ' .delfile').html('终止').attr('data-status', 'uploading');
            $obj.animate({
                width: per * 100 + "%"
            });
        },
        stopShare: function (e) {
            var self = this, url = this.stopshareurl;
            $.ajax({
                cache: false,
                url: url,
                data: {
                    source: self.source,
                    fid: self.options.fid,
                    sid: self.options.mid
                },
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                    } else {

                        $.fn.tips('停止共享设置成功！', 1);
                    }
                    self.showDocList(self.options.parentid);
                    self.hideModal('author');
                    self.hideModal('stopshare');

                }
            });
        },
        openAuthorDrop: function (e) {
            this.showAuthor && this.showAuthor();
            this.openAuthor(e);
        },
        openAuthor: function (e) {
            var self = this;
            e.stopPropagation();
            e = e || {};
            var $tr = $(e.currentTarget).parents('tr');
            var fid = $tr.attr('data-fid');
            var options = this.options;
            options.fid = fid;
            $.ajax({
                cache: false,
                url: $.urlMap.getFileRule,
                data: {
                    fid: fid,
                    sid: self.options.mid,
                    source: self.source
                },
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    //self.authorData=data;

                    $('#' + self.authorId + ' .wrapmem table').html(self.atabtpl(data));
                    if ($('.wrapmem')[0].scrollHeight > $('.wrapmem')[0].clientHeight) {
                        $('#' + self.authorId + ' .thead .t2').addClass('t2scroll');
                    }

                }
            });
            this.showModal('author');
        },

        closeAuthor: function () {
            //
        },
        sumbitAuthor: function () {
            var self = this;
            var $lists = $('#' + self.authorId + ' tr[data-mail]');
            var arr = [];
            _.each($lists, function (list) {
                var $list = $(list);
                arr.push({
                    email: $list.attr('data-mail'),
                    chmod: $list.attr('data-chmod'),
                    rtype: $list.attr('data-rtype')
                });
            });

            var str = JSON.stringify(arr);
            var ismail = $('#email2')[0].checked ? 1 : 0;
            var ishi = $('#hi')[0].checked ? 1 : 0;
            var data = {
                source: self.source,
                fid: self.options.fid,
                sid: self.options.mid,
                ismail: ismail,
                ishi: ishi,
                rules: str
            };

            $.ajax({
                cache: false,
                url: self.authorurl,
                data: data,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }
                    self.hideModal('author');

                    $.fn.tips('共享成功！', 1);
                    self.showDocList(self.options.parentid);

                }
            });
        },
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
                    }
                },
                callScope: self,
                tpl: self.authortpl
            });
        },
        initModal: function () {
            var self = this, id = self.upModalId;
            /*文件上传弹层初始化*/

            self.modal.upload = new $.fn.Modal({
                id: id,
                layid: '#lay1',
                closeButton: ".close2",
                okButton: '.start',
                stopClickClose: 1,
                data: {
                    route: self.options.route
                },
                events: {
                    'click .retry': self.retryuploader,
                    'click .delfile': self.removeFile,
                    'click .op4 input': self.selectNote

                },
                closeCallBack: self.resetUpload,
                okCallBack: function (e) {
                    self.startall(e);
                },
                showCallBack: function () {

                },
                callScope: self,
                tpl: self.uptpl
            });

            this.initAuthorModal();

            /*停止共享modal*/

            self.modal.stopshare = new $.fn.Modal({
                id: '#wrapstop',
                closeButton: ".close2",
                okButton: '#ok2',
                layid: '#lean_overlay2',
                stopClickClose: true,
                cls: 'wrapdel',
                css: {
                    zIndex: 12000
                },
                data: {
                    tips: '停止共享后，文件对其它人不可见，确定停止共享？'
                },

                closeCallBack: self.closeAuthor,
                okCallBack: self.stopShare,
                callScope: self,
                tpl: self.stoptpl
            });

        },
        initDropDown: function (e) {
            var self = this;
            this.drop = this.drop || {};
            /*权限控制右键*/

            this.drop.author = new $.fn.Dropdown({
                parent: 'body',
                el: '.wrapop5',
                id: 'dropdown1',
                type: 1,
                lists: [{
                    name: '不可见',
                    value: '000'
                },
                    {
                        name: '查看',
                        value: '100'
                    },
                    {
                        name: '查看&nbsp;下载',
                        value: '110'
                    },
                    {
                        name: '查看&nbsp;下载&nbsp;编辑',
                        value: '111'
                    }
                ],
                leftOffset: 35,
                topOffset: -10,
                tpl: '<%for(var i=0;i<lists.length;i++){%><li data-value="<%=lists[i].value%>" ><%=lists[i].name%></li><%}%>',
                tplSpan: '<span class="op5"><%=name%></span>',

                selectCallback: function ($obj) {
                    var value = $obj.attr('data-value');
                    var name = $obj.html();
                    var tpl = _.template(this.options.tplSpan);
                    this.$obj.html(tpl({
                        name: name,
                        value: value
                    }));
                    this.$obj.parents('tr').attr('data-chmod', value);
                }
            });

        },
        /*会议文档操作行权限控制*/
        checkOp1: function () {
            var objs = this.$el.find('tr td>input:checked');
            var down = 1, del = 1, edit = 1;
            var len = objs.length;
            objs.each(function () {
                var tr = $(this).parents('tr');
                down = tr.attr('data-down') && down;
                del = tr.attr('data-del') && del;
                edit = tr.attr('data-edit') && edit;
                //down=down&&
            });
            var objdown = this.$el.find('.op1 .down'), objdel = this.$el.find('.op1 .del'), objrename = this.$el.find('.op1 .rename');
            if (down && len >= 1) {
                objdown.addClass('able');
            } else {
                objdown.removeClass('able');
            }
            if (del && len == 1) {
                objrename.addClass('able');
            } else {
                objrename.removeClass('able');
            }
            if (del && len >= 1) {
                objdel.addClass('able');
            } else {
                objdel.removeClass('able');
            }

        },
        enterFname: function (e) {/*重命名事件*/
            var $obj = $(e.currentTarget);
            var val = $obj.val();
            if (e.keyCode == 13) {
                e.preventDefault();
                if (!val) {
                    $.fn.tips('名字不能为空');
                    return;
                }
                $obj[0].blur();
            }
        },
        blurName: function (e) {
            var self = this;
            //alert('blur');
            setTimeout(function () {
                self.resetName(e);
            }, 200);
        },
        resetName: function (e) {/*设置重命名*/
            if (this.lockCancel) {
                this.lockCancel = false;
                return;
            }

            var self = this, source,
            $obj = $(e.currentTarget),
            val = $obj.val(),
            $tr = $obj.parents('tr'),
            $fname = $obj.parents('.fname'),
            ext = $tr.attr('data-ext'),
            fid = $tr.attr('data-fid'),
            mid = $tr.attr('data-mid'),
            from = $tr.attr('data-from'),
            isCreate = parseInt($tr.attr('data-create'));
            /*ibox页所有下载,search页面来自共享的*/
            if (from == '2' || from == '3' || this.options.route == 'ibox') {
                source = 'person';
            } else if (this.options.route == 'team') {
                source = 'team';
            } else {
                source = 'meeting';
            }

            val = ext ? (val + '.' + ext) : val;
            if (isCreate) {/*新建目录*/
                $.ajax({
                    cache: false,
                    url: $.urlMap.createDir,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        source: source,
                        dirname: val,
                        sid: self.options.mid,
                        parentid: self.options.parentid
                    },
                    success: function (data) {
                        if (data.errno) {
                            $.fn.tips(data.errmsg);
                            return;
                        }
                        data = data.result;
                        val = $('<div/>').text(val).html();
                        $fname.html(val);
                        $tr.attr('data-editing', 0);
                        $tr.attr('data-name', val);
                        $tr.attr('data-fid', data.fid);
                        $tr.attr('data-create', 0);
                        window.hasInputFocus = 0;
                        //$.fn.tips('创建成功！', 1);
                        if (self.options.route == 'ibox') {

                            Backbone.Events.trigger('UpdateTree', self.options.fid);
                        } else if (self.options.route == 'team') {

                            Backbone.Events.trigger('UpdateTreeTeam', self.options.fid);
                        }

                    }
                });

            } else {
                $.ajax({
                    cache: false,
                    url: $.urlMap.renameFile,
                    type: 'POST',
                    dataType: 'json',

                    data: {
                        fid: fid,
                        name: val,
                        sid: mid != undefined ? mid : self.options.mid,
                        source: source
                    },
                    success: function (data) {
                        if (data.errno) {
                            $.fn.tips(data.errmsg);
                            return;
                        }
                        //debugger;
                        //self.showDocList(self.options.parentid);//整体刷新
                        var date = $.fn.getCurDate();
                        $tr.attr('data-editing', 0);
                        $fname.html(val);
                        $tr.find('.ctime').html(date.str);
                        $tr.attr('data-name', val).attr('data-create', 0);
                        window.hasInputFocus = 0;
                        //$.fn.tips('修改成功！', 1);
                        if (self.options.route == 'ibox') {

                            Backbone.Events.trigger('UpdateTree');
                        } else if (self.options.route == 'team') {

                            Backbone.Events.trigger('UpdateTreeTeam');
                        }

                    }
                });

            }

        },
        clickop0: function (e) {/*预览页操作*/
            e.stopPropagation();
            var obj = $(e.currentTarget);
            var name = obj.attr('class');
            if (name.match(/down/)) {
                this.downfile(e);
            } else if (name.match(/del/)) {
                this.delfile(e, 1);
            } else if (name.match(/edit/)) {
                this.goEditFile(e);
            }
        },
        clickop1: function (e) {/*会议文档行操作*/
            e.stopPropagation();
            if (window.hasInputFocus) return;
            var obj = $(e.currentTarget);
            if (!obj.hasClass('able')) return;
            var name = obj.attr('class');
            if (name.match(/down/)) {
                this.downfiles(e);
            } else if (name.match(/del/)) {
                this.delfiles(e);
            } else if (name.match(/rename/)) {
                var objs = this.$el.find('tr td>input:checked');
                window.hasInputFocus = 1;
                /*坑爹的禁用其它功能*/
                this.editname(objs);
            } else if (name.match(/newdir/)) {
                window.hasInputFocus = 1;
                this.creatDir();
            } else if (name.match(/addsum/)) {
                this.addSum();
            }

        },
        clickop2: function (e) {/*文档列表图标操作*/
            e.stopPropagation();
            if (window.hasInputFocus) return;
            var obj = $(e.currentTarget);
            var name = obj.attr('class');
            this.handleOps(name, e, obj);

        },

        confirmBeforeEmail: function (ev, type) {
            var self = this;
            self.modal.confirm5 = new $.fn.Modal({
                id: '#wrapdel5',
                closeButton: ".close2",
                okButton: '.bbutton',
                layid: '#lean_overlay5',
                cls: 'wrapdel',
                stopClickClose: 1,
                css: {
                    zIndex: 12000
                },

                data: {
                    tips: '确定要发送' + (type == 1 ? 'Hi消息' : '邮件') + '提醒给所有会议成员吗?'
                },
                okCallBack: function () {
                    self.sendEmail(ev, type);
                    self.modal.confirm5.hide();
                },
                callScope: self,
                tpl: self.confirmtpl
            });

            self.modal.confirm5.show();
        },
        /*发送通知*/
        sendEmail: function (e, ishi) {
            var self = this;
            var $tr = $(e.currentTarget).parents('tr');
            var fid = $tr.attr('data-fid');
            var options = this.options;
            var obj = {
                fid: fid,
                sid: options.mid,
                source: 'meeting'
            };
            if (ishi) {
                obj.ishi = 1;
            } else {
                obj.ismail = 1;
            }

            $.ajax({
                url: $.urlMap.sendMsg,
                data: obj,
                type: 'get',
                success: function (data) {
                    if (data.errno) {
                        $.fn.tips(data.errmsg);
                        return;
                    }

                    $.fn.tips((ishi ? '消息' : '邮件') + '已发送给所有会议成员!', 1);

                }
            });
        },

        creatDir: function () {
            var self = this;
            var date = $.fn.getCurDate();
            var docs = [{
                mid: self.options.mid,
                filename: '新建文件夹',
                realname: $.userInfos.realName || '',
                ctime: date.str,
                isdir: 1,
                isEditing: 1,
                isCreate: 1,
                useCancel: 1,
                allow_delete: 1,
                allow_download: 1,
                access_type: self.options.route != 'ibox' || self.isShare ? '1' : '0'
            }
            ];
            this.insertDocs(docs);
            this.$el.find('.fname input').select().focus();
        },
        downfile: function (e) {
            var obj = $(e.currentTarget).parents('tr'),
            fid = obj.attr('data-fid'),
            mid = obj.attr('data-mid'),
            from = obj.attr('data-from'),
            source;
            /*ibox页所有下载,search页面来自共享的*/
            if (from == '2' || from == '3' || this.options.route == 'ibox') {
                source = 'person';
            } else if (this.options.route == 'team') {
                source = 'team';
            } else {
                source = 'meeting';
            }
            window.open($.urlMap.downFile + '?fid=' + fid + '&source=' + source + '&sid=' + mid + '&t=' + new Date().getTime());

        },
        downfiles: function () {/*多文件下载*/
            var fids = this.getCheckedFids().join(',');
            if (!fids) $.fn.tips('未选中文件！');
            window.open($.urlMap.downFiles + '?fids=' + fids + '&t=' + new Date().getTime());
        },

        goEditFile: function (e) {

            var self = this;
            var tr = $(e.currentTarget).parents('tr');
            var url = tr.attr('data-url');
            window.open(url, "_blank");

            //window.open(url, 'newwindow');
        },

        delfile: function (e, type) {
            var self = this;
            var tr = $(e.currentTarget).parents('tr');
            var fid = tr.attr('data-fid');
            var mid = tr.attr('data-mid');
            var from = tr.attr('data-from');
            var source = from == '2' || from == '3' || this.options.route == 'ibox' ? 'person' : 'meeting';
            this.openConfirm2(fid, mid, function () {
                if (!type) {
                    tr.remove();
                } else {/*预览页删除*/
                    self.modal.preview.hide();
                    self.showDocList(self.options.parentid);
                }
                self.checkOp1();
                $.fn.tips('删除成功！', 1);
                if (self.options.route == 'ibox') {

                    Backbone.Events.trigger('UpdateTree');
                } else if (self.options.route == 'team') {

                    Backbone.Events.trigger('UpdateTreeTeam');
                }
            });
        },
        delfiles: function () {

            var self = this;
            var fids = this.getCheckedFids().join(',');
            if (!fids) $.fn.tips('未选中文件！');
            var objs = this.$el.find('tr td>input:checked');
            var mid = this.options.mid;
            this.openConfirm2(fids, mid, function () {
                objs.each(function () {
                    var tr = $(this).parents('tr');
                    tr.remove();
                });
                self.checkOp1();
                $.fn.tips('删除成功！', 1);
                if (self.options.route == 'ibox') {

                    Backbone.Events.trigger('UpdateTree');
                } else if (self.options.route == 'team') {

                    Backbone.Events.trigger('UpdateTreeTeam');
                }
            });
            return;

        },

        editname: function (objs) {
            if (objs.length > 1) {
                $.fn.tips('不支持批量重命名');
                return;
            }
            window.hasInputFocus = 1;
            objs.each(function () {
                var obj = $(this);
                var tr = obj.parents('tr');
                var fname = obj.parents('tr').find('.fname');
                var useCancel = 1;
                var name = tr.attr('data-name');
                var ext = tr.attr('data-ext');
                tr.attr('data-name', name);
                tr.attr('data-editing', 1);

                var nameWithoutExt = name.replace(/\.\w+$/, '');

                var str = _.template('<input value="<%=name%>"/><%if(ext){%>.<%=ext%><%}%><%if(useCancel){%><span class="crename"></span><%}%>')({
                    name: nameWithoutExt,
                    ext: ext,
                    useCancel: useCancel
                });
                fname.html(str);
                fname.find('input').select().focus();
            });

        },
        clickCancelRename: function (e) {
            var self = this;
            this.lockCancel = 1;
            e.stopPropagation();
            var obj = $(e.currentTarget);
            var $tr = obj.parents('tr');
            var isCreate = $tr.attr('data-create') == 1 ? 1 : 0;
            var fname = obj.parents('tr').find('.fname');
            $tr.attr('data-editing', 0);
            if (isCreate) {
                $tr.remove();
            } else {
                fname.html($tr.attr('data-name'));
            }
            window.hasInputFocus = 0;
            setTimeout(function () {
                self.lockCancel = 0;
            }, 300);

        },
        getCheckedFids: function () {
            var objs = this.$el.find('tr td>input:checked');
            var fids = [];
            objs.each(function () {
                var fid = $(this).parents('tr').attr('data-fid');
                fids.push(fid);
            });
            return fids;
        },

        /*全选*/
        selectall: function (e) {
            e.stopPropagation();
            var isChecked = $(e.target).attr('checked');
            var newChecked = !!isChecked;
            this.$el.find('td>input').attr('checked', newChecked);
            this.checkOp1();
        },
        /*单选*/
        selectone: function (e) {
            var self = this;
            e.stopPropagation();
            setTimeout(function () {/*由于js触发的click事件 check有延迟*/
                self.checkOp1();
            }, 100);

        },
        selectNote: function (e) {
            e.stopPropagation();
            var isChecked = $(e.target).attr('checked');
            var newChecked = !!isChecked - 0;
            if (e.target.name == 'is_hi') {
                this.uploader.options.formData.is_himsg = newChecked;
            } else {
                this.uploader.options.formData.is_mail = newChecked;
            }
        },
        clickFname: function (e) {/*预览文件*/
            var self = this;
            var $obj = $(e.currentTarget).parents('tr');
            var fid = $obj.attr('data-fid');
            var mid = $obj.attr('data-mid');
            var name = $obj.attr('data-name');
            var edit = $obj.attr('data-edit');
            var del = $obj.attr('data-del');
            var down = $obj.attr('data-down');
            var isdir = $obj.attr('data-isdir');
            var editurl = $obj.attr('data-url');
            var editing = parseInt($obj.attr('data-editing'));
            var from = $obj.attr('data-from');
            if (editing) {/*正在编辑*/
                return;
            }
            if (isdir) {/*显示目录结构*/
                if (this.options.route == 'ibox') {
                    this.goIboxPage({fid: from != 'share' ? fid : 'share' + fid});
                } else if (this.options.route == 'team') {
                    this.goTeamPage({fid: fid});
                } else {

                    this.showDocList(fid);
                }
                return;
            }
            if(this.options.route=='team') return;/*企业团队先屏蔽;又不屏蔽了*/
            self.modal = self.modal || {};
            self.modal.preview = new $.fn.Modal({
                id: '#wrappreview',

                closeButton: ".close",
                okButton: '.start',
                cls: 'wrappreview',
                stopClickClose: 1,
                data: {
                    name: name,
                    fid: fid,
                    mid: mid,
                    edit: edit,
                    editurl: editurl,
                    del: del,
                    down: down
                },
                events: {
                    'click .op0 span': self.clickop0,
                    'click .ophead': function () {
                        var h = $('#wrappreview .op0').height();
                        var de = 28;
                        if (h == de) {
                            $('#wrappreview .op0').height('auto');
                        } else {
                            $('#wrappreview .op0').height(de);
                        }
                    }
                },
                okCallBack: self.startall,
                callScope: self,
                closeCallBack: function () {
                    self.modal.preview.remove();
                },
                tpl: self.previewtpl,
                createCallBack: function () {

                    var h1 = 532, w1 = 1000;
                    var iframe = $('<iframe/>').on('load', function (e) {
                        /*var win = e.currentTarget.contentWindow.document.body;
                         var $win = $(win);
                         if ($win.find('._dcp_error').length) {
                         $win.html('暂时不支持');
                         }*/

                    }).attr({
                        src: $.urlMap.preview + '?fid=' + fid + '&width=' + w1 + '&height=' + h1,
                        frameborder: 0

                    }).css({

                        height: h1
                    });
                    $('#wrappreview').append(iframe);
                }
            });

            self.modal.preview.show();

        },
        showModal: function (id) {
            this.modal[id].show();
            return;

        },
        hideModal: function (id) {
            this.modal[id].hide();
            return;
        }
    });
    return View;
});