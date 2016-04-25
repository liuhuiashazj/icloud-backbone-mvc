/**
 * Created by liuhui on 15/12/3.
 */
require(['jquery'], function ($) {
    var TreeData = (function () {

        return {

            init: function (options) {
                this.mapData = {};
                this.datas = [];
                $.extend(this, options);
                if (options.datas) {
                    this.mapData[1] = this._getRootData();
                    this._resetChildDataById();
                }

                this.aliasHasChild = this.alias('hasChild');
                this.aliasText = this.alias('text');
                this.aliasId = this.alias('id');
                this.aliasChild = this.alias('child');
            },
            updateConfig: function (config) {
                $.extend(this, config);
            },

            reset: function () {
                this.mapData = {};
                this.datas = [];
            },
            _emptyPromise: function () {
                var deffered = $.Deferred();
                deffered.resolve();
                return deffered.promise();

            },
            _fetchData: function (id) {
                var self = this, tid, deferred = $.Deferred(), tdata, getData;
                getData = this.getData || this._emptyPromise;
                if (id != undefined) {/*获取子树*/
                    getData = this.getCData || getData;
                }
                tdata = this.getDataById(id);

                tid = tdata ? tdata[this.aliasId] : 0;
                getData.call(this, tid).done(function (data) {
                    if (id) {
                        self._insertDatasToId(id, data)
                    } else {
                        self.datas = data;
                        self.mapData[1] = self._getRootData();
                    }
                    deferred.resolve();
                });
                return deferred.promise();
            },

            /*远程获取一个子树 id不为空时返回所有数据
             * @return {promise}
             * */
            fetchDataById: function (id) {
                var self = this, deferred = $.Deferred(), data;
                data = this.getDataById(id);

                if (data && data.child) {
                    if (!id && !this.hasInit) this._resetChildDataById();
                    deferred.resolve();
                } else {

                    this._fetchData(id).done(function () {
                        if (!id && !this.hasInit) self._resetChildDataById();
                        deferred.resolve();
                    });
                }
                this.hasInit = 1;
                return deferred.promise();
            },
            /*通过层级远程获取数据,only support depth 2*/
            fetchDataByDepth: function (depth, id) {
                var deferred = $.Deferred(), self = this, datas, data, arr = [], index = 0;
                this._fetchData(id).done(function () {
                    if (!id && !self.hasInit) self._resetChildDataById();
                    data = self.getDataById(id);
                    datas = data.child;
                    for (var i = 0, l = datas.length; i < l; i++) {
                        (function () {
                            var defer2 = $.Deferred();
                            self.fetchDataById(datas[i].itemId).done(function () {
                                defer2.resolve();
                            });
                            arr.push(defer2);
                        })();

                    }
                    $.when.apply($, arr).done(function () {
                        deferred.resolve();
                    });

                });
                return deferred.promise();

            },
            /*获取所有子树*/
            _fetchChilds: function () {
                var deferred = $.Deferred();
            },
            /*获取一颗子树
             * @return {object}
             * */
            getDataById: function (id) {
                id = id || 1;
                return this.mapData[id];

            },

            _insertDatasToId: function (id, datas, index) {
                var self = this, data = this.mapData[id], child, rp, rt = true, callback = this.callbacks.add, pdata;

                child = data.child || [];
                index = index == undefined ? child.length : index;

                $.each(datas, function (i, tdata) {
                    rp = self._checkRepeat(tdata, id);
                    pdata = self.getDataById(id);
                    if (!rp) {
                        index++;
                        child.splice(index, 0, tdata);

                    } else {
                        console.log('重名');
                        rt = false;
                        return false;

                    }
                });
                data.hasChild = child.length ? 1 : 0;
                data.child = child;
                data.isOpen = 1;

                rt && this._resetChildDataById(id);
                return rt;
            },

            /*检查是否重复*/
            _checkRepeat: function (data, parentId, isadd) {
                var self = this, parent, child, rp = false;

                parent = this.mapData[parentId];
                child = parent.child || [];
                $.each(child, function (i, childData) {

                    if (data["text"] == childData["text"]) {
                        if ((!isadd && data.index != i) || isadd) {
                            rp = true;
                            return false;
                        }

                    }

                });
                return rp;

            },
            _getMenuConfig: function () {

                return this.menuConfig;
            },

            /*
             添加一个子节点 把datas添加到id
             @param id {number} itemid
             @param datas {Array}
             @param index插入位置
             @return {boolean} 插入是否成功
             * */
            addDataToId: function (id, tdata, index) {
                var self = this, data = this.mapData[id], child, rp,
                rt = true, pdata, dfid, text, remoteAdd,
                deferred = $.Deferred(), menu;

                child = data.child || [];
                index = index == undefined ? (this.insertBefore ? 0 : child.length) : index;

                rp = self._checkRepeat(tdata, id);
                pdata = self.getDataById(id);
                if (!rp) {
                    dfid = pdata[self.aliasId];
                    text = tdata.text;
                    menu = this._getMenuConfig();
                    remoteAdd = menu.reqOnAdd || self._emptyPromise;

                    remoteAdd.call(self, dfid, text).done(function (rdata) {
                        $.extend(tdata, rdata.result);
                        child.splice(index, 0, tdata);
                        data.hasChild = child.length ? 1 : 0;
                        data.child = child;
                        data.isOpen = 1;
                        self._resetChildDataById(id);
                        deferred.resolve(1, rdata.result);

                    });

                } else {
                    console.log('重名');
                    deferred.resolve(0);

                }
                return deferred.promise();

            },

            /*move某个子节点 把sid移动到did的子节点中
             * @param sid {number} 被移动的id
             * @param did {number} 目标节点id
             * @param index {number} 移入位置
             * @return {boolean} 操作成功与否
             * */

            moveDataToId: function (sid, did, index) {
                var self = this, sdata, ddata, sparent, deferred = $.Deferred(),
                schild, dchild, spath, dpath, reg, sfid, dfid, rp, callbacks = this.callbacks, reqOnMove, dnd;
                sdata = this.mapData[sid];
                ddata = this.mapData[did];
                sparent = this.mapData[sdata.parentItemId];
                schild = sparent.child;
                dchild = ddata.child || [];
                spath = sdata.path.join(',');
                dpath = ddata.path.join(',');
                dnd = this._getMenuConfig();
                if (!index) index = dnd.insertBefore ? 0 : dchild.length;

                reg = new RegExp('^' + spath);
                if (dpath.match(reg)) {
                    console.log('不能移动到子节点');
                    callbacks.onMoveToChildError && callbacks.onMoveToChildError.call(self);
                    deferred.resolve(0);
                } else {
                    sfid = sdata[this.aliasId];
                    dfid = ddata[this.aliasId];
                    /*检查重名*/
                    rp = self._checkRepeat(sdata, did, 1);
                    if (rp) {
                        console.log('不能重名');
                        callbacks.onDuplicatNameOnMove && callbacks.onDuplicatNameOnMove.call(self);
                        deferred.resolve(0);

                    } else {
                        this._moveRemoteData(sfid, dfid).done(function () {
                            schild.splice(sdata.index, 1);
                            if (!schild.length) {
                                sparent.hasChild = 0;
                            }
                            self._resetChildDataById(sdata.parentItemId);

                            dchild.splice(index, 0, sdata);
                            sdata.parentItemId = ddata.itemId;
                            ddata.hasChild = 1;
                            ddata.child = dchild;
                            self._resetChildDataById(ddata.itemId);
                            deferred.resolve(1);
                        });
                    }

                }

                return deferred.promise();

            },
            _moveRemoteData: function (sid, did) {
                var self = this, remoteData, deffered = $.Deferred(), url, dnd, reqOnMove;
                dnd = this.dndConfig;
                reqOnMove = dnd.reqOnMove || self._emptyPromise;
                reqOnMove.call(this, sid, did).done(function (data) {
                    deffered.resolve();
                });

                return deffered.promise();

            },
            /*删除一个子节点
             * return {boolean} 父级是否还有子节点*/
            removeDataById: function (id) {
                var self = this, data = this.mapData[id], fid, menu, remoteRemove,
                deferred = $.Deferred(), callbacks = this.callbacks,
                parentid = data.parentItemId,
                parent = this.mapData[parentid];
                fid = data[this.aliasId];
                menu = this._getMenuConfig();
                remoteRemove = menu.reqOnRemove || self._emptyPromise;

                remoteRemove.call(this, fid).done(function (err) {

                    parent.child.splice(data.index, 1);
                    delete self.mapData[id];
                    self._resetChildDataById(parentid);
                    deferred.resolve(parent.hasChild, parent);
                });
                return deferred.promise();

            },

            /*修改一个子树
             * @param id {number}
             * @param data {object}
             * @return {boolean} 设置是否成功
             * */
            setDataById: function (id, data) {
                var rp, originData = this.mapData[id], menu, remoteRename,
                deferred = $.Deferred(), fid,
                newData = $.extend({}, originData);
                newData = $.extend(newData, data);

                rp = this._checkRepeat(newData, originData.parentItemId);
                fid = originData[this.aliasId];

                menu = this._getMenuConfig();
                remoteRename = menu.reqOnRename || self._emptyPromise;
                if (rp) {
                    $.fn.tips('不能重名');
                    deferred.resolve(0);
                    return;
                }
                remoteRename.call(this, fid, data.text).done(function (err) {
                    if(err){
                         deferred.resolve(0);
                        return;
                    }
                    $.extend(originData, newData);
                    deferred.resolve(1);
                });


                return deferred.promise();
            },

            _openDataById: function (id) {
                var originData = this.mapData[id];
                originData.isOpen = 1;

            },
            _closeDataById: function (id) {
                var originData = this.mapData[id];
                originData.isOpen = 0;
            },
            _getRootData: function () {
                var data = {
                    child: this.datas,
                    hasChild: 1,
                    itemId: 1,
                    text: this.rootText,
                    isOpen: 1
                };

                return data;

            },

            /*重置某棵树的所有子节点*/
            _resetChildDataById: function (id) {
                var self = this, data, newArr, depth, arrPath;
                id = id || 1;
                data = this.mapData[id];

                arrPath = data.path || [];
                depth = data.depth || 0;
                if (!data.child.length) {/*子节点被删除时*/
                    data.hasChild = 0;
                }
                $.each(data.child, function (i, tdata) {

                    if (!tdata.itemId) {
                        tdata.itemId = self._getItemId();
                    }

                    newArr = $.extend([], arrPath);
                    newArr.push(i);
                    tdata.path = newArr;

                    tdata.index = i;
                    tdata.depth = depth + 1;
                    tdata.parentItemId = data.itemId;
                    tdata.hasChild = self._hasChild(tdata);
                    tdata.isOpen = tdata.hasChild && tdata.child && tdata.child.length;

                    if (!tdata.text) tdata.text = tdata[self.aliasText] || tdata.text;
                    if (!tdata.child) tdata.child = tdata[self.aliasChild] || tdata.child;

                    self.mapData[tdata.itemId] = tdata;
                    if (tdata.hasChild && tdata.child) {
                        self._resetChildDataById(tdata.itemId);
                    }
                });

            },

            alias: function (props) {
                var alias = {
                    text: 'text',
                    hasChild: 'hasChild',
                    child: 'child'

                };
                return alias[props] || props;

            },
            _hasChildById: function (id) {
                var data = this.mapData[id];
                return this._hasChild(data);
            },
            _hasChild: function (obj) {
                var child = obj[this.aliasChild] || [], hasChild = obj[this.aliasHasChild] - 0;
                if (obj.hasChild != undefined) {/*hasChild优先级高于alias*/
                    hasChild = obj.hasChild;
                }
                return (child.length || hasChild) ? 1 : 0;
            },
            _getItemId: function () {
                this.itemId = this.itemId || 10;
                return this.itemId++;
            },
            getExample: function () {
                var obj = Object.create(this);
                obj.init.apply(obj, arguments);
                return obj;
            }

        }
    })();
    $.TreeData2 = TreeData;

});