/**
 * Created by liuhui on 15/12/4.
 */
define([
    'text!views/iboxleft/left.css'
], function (css) {
    var View = Backbone.BaseView.extend({
        el: '#treeleft',
        cssText: css,
        url: $.urlMap.turl,
        events: {
            //'drop .jstree-anchor': 'evtDrop',
            'mouseenter .jstree-anchor': 'evtDragenter',
            'mouseleave .jstree-anchor': 'evtDragout'

        },
        treeTpl: '<span class="jstree-whole"></span><div class="jstree-witem " >' +
                 '<i class="jstree-icon <%if(this.type=="2"&&this.fid=="-1"){%>share<%}else if(this.type=="2"){%>person<%}else{%>file<%}%>"></i>' +
                 '<div class="jstree-wname" >' +
                 '<%if(!this.isInput){%>' +
                 '<span class="jstree-anchor" data-menu="<%this.allowmenu?1:0%>"  <%if(!(this.text.length < 10)){%>data-tips="<%this.text%>" <%}%> data-fid="<%this.fid%>"  <%if(this.type=="1"&&this.depth!=1){%>draggable="true"<%}%> data-drop="<%if(this.type=="1"){%>1<%}%>"><%this.text%></span>' +
                 '<%}else{%>' +
                 '<input class="jstree-input"  type="text" value="<%this.text%>"/><span class="jstree-cancel"></span>' +
                 '<%}%>' +
                 '' +
                 '</div></div>',
        reloadTree: function (fid) {
            var self = this;
            if (!self.tree || self.options.route != 'ibox') return;
            self.tree.updateTree({
                getData: this.getTreeData(fid)
            });

        },
        getTreeData: function (fid) {
            var self=this;
            return (function (fid) {
                return function () {
                    var id = fid || self.options.fid;
                    var deferred = $.Deferred();
                    $.get($.urlMap.turl, {
                        source: 'person',
                        vfid: id,
                         _:new Date().getTime()
                    }, function (data) {
                        if (parseInt(data.errno)) return;
                        deferred.resolve(data.result);
                    });
                    return deferred.promise();
                }
            })(fid);
        },
        init: function (pop) {
            var self = this;
            Backbone.Events.on('UpdateTree', function (fid) {
                self.reloadTree(fid);
            });
            Backbone.Events.on('UpdateCur', function (fid) {
                self.setDomAsCurrent(fid);
            });
            Backbone.Events.on('dragfile', function (id) {
                self.dragFromOut = 1;
                self.outDragFid = id;
            });
            Backbone.Events.on('dragfileend', function () {
                self.dragFromOut = 0;
            });

            $('body').on('mouseup', function (e) {
                self.evtDrop(e);
            });
            this.$el.on('mousewheel', function (e) {
                $('.jstree-menu').hide();
            });
            this.extendInit.call(this,pop);

            $.fn.poptips({
                parent: 'body',
                selector: '.jstree-anchor',
                top: 10,
                left: 10,
                cls: 'treepop',
                width: 'auto'
            });
        },
        extendInit: function () {
        },
        setDomAsCurrent: function (fid) {
            var offTop,span,li;
            fid = fid != undefined ? fid : this.fid;
            fid = fid == 'share' ? '-1' : fid;

            span = this.$el.find('[data-fid="' + fid + '"]');
            //debugger;
            if (!span.length) return;
            li = $.ldom.getParentByTag(span[0], 'li');
            offTop=$(li).offset().top;
            this.$el.find('.jstree-item-active').removeClass('jstree-item-active');
            this.$el[0].scrollTop=offTop-100;
            /*this.$el.animate({
                scrollTop:offTop-100
            });*/
            this.tree.$activeItem = $(li);
            $(li).addClass('jstree-item-active');
            this.$el.find('.wrap-tree').css({
                opacity:1
            });

        },
        getMenuConfig: function () {
            var self = this;
            var menuConfig = {
                insertBefore: 1,
                dbclicktime: 200,
                dropParent: '#wrapall',

                reqOnAdd: function (id, text) {
                    var deffered = $.Deferred(), url;
                    url = $.urlMap.addurl;
                    $.post(url, {
                        dirname: text,
                        source: 'person',
                        parentid: id,
                        sid: 0
                    }, function (data) {
                        deffered.resolve(data);
                    });

                    return deffered.promise();

                },
                reqOnRemove: function (id) {
                    var deffered = $.Deferred(), url;
                    url = $.urlMap.removeurl;
                    $.post(url, {
                        fids: id
                    }, function (data) {
                        deffered.resolve();
                    });

                    return deffered.promise();
                },
                reqOnRename: function (id, text) {
                    var deffered = $.Deferred(), url;
                    url = $.urlMap.seturl;

                    $.post(url, {
                        fid: id,
                        name: text
                    }, function (data) {
                        deffered.resolve(data);
                    });

                    return deffered.promise();
                }

            };
            return menuConfig;
        },

        initTree: function () {
            var self = this, fid, menuConfig;
            menuConfig = this.getMenuConfig();
            fid = this.fid;
            if (this.hasInit) {
                //self.tree.reloadTree(url);
                return;
            }
            this.hasInit = 1;
            this.tree = $.BaseTree2.getExample({
                parentId: 'tree',
                getData: function (id) {
                    if (id == 0) id = fid;
                    var deferred = $.Deferred();

                    $.get($.urlMap.turl, {
                        source: 'person',
                        vfid: id,
                         _:new Date().getTime()

                    }, function (data) {
                        if (parseInt(data.errno)) return;

                        deferred.resolve(data.result);

                    });
                    return deferred.promise();

                },
                getCData: function (id) {
                    var deferred = $.Deferred();
                    id = id || 0;
                    $.get($.urlMap.turl, {
                        source: 'person',
                        fid: id,
                         _:new Date().getTime()

                    }, function (data) {
                        if (parseInt(data.errno)) return;
                        deferred.resolve(data.result);

                    });
                    return deferred.promise();
                },
                litpl: self.treeTpl,
                alias: function (props) {
                    var alias = {
                        id: 'fid',
                        text: 'dirname',
                        hasChild: 'havechild',
                        child: 'child',
                        allowmenu: 'allowmenu'
                    };
                    return alias[props] || props;
                },

                open: true,
                plugins: [
                    {
                        type: 'menu2',
                        options: menuConfig
                    },
                    {
                        type: 'dnd2',
                        options: {
                            insertBefore: 1,
                            reqOnMove: function (sid, did) {
                                var deffered = $.Deferred(), url;
                                url = $.urlMap.moveurl;
                                $.post(url, {
                                    dest_fid: did,
                                    source_fids: sid
                                }, function (data) {
                                    deffered.resolve();

                                });
                                return deffered.promise();
                            }
                        }
                    }
                ],
                callbacks: {
                    onClick: function (e) {
                        var fid = e.target.getAttribute('data-fid');
                        var data = {};
                        data.fid = fid;
                        if (fid == -2) return;
                        if (fid == '-1') data.fid = 'share';
                        self.goIboxPage(data);

                    },

                    onBuildTree: function () {
                        self.setDomAsCurrent();
                    },
                    onDuplicatNameOnRename: function (e) {
                        $.fn.tips('不能重名');
                    },
                    onDuplicatNameOnMove: function (e) {
                        $.fn.tips('移动失败,该目录下已经有同名文件夹');
                    },
                    onMoveToChildError: function (e) {
                        $.fn.tips('移动失败,不能移动到子节点');
                    },

                    onDeleteChild: function (parent) {
                        var tid = parent.fid;

                        self.goIboxPage({
                            fid: tid
                        });
                        self.setDomAsCurrent(tid);
                        $.fn.tips('删除成功', 1);

                    }

                }
            });

        },

        display: function (options) {

            var self = this, fid = options.fid || 0;
            this.fid = fid;
            this.options = options;
            if (fid != this.lastFid) {
                this.lastFid = fid;

            } else {

                return;
            }

            this.initTree();

        },

        evtDrop: function (ev) {
            ev = ev.originalEvent;
            var fid = this.outDragFid, $obj = $(ev.target), did, menu;
            if (!this.dragFromOut || !fid) return;
            if (!$obj.hasClass('jstree-anchor')) {/*拖拽到别处不执行,拖拽结束,通知treeleft*/

                this.dragFromOut = 0;
                return;
            }
            did = ev.target.getAttribute('data-fid');
            menu = ev.target.getAttribute('data-menu') - 0;
            var drop = $(ev.target).attr('data-drop') - 0;
            //debugger;
            if (!menu && !drop) return;
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
            this.dragFromOut = 0;
        },
        evtDragenter: function (ev) {
            var $li, id, $obj;
            ev = ev.originalEvent;
            if (!this.dragFromOut) return;
            //console.log('enter');
            //return;
            $obj = $(ev.target);
            var allow = $(ev.target).attr('data-menu') - 0;
            var drop = $(ev.target).attr('data-drop') - 0;
            if (!allow && !drop) {
                $obj.css('cursor', 'no-drop');
                return;
            }
            $li = $($.ldom.getParentByTag(ev.target, 'li'));
            $(ev.target).addClass('dragenter');
            this.tree.showFold($li);
        },
        evtDragout: function (ev) {
            var $obj = $(ev.target);
            //console.log('out');
            //return;
            $obj.css('cursor', 'pointer');
            ev = ev.originalEvent;
            $(ev.target).removeClass('dragenter');
        }
    });
    return View;
});