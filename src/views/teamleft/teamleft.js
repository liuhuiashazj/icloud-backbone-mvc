/**
 * Created by liuhui on 16/3/18.
 */
/**
 * Created by liuhui on 16/3/18.
 */
define([
    'views/iboxleft/iboxleft',
    'text!views/teamleft/teamleft.css',
    'text!views/teamleft/setrule.tpl',
    'text!views/teamleft/newspace.tpl',
    'text!views/teamleft/treespan.tpl',
    'text!views/teamleft/tabletr.tpl'
], function(DocView, css, settpl, newtpl, treespan, tabletr) {
    var docEvent = DocView.prototype.events;
    var View = DocView.extend({
        el: '#treeleft2',
        cssText: css,
        url: $.urlMap.tturl,
        newtpl: _.template(newtpl),
        settpl: _.template(settpl),
        ruletd: _.template(tabletr),

        treespantpl: treespan,
        dataAuthorTag: {},
        dataAuthorMailTag: {},
        dataAuthor: [],
        dataAuthorMail: [],
        hideTime: 2000,
        ruleParent: '#setRuleModel',
        events: $.extend({
            'click .addnew': 'showAddNew'
        }, docEvent),
        showAddNew: function() {
            this.modal.addNew.show();
        },
        rightOps: {
            'download': {
                name: '下载',
                value: 'down'
            },
            'addfolder': {
                name: '新建子目录',
                value: 'create'
            },
            'del': {
                name: '删除',
                value: 'delete'
            },
            'rename': {
                name: '重命名',
                value: 'rename'
            },
            'setrule': {
                name: '权限设置',
                value: 'setrule'
            }
        },
        switchTypes: function(e) {
            var $obj = $(e.currentTarget),
                $ul, $wrap, datafor;
            datafor = $obj.attr('data-for');
            this.currentRuleType = datafor == 'rpart' ? 3 : datafor == 'ruser' ? 1 : 2;
            $ul = $obj.parents('ul');
            $ul.find('li').removeClass('cur');
            $obj.addClass('cur');
            $wrap = $ul.parents('.wraprule');
            $wrap.find('.right>div').hide();
            $wrap.find('.' + datafor).show();

        },
        showRuleData: function(obj, rtype, inherit) {
            var self = this;
            var fid = self.kfid;
            var data = {
                fid: fid,
                type: rtype,
                _: new Date().getTime()
            };
            if (inherit) {
                data.isherit = 1;
            }
            if (rtype == 3) { //team
                $.get($.urlMap.teamrules, data, function(data) {
                    if (data.errno) return;
                    self.renderRuleData(data.result.rules, 3);
                });
            } else if (rtype == 1) { //user
                $.get($.urlMap.teamrules, data, function(data) {
                    if (data.errno) return;
                    if (!inherit) {
                        $(self.ruleParent).find('.inherit').prop('checked', data.result.isherit == '1');
                        if (!data.result.isherit) {
                            self.showTips('目录权限已修改，不再与父目录一致');
                        }

                    }

                    self.renderRuleData(data.result.rules, 1);
                });
            }

        },
        renderRuleData: function(data, rtype) {

            var cls = rtype == 1 ? ' .ruser' : rtype == 2 ? ' .rmail' : ' .rpart';
            var $parent = $(this.ruleParent + cls + ' .items2');
            var self = this;
            if (rtype == 3) {
                self.dataTeam = data;
            } else if (rtype == 1) {
                var arr1 = _.pluck(data, 'email');
                $.each(arr1, function(i) { /*添加重命名检查*/
                    self.dataAuthorTag[arr1[i]] = 1;
                    self.dataAuthor.push(data[i]);
                });
                self.selectUserLength = data.length;
            }
            var str = self.ruletd({
                datas: data,
                start: 1,
                isSpace: /^\d+$/.test(self.kfid) ? 0 : 1,
                showEditLine: self.showEditLine,
                showAddLine:self.showAddLine
            });
            $parent.html(str);
        },

        initUsers: function($parent) {
            this.selectUserLength = 0;
            $parent.find('table').html('');
            $parent.find('.search').val('');

        },
        initUserSearch: function() {
            var self = this,
                url;
            if (this.hasInitDropSearch) {
                return;
            }
            this.hasInitDropSearch = 1;

            $.InputDropDown.getExample({
                el: '.suser',
                parent: 'body',
                css: {
                    width: 311,
                    height: 150,
                    maxHeight: 150
                },
                leftOffset: 0,
                topOffset: 3,
                tpl: '<%for(var i=0;i<this.lists.length;i++){ list=this.lists[i];%>' +
                    '<li class="linfo <%if(list.hasShow){%>added<%}%>" ' +
                    'data-email="<%list.email%>"  ' +
                    'data-realname="<%list.truename%>" ' +
                    'data-key="<%list.key%>"' +
                    'data-rtype="<%list.type%>" ><%list.truename%>(<%list.departmentName%>)<div><%list.key%></div></li><%}%>',
                getData: function(e) {
                    var me = this,
                        url,
                        $obj = $(e.target),
                        val,
                        deferred = $.Deferred();
                    val = $obj.val();
                    url = $.urlMap.searchUser;
                    clearTimeout(self.lastSuggestAjax);
                    self.lastSuggestAjax = setTimeout(function() {
                        $.ajax({
                            url: url,
                            cache: false,
                            type: 'get',
                            dataType: 'json',
                            data: {
                                kw: val,
                                filter: self.currentRuleType == 2 ? 'emailgroup' : ''
                            },
                            success: function(data) {
                                data = data.result;
                                me.lists = data;
                                deferred.resolve();
                            }
                        });
                    }, 100);


                    return deferred.promise();
                },

                tplSpan: '<span class="op5"><%=name%></span>',
                delCallback: function($obj) {},
                enterCallback: function($obj) {},

                selectCallback: function($obj) {
                    var email = $obj.attr('data-email'),
                        key = $obj.attr('data-key'),
                        str, len, func,key,
                        rtype = $obj.attr('data-rtype'),
                        realname = $obj.attr('data-realname');
                    if (rtype == 2) {
                        key = email.replace(/[-@\.\/\\]/g, '_');
                    }

                    func = self.addNewData;
                    func.call(self, self.currentRuleType, {
                        "email": email,
                        "key":key,
                        "rtype": rtype,
                        "isview": 1,
                        "isdownload": 0,
                        "isedit": 0,

                        "isadmin": 0,
                        "isrewrite": 1,
                        "isqadmin": 0,
                        "realname": realname
                    }, 1);
                    this.$el.val('');
                    this.hide();
                    self.noInherit();

                }
            });
        },
        noInherit: function() {
            var self = this;
            $(self.ruleParent).find('.inherit').prop('checked', false);
            self.showTips('目录权限已修改，不再与父目录一致');

        },
        addNewData: function(rtype, data, insertBefore) {
            var self = this,
                cls, tagName, lenName, arrName,
                str, len, $table;
            if (rtype == 1) {
                cls = ' .ruser';
                tagName = 'dataAuthorTag';
                lenName = 'selectUserLength';
                arrName = 'dataAuthor';
            } else if (rtype == 2) {
                cls = ' .rmail';
                tagName = 'dataAuthorMailTag';
                lenName = 'selectMailLength';
                arrName = 'dataAuthorMail';
            }
            $table = $(self.ruleParent + cls + '  table');

            if (self[tagName][data.key]) {
                $.fn.tips('已添加该人!');
                return;
            }

            self[tagName][data.key] = 1;
            if (self[lenName] === undefined) {
                self[lenName] = 0;
            }
            ++self[lenName];
            len = self[lenName];
            str = self.ruletd({
                datas: [data],
                start: len,
                isSpace: /^\d+$/.test(self.kfid) ? 0 : 1,
                showEditLine: self.showEditLine,
                showAddLine:self.showAddLine
            });

            if (insertBefore) {
                $table.prepend(str);
                $table.find('.t1-index').each(function(index, obj) {
                    obj.innerHTML = index + 1;
                });

            } else {
                self[arrName].push(data);
                $table.append(str);
            }
        },
        deleteData: function(rtype, key, $tr) {
            var self = this,
                cls, tagName, lenName, arrName,
                $table, obj, index, arr = self.dataAuthor,
                data;
            if (rtype == 1) {
                cls = ' .ruser';
                tagName = 'dataAuthorTag';
                lenName = 'selectUserLength';
                arrName = 'dataAuthor';
            } else if (rtype == 2) {
                cls = ' .rmail';
                tagName = 'dataAuthorMailTag';
                lenName = 'selectMailLength';
                arrName = 'dataAuthorMail';
            }
            $tr = $tr || $(self.ruleParent + ' [data-key=' + key + ']');
            if (self[lenName] == 1) {
                $.fn.tips('权限设置里,至少要有一名用户管理空间权限', 0, 0, 'tipscenter');
                return;
            }
            $table = $tr.parents('table');
            delete self[tagName][key];
            --self[lenName];
            $tr.remove();
            self[arrName] = _.without(arr, _.findWhere(arr, { key: key }));
            $table.find('.t1-index').each(function(index, obj) {
                obj.innerHTML = index + 1;
            });
        },


        
        findTr: function(value) {
            value = $.trim(value);
            if (!value) return;
            var data, self = this,
                reg, rdata, arr, $tr, $parent;
            data = self.dataTeam;
            reg = new RegExp(value);
            rdata = data.filter(function(data, index) {
                var name = data.name || '';
                if (name.match(reg)) {
                    return true;
                }

            });
            arr = _.pluck(rdata, 'email');
            $parent = $(self.ruleParent + ' .rpart .wraptable');
            $(self.ruleParent + ' .rpart tr').removeClass('on');
            $.each(arr, function(index, val) {
                $tr = $(self.ruleParent + ' .rpart tr[data-email=' + val + ']');
                if (index == 0) {
                    $parent.animate({
                        scrollTop: $tr.offset().top - $parent.offset().top
                    }, 200);
                    //$parent[0].scrollTop = $tr.offset().top - $parent.offset().top;
                }
                $tr.addClass('on');
            });

        },
        stopShare: function() {
            var self = this;
            self.modal.setRule.hide();
            self.modal.del.show();
        },

        resetRule: function(e) {
            var self = this,
                $obj = $(e.target),
                isChecked, key, type, $tr, $table;
            $tr = $obj.parents('tr');
            if ($tr.hasClass('disable')) return;
            type = $tr.attr('data-rtype');
            key = $tr.attr('data-key');
            if (type == 3) {
                $tr.find('input').prop('checked', false);
            } else if (type == 1) {
                self.deleteData(1,key, $tr);
            } else {
                self.deleteData(2,key, $tr);
            }

        },
        recoveData: function() {
            var data = this.lastRuleData;
            if (!data) return;
            var users = _.filter(data, function(d, i) {
                return d.rtype == '1';
            });
            var teams = _.filter(data, function(d, i) {
                return d.rtype == '3';
            });
            this.renderRuleData(users, 1);
            this.renderRuleData(teams, 3);
        },

        getFormData: function() {
            var self = this,
                $parent, $trs, isChecked, datas = [];
            $parent = $(this.ruleParent);
            $trs = $parent.find('tr');
            $trs.each(function(index, tr) {
                var inputs = $(tr).find('input'),
                    data, email, rtype, obj = {},
                    input, key, name, qadmin, isrewrite;
                email = tr.getAttribute('data-email');
                rtype = tr.getAttribute('data-rtype');
                name = tr.getAttribute('data-name');
                qadmin = tr.getAttribute('data-isqadmin') - 0;
                isrewrite = tr.getAttribute('data-isrewrite') - 0;
                for (var i = 0, l = inputs.length; i < l; i++) {
                    input = inputs[i];
                    key = input.getAttribute('value');
                    isChecked = !!input.checked - 0;
                    obj[key] = isChecked;
                }
                if (typeof obj.isedit == "undefined") {
                    obj.isedit = 0;
                }
                $.extend(obj, {
                    name: name,
                    realname: name,
                    email: email,
                    rtype: rtype,
                    isqadmin: qadmin,
                    isrewrite: isrewrite
                });
                datas.push(obj);
            });
            return datas;

        },
        submitForm: function($parent) {
            var self = this,
                datas, newdata = [];
            var sort = [
                'isadmin',
                'isupload',
                'isdownload',
                'isedit',
                'isview',
                'isdel'
            ];
            datas = self.getFormData();
            $.each(datas, function(index, obj) {
                var arr = [],
                    data;
                for (var i = 0, l = sort.length; i < l; i++) {
                    arr.push(obj[sort[i]]);
                }
                data = {
                    email: obj.email,
                    chmod: arr.join(''),
                    rtype: obj.rtype
                };
                newdata.push(data);
            });

            var str = JSON.stringify(newdata);
            var inherit = $(this.ruleParent).find('.inherit').prop('checked');
            $.post($.urlMap.setteamrule, {
                fid: self.kfid,
                rules: str,
                isherit: inherit ? 1 : 0

            }, function(data) {
                if (data.errno) {
                    $.fn.tips(data.errmsg);
                    return;
                }
                self.modal.setRule.hide();
            });

        },
        hideTips: function() {
            var self = this;
            $(this.ruleParent).find('.tips').stop().css({
                opacity: 0
            });
            return;
        },
        showTips: function(str) {
            var self = this;
            $(this.ruleParent).find('.tips').html(str).stop().css({
                    opacity: 1
                })
                /*.animate({
                             opacity: 0
                             }, self.hideTime)*/
            ;
        },
        initModalSet: function() {
            var self = this;
            self.modal.setRule = new $.fn.Modal({
                id: self.ruleParent,
                layid: '#lay6',
                closeButton: ".close4",
                stopClickClose: 1,
                data: {
                    showEditLine: self.showEditLine,
                    showAddLine:self.showAddLine
                },
                tpl: self.settpl,
                okButton: '#ok4',
                events: {
                    'click .switch li': function(e) {
                        self.switchTypes(e)
                    },
                    /*'click .items2 input': self.checkInput,*/
                    'mouseenter table tr': self.mouseon,
                    'mouseleave table tr': self.mouseout,
                    'click #ok5': function() {
                        self.submitForm(this.$parent);
                    },
                    'click .stopShare': function() {
                        self.stopShare();
                    },
                    'click td .greybox': function() {
                        self.noInherit();

                    },
                    'click #startSearch': function(e) {
                        var value = this.$parent.find('.spart')[0].value;
                        self.findTr(value);
                    },
                    'keyup .spart': function(e) {
                        var value = $(e.currentTarget)[0].value;
                        if (e.keyCode == 13 && this.lastValue == value) {
                            self.findTr(value);
                        }
                        this.lastValue = value;

                    },
                    'click .delrule': function(e) {
                        var $tr = $(e.target).parents('tr');
                        if ($tr.hasClass('disable')) return;
                        self.resetRule(e);
                        self.noInherit();
                    },
                    'click .addall': function(e) {
                        var $obj = $(e.currentTarget),
                            isChecked;
                        if (self.isAddAll) return;
                        self.isAddAll = 1;

                        self.addNewData(1, {
                            "email": 'allusers',
                            "rtype": 1,
                            "isview": 1,
                            "isdownload": 0,
                            "isedit": 0,
                            "isadmin": 0,
                            "isrewrite": 1,
                            "isqadmin": 0,
                            "realname": '所有人'
                        }, 1);
                        self.noInherit();

                    },
                    'click .inherit': function(e) {
                        var $obj = $(e.currentTarget),
                            isChecked;
                        isChecked = !!$obj.attr('checked') - 0;
                        if (isChecked) {
                            self.lastRuleData = self.getFormData();
                            self.initSetData(this.$parent, 1);
                            self.showTips('您更改的权限将丢失，恢复到与父目录一致');

                        } else {
                            self.recoveData();
                            self.showTips('目录权限已修改，不再与父目录一致');

                        }

                    }
                },
                beforeShow: function() {

                    var fid = self.kfid;
                    if (fid.match(/^t/)) {
                        this.$parent.find('.bottom').hide();
                    } else {
                        this.$parent.find('.bottom').show();
                    }
                    $(self.ruleParent).find('.inherit').prop('checked', false);
                    delete self.lastRuleData;
                    self.hideTips();
                },
                showCallBack: function() {
                    var $parent = this.$parent;
                    self.initSetData($parent);
                }

            });
            if (this.initPoptipsFlag) {
                return;
            }
            this.initPoptipsFlag = 1;
            $.fn.poptips({
                parent: self.ruleParent,
                selector: '.ttip',
                cls: 'tpop',

                top: 2
            });

        },

        initSetData: function($parent, type) {
            var self = this;
            self.dataAuthor = [];
            self.dataAuthorTag = {};
            self.dataAuthorMail = [];
            self.dataAuthorMailTag = {};
            self.isAddAll = 0;
            self.initUsers($parent);
            self.initUserSearch($parent);
            self.showRuleData($parent, 3, type);
            self.showRuleData($parent, 1, type);
        },
        initModalDel: function() {
            var self = this;
            self.modal.del = new $.fn.Modal({
                id: '#wrapdel5',
                closeButton: ".close2",
                okButton: '.bbutton',
                layid: '#lean_overlay7',
                stopClickClose: 1,
                cls: 'wrapdel',
                data: {
                    tips: '恢复默认后将继承父级目录权限,<br/>您将失去本目录下更改的权限设置.<br/>确认恢复到父目录一致?'
                },
                css: {
                    zIndex: 15000
                },

                okCallBack: function(e) {
                    self.lockShow = 1;
                    self.reqStopShare();

                },
                closeCallBack: function() {
                    if (!self.lockShow) {
                        self.modal.setRule.show();
                    }

                },
                callScope: self,
                tpl: self.confirmtpl
            });
        },
        reqStopShare: function() {
            var self = this,
                fid = self.kfid;
            $.get($.urlMap.stopteamrule, {
                source: 'team',
                fid: fid,
                _: new Date().getTime()
            }, function(data) {
                if (data.errno) return;
                self.modal.del.hide();
                self.lockShow = 0;

            });
        },
        initModalNew: function() {
            var self = this;

            self.modal.addNew = new $.fn.Modal({
                id: '#wrapaddnew',
                layid: '#layteam',
                closeButton: ".close4",
                okButton: '#ok4',
                stopClickClose: 1,
                cls: 'wrapaddnew',
                events: {
                    'keyup #spacename': function(e) {
                        var value = $(e.currentTarget)[0].value,
                            obj = $(e.target);
                        if (e.keyCode == 13 && this.lastValue == value) {
                            self.addSpace(value, obj);
                        }
                        this.lastValue = value;
                    }
                },
                okCallBack: function(e) {
                    var val, el = this.$parent.find('#spacename'),
                        scope = this;
                    val = el.val();

                    self.addSpace(val, el);

                },
                showCallBack: function() {
                    var el = this.$parent.find('#spacename');
                    el.val('新建空间').select().focus();

                },

                tpl: self.newtpl
            });
            //this.modal.addNew.show();
        },
        addSpace: function(val, obj) {
            var self = this;
            if (!$.trim(val)) {
                $.fn.tips('输入不能为空!');
                obj.focus();
                return;
            }
            $.post($.urlMap.addqzone, {
                teamname: val

            }, function(data) {
                if (data.errno) {
                    $.fn.tips(data.errmsg);
                    return;
                }
                $.fn.tips('创建成功！', 1);
                self.goTeamPage({
                    fid: 't' + data.result.qzoneId
                });
                Backbone.Events.trigger('UpdateTreeTeam');
                self.modal.addNew.hide();

            })
        },
        reloadTreeTeam: function(fid) {
            var self = this;
            if (!self.tree || self.options.route != 'team') return;
            this.$el.find('.wrap-tree').css({
                opacity: 0
            });
            self.tree.updateTree({
                getData: this.getTreeData(fid)
            });

        },
        getTreeData: function(id) {
            var self = this;
            return (function(id) {
                return function() {
                    var deferred = $.Deferred(),
                        data;
                    data = {
                        source: 'team',
                        vfid: self.fid || 0
                    };
                    data._ = new Date().getTime();
                    $.get($.urlMap.tturl, data, function(data) {
                        if (parseInt(data.errno)) return;
                        deferred.resolve(data.result);

                    });
                    return deferred.promise();
                };
            })(id);

        },
        extendInit: function(pop) {
            var self = this;
            self.$el.find('.headnav').html(pop.name).show();
            if (pop.auths.allow_addqzone) { /*显示新建空间*/
                self.$el.find('.addnew').css({
                    'display': 'block'
                });
            }
            this.showEditLine = parseInt(pop.isedit);
            this.showAddLine=1;
            /*if ($.browser.chrome) {
                this.$el.on('scroll', function () {/!*修复scrollbug*!/
                    this.scrollLeft = 0;
                });
            }*/

            Backbone.Events.on('UpdateTreeTeam', function(fid) {
                self.reloadTreeTeam(fid);
            });
            Backbone.Events.on('LoadTeamCTree', function(fid) {
                //var li=
                //self.tree.showFold();
            });

            this.initModalNew();
            this.initModalDel();
            this.initModalSet();

        },
        getMenuConfig: function() {
            var self = this;
            var menuConfig = {
                insertBefore: 1,
                dbclicktime: 200,
                dropParent: '#wrapall',
                getData: function(e) {
                    var treescope = this,
                        ops = self.rightOps;
                    var fid = e.target.getAttribute('data-fid');
                    var deferred = $.Deferred(),
                        url = $.urlMap.menulist;
                    $.get(url, {
                        fid: fid,
                        _: new Date().getTime()
                    }, function(data) {
                        var lists = [],
                            val;
                        if (data.errno) return;
                        data = data.result.menulist;
                        for (var i in data) {
                            val = data[i];
                            if (val) {
                                lists.push(ops[i]);
                            }
                        }
                        treescope.lists = lists;
                        deferred.resolve();

                    });

                    return deferred.promise();
                },
                reqOnAdd: function(id, text) {
                    var deffered = $.Deferred(),
                        url;
                    url = $.urlMap.addurl;

                    $.post(url, {
                        dirname: text,
                        source: 'team',
                        parentid: id,
                        sid: 0
                    }, function(data) {
                        var err = 0;
                        if (data.errno) {
                            $.fn.tips(data.errmsg);
                            err = 1;
                        }
                        deffered.resolve(data);
                    });

                    return deffered.promise();

                },
                reqOnRemove: function(id) {
                    var deffered = $.Deferred(),
                        url;
                    url = $.urlMap.tmoveurl;
                    if (/^\d+$/.test(id)) {
                        url = $.urlMap.removeurl;
                    }
                    $.post(url, {
                        fids: id
                    }, function(data) {
                        var err = 0;
                        if (data.errno) {
                            $.fn.tips(data.errmsg);
                            err = 1;
                        }
                        deffered.resolve(err);
                    });

                    return deffered.promise();
                },
                reqOnRename: function(id, text) {
                    var deffered = $.Deferred(),
                        url;
                    url = $.urlMap.tseturl;
                    if (/^\d+$/.test(id)) {
                        url = $.urlMap.renameFile;
                    }
                    $.post(url, {
                        fid: id,
                        name: text,
                        source: 'team'
                    }, function(data) {
                        var err = 0;
                        if (data.errno) {
                            $.fn.tips(data.errmsg);
                            err = 1;
                        }
                        deffered.resolve(err);
                    });

                    return deffered.promise();
                },
                onClick: function(type, $obj) {
                    var fid = $obj.attr('data-fid');
                    self.kfid = fid;
                    var mid = 0;
                    if (type == 'down') {

                        var source = 'team';
                        window.open($.urlMap.downFile + '?fid=' + fid + '&source=' + source + '&sid=' + mid + '&t=' + new Date().getTime());
                        return;
                    } else if (type == 'setrule') {
                        var str = $obj.html();
                        self.modal.setRule.$parent.find('.nav').html('权限设置（' + str + '）');
                        self.modal.setRule.show();

                        //self.showTeams(fid);

                    }

                }

            };
            return menuConfig;
        },

        initTree: function() {

            var self = this,
                url, curl, menuConfig;
            menuConfig = this.getMenuConfig();

            if (this.hasInit) {
                return;
            }
            this.hasInit = 1;
            this.tree = $.BaseTree2.getExample({
                parentId: 'treeteam',
                insertBefore: 1,
                getData: function(id) {
                    var deferred = $.Deferred(),
                        data;
                    data = {
                        source: 'team',
                        vfid: self.fid || 0
                    };

                    data._ = new Date().getTime();
                    $.get($.urlMap.tturl, data, function(data) {
                        if (parseInt(data.errno)) return;

                        deferred.resolve(data.result);

                    });
                    return deferred.promise();

                },
                getCData: function(id) {
                    var deferred = $.Deferred(),
                        data;
                    data = {
                        source: 'team',
                        fid: id
                    };

                    data._ = new Date().getTime();
                    $.get($.urlMap.tturl, data, function(data) {
                        if (parseInt(data.errno)) return;

                        deferred.resolve(data.result);

                    });
                    return deferred.promise();
                },

                alias: function(props) {
                    var alias = {
                        id: 'fid',
                        text: 'dirname',
                        hasChild: 'havechild',
                        child: 'child',
                        allowmenu: 'allowmenu'
                    };
                    return alias[props] || props;
                },

                litpl: self.treespantpl,
                depth: 2,
                open: true,
                callbacks: {
                    onBuildTree: function() {
                        self.setDomAsCurrent();

                    },
                    onClick: function(e) {
                        var fid = e.target.getAttribute('data-fid');
                        var $li = $($.ldom.getParentByTag(e.target, 'li'));
                        if ($li.hasClass('depth1')) {
                            this.closeAll($li);
                        }
                        var data = {};
                        data.fid = fid;
                        self.goTeamPage(data);

                    },
                    onDeleteChild: function(parent) {
                        var tid = parent.fid,
                            child;
                        if (!parent.fid) {
                            child = parent.child || [];
                            child = child[0];
                            tid = child.fid;
                        }
                        self.goTeamPage({
                            fid: tid
                        });
                        self.setDomAsCurrent(tid);
                        $.fn.tips('删除成功', 1);

                    },
                    onFinishInput: function() {
                        self.$el[0].scrollLeft = 0;
                    }
                },

                plugins: [ /*'remote',*/ {
                    type: 'menu2',
                    options: menuConfig
                }]

            });
        }
    });
    return View;
});
