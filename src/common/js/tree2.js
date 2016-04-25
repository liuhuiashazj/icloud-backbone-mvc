/**
 * Created by liuhui on 16/3/24.
 */
/**
 * Created by liuhui on 15/11/20.
 *
 * functions(功能点)
 *      drag&drop
 *      use menu with the right mouse button(add,remove,rename)
 *      fold&unfold the tree
 * classNames（涉及到的css类）
 *      depth(n)(the depth of the item)
 *      jstree-item (on each item)
 *      jstree-close  (on each item,item with child and fold)
 *      jstree-open  (on each item,item with child and unfold)
 *      jstree-witem (in the li,wrap all except for the jstree-whole ele)
 *      jstree-icon (icon)
 *      jstree-wname(in the li,after jstree-icon)
 *      jstree-anchor(text of the item)
 *
 * options (实例化的参数)
 *      parentId:       the parent of this tree
 *      dropParent:     the parent of the menu when mousedown the right button
 *      insertBefore：  the position to add child data(1:before,2:after)
 *      url：           url to get remote data
 *      curl:           url to get the child tree
 *      addurl:         url to add child before add ele to the tree(todo)
 *      removeurl:      url to remove child before remove ele from the tree(todo)
 *      seturl:         url to rename the item before rename ele from the tree(todo)
 *      dbclicktime:    point the max time between click  to trigger rename(todo)
 *      aliasData:      the data map after get remote data(todo)
 *      litpl:          the template of each item in the li, flexible
 *      alias:          the data map of the data of each item,must
 *                      (id,text,hasChild,child,allmenu)
 *      depth:          how many levels of depth show for the first time
 *      open(boolean):           if to unfold all
 *      plugins(array):        (menu|dnd) use menu or drag plugin
 *      getMenu:        if want to get remote data when mousedown right button
 *      callbacks:
 *          onClick     trigger when click the item
 *          onBuildTree trigger after build the tree
 *          onDuplicateNameOnRename trigger on rename when the name repeat
 *          onDuplicateNameOnMove   trigger on drag when the name repeat
 *          onMoveToChildError trigger on drag when there is a error
 *          onDeleteChild trigger on delete
 *          onMenuCallback  trigger on the click of the menu
 *
 *

 *
 */

require(['jquery'], function ($) {
    var uid = 0,
    open = false,
    depth = 1000,
    treeId = 'jstree',
    iconcls = 'jstree-icon',
    iconclose = 'jstree-close',
    iconopen = 'jstree-open',
    licls = 'jstree-item',
    anchorCls = 'jstree-anchor',
    inputCls = 'jstree-input',
    mouseOnCls = 'jstree-item-on',
    focusCls = 'jstree-item-active',
    treeItemId = 'jstree-item-id',
    wnameCls = 'jstree-wname',
    witemCls = 'jstree-witem',
    cancelCls = 'jstree-cancel',
    inputtpl = '<input data-origin="<%this.text%>" data-fid="<%this.fid%>" class="' + inputCls + '" type="text" value="<%this.text%>"/><span class="' + cancelCls + '"></span>',
    tplDel = '<div class="nav"><span class="tit">提示</span><span class="close close4"></span></div> <div class="timg"><img src="common/imgs/timg.png" alt=""/><br/><%=tips%></div> <div class="op6"><div id="ok4" class="bbutton">确认</div><div class="close3 close4">取消</div></div>',

    clsMenu = 'jstree-menu',
    tplMenu = '<%for(var i=0;i<this.lists.length;i++){ list=this.lists[i];%><li data-value="<%list.value%>" ><%list.name%></li><%}%>',
    menuList = [
        {
            name: '重命名',
            value: 'rename'
        },
        {
            name: '新建子目录',
            value: 'create'
        },
        {
            name: '删除',
            value: 'delete'
        }
    ];

    var BaseTree = (function () {
        return {
            init: function (options) {
                var self = this, data, uid = this.getUid(),

                parentId = options.parentId,
                plugins = options.plugins || [];

                $.extend(this, options);
                this.options = options;
                this.plugins = plugins;
                data = options.datas || {};
                this.inputtpl = this.inputtpl || inputtpl;

                this.$parent = $('#' + parentId);
                this.$parent.attr('data-tree-id', treeId + '-' + uid)
                .addClass(treeId);

                this.dataCollection = $.TreeData2.getExample(options);
                window.dataCollection = this.dataCollection;
                this._initPlugin();
                /*必须在extendInit前面,否则某些参数没有初始化进去*/

                this.extendInit && this.extendInit();
                this._createTree();
                this._bindEvents();
                this.addEvents && this.addEvents();
            },
            _bindEvents: function () {

                var self = this, events = {};

                this._bindPluginEvent();
                events['click .' + anchorCls] = self._evtClick;
                events['mouseenter .' + witemCls] = self._evtEnter;
                events['mouseleave .' + witemCls] = self._evtLeave;
                events['click .' + iconcls] = self._evtFold;

                this.delegate(events);

            },
            _initPlugin: function () {
                var plugins = this.plugins, options = this.options, self = this;
                $.each(plugins, function (index, plugin) {
                    var type = plugin.type, ops = plugin.options;
                    plugin = $.BaseTree2.plugins[type];
                    plugin && plugin.init.call(self, ops);
                });
            },
            _bindPluginEvent: function () {
                var plugins = this.plugins, options = this.options, self = this;
                $.each(plugins, function (index, plugin) {
                    var type = plugin.type, ops = plugin.options;
                    plugin = $.BaseTree2.plugins[type];
                    plugin && plugin.bindEvents && plugin.bindEvents.call(self);
                });

            },
            _createTree: function (show) {
                var self = this, callbacks = this.options.callbacks, depth = this.options.depth;
                this.$parent.html('');
                this.dataCollection.fetchDataById().done(function () {

                    var collection = self.dataCollection, rootData,
                    datas, parent = self.$parent[0];
                    rootData = collection.getDataById();
                    datas = self.options.showRoot ? [rootData] : rootData.child;
                    self._insertDataToDom(parent, datas, show);
                    callbacks.onBuildTree && callbacks.onBuildTree(self);
                    if (!self.open) {
                        self.closeAll();
                    } else {
                        self.openAll();
                    }
                });

            },
            _createCtree: function (li) {
                var self = this, $ul, defferd = $.Deferred(), id, path,
                $ul = $(li).find('ul');
                $ul.remove();
                id = li.getAttribute(treeItemId);
                this.dataCollection.fetchDataById(id).done(function () {
                    var datas, data = self.dataCollection.getDataById(id);
                    datas = data.child;
                    self._insertDataToDom(li, datas, 1);
                    defferd.resolve();
                });
                return defferd.promise();

            },

            _insertDataToDom: function (parent, data) {
                var self = this, $ul = self._createLis(data);
                $(parent).append($ul);
                return $ul;
            },
            _createLis: function (datas) {
                var $li, data, $ul;
                $ul = $('<ul/>');

                for (var i = 0, l = datas.length; i < l; i++) {
                    data = datas[i];
                    $li = this._createLi(data);
                    $ul.append($li);
                }
                return $ul;
            },
            _createLi: function (data) {
                var ul, child = data.child || [], $li, cls, depth = data.depth || 0,
                inner = $.template(this.litpl, data);
                $li = $('<li />').append(inner).addClass(licls + ' depth' + depth).attr(treeItemId, data.itemId);
                if (data.hasChild) {
                    cls = data.isOpen ? iconopen : iconclose;
                    $li.addClass(cls);
                }

                if (data.hasChild && data.child) {
                    ul = this._createLis(child);
                    $li.append(ul);
                    return $li;
                } else {
                    return $li;
                }

            },

            _evtEnter: function (e) {
                $(e.currentTarget).addClass(mouseOnCls);
            },
            _evtLeave: function (e) {
                $(e.currentTarget).removeClass(mouseOnCls);
            },
            evtFocus: function (e) {
                var self = this, $obj = $(e.currentTarget), callbacks, $witem, $li,
                callback;
                callbacks = this.callbacks;
                callback = callbacks.onClick;
                $witem = $($.ldom.getParentByTag(e.currentTarget, '.' + licls));
                //self.$parent.find('.'+focusCls).removeClass(focusCls);
                self.$activeItem && self.$activeItem.removeClass(focusCls);
                self.$activeItem = $witem;
                self.$activeItem.addClass(focusCls);
                $li = $($.ldom.getParentByTag(e.target, 'li'));
                this.showFold($li);
                callback && callback.call(self, e);
            },
            _evtClick: function (e) {
                var self = this;
                this.clicks = this.clicks || 0;
                this.clicks++;
                if (this.clicks == 1) {
                    this.clickTimer = setTimeout(function () {
                        self.clicks = 0;
                        self.evtFocus(e);
                    }, self.dbclicktime);
                } else {
                    clearTimeout(this.clickTimer);
                    this.clicks = 0;
                    this.evtDbclick && this.evtDbclick(e);
                }

            },
            _evtFold: function (e) {
                var $obj = $(e.target), $li,
                $li = $($.ldom.getParentByTag(e.target, 'li'));
                if ($li.hasClass(iconclose)) {
                    this.showFold($li);
                } else if ($li.hasClass(iconopen)) {
                    this.hideFold($li);
                } else {
                    return;
                }

            },

            /*
             * 显示li的子元素
             * @return {promise}
             * 创建子元素并显示后返回done
             * r如果没有子元素创建空的ul便于插入li*/
            showFold: function ($li) {
                var $ul = $li.find('>ul'), defferd = $.Deferred(), id, hasChild;
                id = $li.attr(treeItemId);
                hasChild = this.dataCollection.getDataById(id).hasChild;
                if (hasChild) $li.removeClass(iconclose).addClass(iconopen);
                if (!$ul.length && hasChild) {
                    this._createCtree($li[0]).done(function () {
                        $li.find('>ul').show();
                        defferd.resolve()
                    });
                } else {
                    if (!$ul.length) $ul = $('<ul/>').appendTo($li);
                    $ul.show();
                    defferd.resolve();

                }
                this.dataCollection._openDataById(id);
                return defferd.promise();

            },
            hideFold: function ($li) {
                var id, $ul = $li.find('>ul');
                id = $li.attr(treeItemId);
                $li.removeClass(iconopen).addClass(iconclose);
                this.dataCollection._closeDataById(id);
                $ul.hide();
            },

            closeAll: function ($li) {
                var self = this, dom = this.$parent[0], ul, id, hasChild, cls, data, tid;
                if ($li) {
                    tid = $li.attr(treeItemId)-0;
                }
                //$(dom).find('li ul').hide();
                $(dom).find('>ul>li').each(function (index, ele) {
                    id = ele.getAttribute(treeItemId) - 0;
                    if(tid==id){
                        return true;
                    }
                    $(ele).find('>ul').hide();
                    data = self.dataCollection.getDataById(id);
                    hasChild = data.hasChild;
                    cls = hasChild ? ( iconclose) : '';
                    $(ele).removeClass(iconopen).addClass(cls);
                });
            },
            openAll: function () {
                var self = this, dom = this.$parent[0], ul, id, hasChild, cls, data;
                $(dom).find('li ul').show();
                $(dom).find('li').each(function (index, ele) {
                    id = ele.getAttribute(treeItemId) - 0;
                    data = self.dataCollection.getDataById(id);
                    ul = $(ele).find('ul');
                    hasChild = data.hasChild;
                    cls = hasChild && ul.length ? ( iconopen) : hasChild ? iconclose : '';
                    $(ele).removeClass(iconclose).addClass(cls);
                });
            },
            reloadTree: function () {
                this.dataCollection.reset();
                this._createTree();
            },
            updateTree: function (config) {
                $.extend(this.options, config);
                this.dataCollection.updateConfig(config);
                this.reloadTree();

            },
            delegate: function (events, el) {
                var self = this, arr, func, event, selector,
                $parent = $(this.$parent[0]);
                if (el) $parent = $(el);
                for (var i in events) {
                    arr = i.split(" ");
                    func = events[i];
                    event = arr.shift();
                    selector = arr.join(" ");
                    (function (func) {
                        $parent.on(event, selector, function (e) {
                            func && func.call(self, e);
                        })
                    })(func);

                }
            },
            extend: function (obj) {
                var newObject = Object.create(this);
                for (var i in obj) {
                    newObject[i] = obj[i];
                }
                return newObject;
            },
            getExample: function () {
                var obj = Object.create(this);
                obj.init.apply(obj, arguments);
                return obj;
            },
            emptyFunc: function () {
            },
            getUid: function () {
                uid++;
                return uid;
            }
        };

    })();
    $.BaseTree2 = BaseTree;
    $.BaseTree2.plugins = {};

    $.BaseTree2.plugins.menu2 = (function () {
        var obj = {
            extendInit: function () {
                var self = this;
                var tpl = _.template(tplDel);
                this.modalDelete = new $.fn.Modal({
                    id: 'deleteTree',
                    layid: '#lay3',
                    closeButton: ".close4",
                    okButton: '#ok4',
                    stopClickClose: 1,
                    cls: 'wrapdel',
                    data: {
                        tips: '删除后不可恢复,确定删除?'
                    },
                    okCallBack: function (e) {
                        var obj = self.curDelNode;
                        self.deleteNode(obj);
                        self.modalDelete.hide();
                    },

                    callScope: self,
                    tpl: tpl
                });
            },
            getFileId: function () {
                this.fileId = this.fileId || 0;
                return this.fileId++;
            },
            initRigthDrop: function () {
                var self = this, callbacks, obj, options = this.options,
                getDataCallback, menuCallback, ops = self.menuConfig;
                getDataCallback = ops.getData;
                menuCallback = ops.onClick;
                obj = {
                    el: '#' + options.parentId + ' .' + anchorCls,
                    parent: ops.dropParent, /*相对于谁来绝对定位*/
                    leftOffset: 0,
                    topOffset: 0,
                    tpl: tplMenu,
                    alias: function (props) {

                        var alias = {
                            allowMenu: 'data-menu'
                        };
                        return alias[props] || props;
                    },
                    cls: clsMenu,
                    lists: menuList,

                    selectCallback: function ($obj) {
                        var $parentNode = this.$obj,
                        type = $obj.attr('data-value');
                        switch (type) {
                            case 'create':
                                self.addNode($parentNode);
                                break;
                            case 'rename':
                                self.renameNode($parentNode);
                                break;
                            case 'delete':
                                self.modalDelete.show();
                                self.curDelNode = $parentNode;
                                break;
                            default :
                                menuCallback.call(this, type, $parentNode);
                                break;
                        }
                    }
                };
                if (getDataCallback) {
                    obj.getData = getDataCallback;
                }

                this.rightDropdown = $.RightDropDown.getExample(obj);
            },
            addNode: function ($obj) {
                if(this.hasInput) return;
                var self = this, id, $ul, depth,
                $li = $.ldom.getParentByTag($obj[0], 'li');
                $li = $($li);
                id = $li.attr(treeItemId)/*.addClass('depth'+)*/;
                $li.addClass(iconopen);
                this.showFold($li).done(function () {
                    $ul = $li.find('>ul');
                    self.insertInputToUl($ul, id);
                });

            },
            insertInputToUl: function ($ul, id) {
                var data = {}, index, cli, li;
                index = $ul.find('>li').length;
                data.text = '新建文件夹' + this.getFileId();
                data.hasChild = 0;
                data.index = index;
                data.isInput = 1;
                data.isAdd = 1;
                data.allowmenu = true;
                data.parentItemId = id;
                cli = this._createLi(data, 1);
                if (this.options.insertBefore) {
                    $ul.prepend(cli);
                } else {
                    $ul.append(cli);
                }
                $ul.find('input')
                .attr('data-isadd', 1)
                .attr('data-data', JSON.stringify(data))
                .select().focus();
                this.hasInput=1;

            },
            renameNode: function ($obj) {
                if(this.hasInput) return;
                var $li, input = $.template(this.inputtpl, {
                    text: $obj.html(),
                    fid: $obj.attr('data-fid')
                });
                $li = $obj.parent();
                $li.find('input').remove();
                $obj.hide();
                $li.append(input);
                $li.find('input').select().focus();
                this.hasInput=1;

            },
            deleteNode: function ($obj) {

                var parentLi, $li, id, hasChild, callbacks, delCallback;
                callbacks = this.options.callbacks;
                delCallback = callbacks.onDeleteChild;

                $li = $($.ldom.getParentByTag($obj[0], 'li'));
                parentLi = $.ldom.getParentByTag($li[0], 'li');
                id = $li.attr(treeItemId);
                this.dataCollection.removeDataById(id)
                .done(function (hasChild, parent) {
                    var depth = parent.depth;
                    $li.remove();
                    if (!hasChild) {
                        $(parentLi).removeClass().addClass(licls + ' depth' + depth);
                    }
                    delCallback && delCallback.call(self, parent);
                });

            },

            evtDbclick: function (e) {

                var $target = $(e.target);
                var allow = $target.attr('data-menu') - 0;
                if (!allow) return;
                this.renameNode($target);
            },
            evtInputKeyup: function (e) {
                var $obj = $(e.target);
                if (e.keyCode == 13) {
                    $obj[0].blur();
                }
            },
            evtCancel: function (e) {
                var $li, $input, isadd, $wrap, ovalue, wname, fid, val;
                this.hasInput=0;
                this.lockCancel = 1;
                $li = $($.ldom.getParentByTag(e.target, 'li'));
                $wrap = $($.ldom.getParentByTag(e.target, '.' + wnameCls));
                $input = $li.find('input');
                isadd = $input.attr('data-isadd');
                if (isadd) {
                    $li.remove();

                } else {
                    fid = $input.attr('data-fid');
                    val = $input.attr('data-origin');
                    $wrap.html('<span class="jstree-anchor" data-fid="' + fid + '" draggable="true">' + val + '</span>')
                }

            },
            evtInputBlur: function (e) {
                e.stopPropagation();
                var self = this, data, val, rt, isadd, id, $li, parentId, $obj = $(e.target);

                $li = $.ldom.getParentByTag(e.target, 'li');
                $li = $($li);
                val = $obj.val().trim();
                isadd = $obj.attr('data-isadd');
                if(!val){
                    $.fn.tips('输入不能为空!');
                    $obj.focus();
                    return;
                }
                if (isadd) {
                    setTimeout(function () {
                        if (self.lockCancel) {
                            self.lockCancel = 0;
                            return;
                        }
                        data = $obj.attr('data-data');
                        data = JSON.parse(data);
                        data.text = val;
                        data.isInput = 0;
                        data.itemId = self.dataCollection._getItemId();
                        parentId = data.parentItemId;
                        $li.attr(treeItemId, data.itemId);
                        self.dataCollection.addDataToId(parentId, data).done(function (rt, data) {
                            self.handleSpan(rt, $obj, data);
                        });
                    }, 100);

                } else {
                    id = $li.attr(treeItemId);
                    setTimeout(function () {
                        if (self.lockCancel) {
                            self.lockCancel = 0;
                            return;
                        }
                        self.dataCollection.setDataById(id, {
                            text: val
                        }).done(function (rt) {
                            self.handleSpan(rt, $obj);
                        });
                    }, 100);

                }

            },
            handleSpan: function (rt, $obj, data) {
                var self = this, callbacks, val = $obj.val(), span, fid, anchor, parent;
                callbacks = self.callbacks;
                data = data || {};
                /*有可能为undefined*/
                fid = $obj.attr('data-fid') || data.fid;
                if (!rt) {
                    $obj.select().focus();

                    callbacks.onDuplicatNameOnRename && callbacks.onDuplicatNameOnRename.call(self);
                    return;
                }
                parent = $obj.parent();
                anchor = $obj.parent().find('.' + anchorCls);
                if (!anchor.length) {
                    anchor = $('<span />').addClass(anchorCls).appendTo(parent);
                }
                val = $('<div/>').text(val).html();
                if(val.length>=15){/*in case of the tips is incorrect when rename or add new folder*/
                    anchor.attr('data-tips','S');
                }else{
                    anchor.removeAttr('data-tips');
                }

                anchor.html(val).attr('data-fid', fid).attr('draggable', 'true').attr('data-drop', 1).show();
                /*todo 添加数据获取*/
                this.hasInput=0;
                callbacks.onFinishInput&&callbacks.onFinishInput.call(self);
                parent.find('.' + cancelCls).remove();
                $obj.remove();

            }
        };
        return {
            init: function (ops) {
                this.menuConfig = ops;
                this.dataCollection.menuConfig = ops;
                $.extend(this, obj);

            },
            bindEvents: function () {
                this.initRigthDrop();
                var self = this, events = {};
                events['click .' + cancelCls] = self.evtCancel;
                events['keyup .' + inputCls] = self.evtInputKeyup;
                events['blur .' + inputCls] = self.evtInputBlur;
                events['keyup .' + inputCls] = self.evtInputKeyup;
                events['blur focusout .' + inputCls] = self.evtInputBlur;
                //events['dbclick .'+anchorCls]=self.evtDbclick;
                this.delegate(events);
            }
        }

    })();

    $.BaseTree2.plugins.dnd2 = (function () {
        var obj = {

            evtDragstart: function (ev) {
                //ev.stopPropagation();
                /*todo 重命名时无法foucs bug修复*/
                if (ev.target.tagName == 'INPUT') return;
                ev.preventDefault();
                var $obj = $(ev.target), path, id, $li = $($.ldom.getParentByTag(ev.target, 'li')), dragable;
                path = $li.attr('data-path');
                id = $li.attr(treeItemId);
                dragable = $obj.attr('draggable');
                if (!dragable) return;
                this.tips = $obj[0].innerHTML;
                this.dragId = id;
                this.$dragobj = $obj;
                this.$dragli = $li;
                this.isClick = 1;
                this.startX = ev.clientX;
                this.startY = ev.clientY;

            },

            evtDrag: function (ev) {
                var offsetX, offsetY;
                ev = ev.originalEvent;
                offsetX = Math.abs(ev.clientX - this.startX);
                offsetY = Math.abs(ev.clientY - this.startY);
                if (!this.isClick) return;
                if (offsetX > 10 || offsetY > 10) {
                    this.isMoving = 1;
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

            evtDrop: function (ev) {
                var $li, $obj = $(ev.target);
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
                if (!$obj.hasClass(anchorCls) || $obj.css('cursor') === 'no-drop') {/*拖拽到别处不执行,拖拽结束,通知treeleft*/

                    this.dragFromOut = 0;
                    return;
                }
                $li = $($.ldom.getParentByTag(ev.target, 'li'));
                if (!this.$dragli) {
                    return;
                }
                this.moveLiToLi(this.$dragli, $li);
                this.$dragli = null;
                return false;
            },
            evtDragenter: function (ev) {
                ev = ev.originalEvent;
                var $li, id, $obj = $(ev.target);
                if (!this.isMoving) return;
                var allow = $obj.attr('data-menu') - 0;
                var type = $obj.attr('data-drop') - 0;
                if (!allow && !type) {
                    $obj.css('cursor', 'no-drop');
                    return;
                }
                $li = $($.ldom.getParentByTag(ev.target, 'li'));
                id = $li.attr(treeItemId);
                $(ev.target).addClass('dragenter');
                if (id != this.dragId) this.showFold($li);
            },
            evtDragleave: function (ev) {
                var $obj = $(ev.target);
                //console.log('out');
                //return;
                $obj.css('cursor', 'pointer');
                ev = ev.originalEvent;
                $(ev.target).removeClass('dragenter');

            },
            moveLiToLi: function ($sli, $dli) {
                var self = this, $ul = $dli.find('>ul'), sid, did, haschild, parentLi, pid;
                sid = $sli.attr(treeItemId);
                did = $dli.attr(treeItemId);
                parentLi = $.ldom.getParentByTag($sli[0], 'li');

                if (sid == did) {
                    console.log('没有移动');
                    return;
                }
                this.dataCollection.moveDataToId(sid, did)
                .done(function (rt) {
                    if (!rt) return;
                    if (parentLi) {
                        pid = parentLi.getAttribute(treeItemId);
                        haschild = self.dataCollection._hasChildById(pid);
                        if (!haschild) {
                            self.dataCollection._closeDataById(pid);
                            $(parentLi).removeClass(iconopen);
                        }

                    }
                    if (!$ul.length) {
                        $ul = $('<ul />');
                        $dli.append($ul);
                    }
                    $dli.addClass(iconopen);
                    if (self.options.insertBefore) {
                        $ul.prepend($sli[0]);
                    } else {
                        $ul.append($sli[0]);
                    }

                });

                return;

            }
        };
        return {
            init: function (options) {
                /*this.dndImage = new Image(); //曾经用过 现在没用了
                 this.dndImage.src = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';*/
                this.$dragText = $('<div />').addClass('drag-icon').appendTo('body').hide();
                this.dataCollection.dndConfig = options;
                $.extend(this, obj);
            },
            bindEvents: function () {
                var self = this, events = {}, eventsBody = {};
                events['mousedown .' + anchorCls] = self.evtDragstart;

                events['mouseenter .' + anchorCls] = self.evtDragenter;
                events['mouseleave .' + anchorCls] = self.evtDragleave;

                eventsBody['mousemove'] = self.evtDrag;
                eventsBody['mouseup'] = self.evtDrop;
                this.delegate(events);
                this.delegate(eventsBody, 'body');

            }
        };
    })();
});