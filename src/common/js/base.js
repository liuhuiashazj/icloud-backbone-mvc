/**
 * Created by liuhui on 15/8/21.
 */
/**
 * Created by liuhui on 15/4/26.
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    $.allConfig = {
        mapMeeting: {
            'all': '全部会议',
            'creator': '我发起的会议',
            'owner': '我负责的会议',
            'attend': '我参加的会议'
        }
    };
    $.urlMap = {
        personlize: '/v1/common/clientinfor',
        cancelMeet: '/v1/meeting/cancel',
        meetList: '/v1/meeting/list',

        productList: '/v1/meeting/productlist',
        searchFile: '/v1/common/searchfile',
        searchMeet: '/v1/common/searchmeeting',
        searchRoom: '/v1/common/searchmeetingroom',

        renameFile: '/v1/disk/updateinfor',
        downFile: '/v1/disk/downloadfile',
        downFiles: '/v1/disk/downloadsfile',
        delFile: '/v1/disk/deletefile',
        upFile: '/v1/disk/uploadfile',
        createDir: '/v1/disk/createdir',
        getFileRule: '/v1/disk/getfilerule',
        preview: '/v1/disk/preview',
        fileInfo: '/v1/disk/getfileinfor',

        meetDetail: '/v1/meeting/detail',
        meetDocs: '/v1/meeting/doclist',
        updateMeet: '/v1/meeting/update',
        submitMeet: '/v1/meeting/submit',

        stopShare: '/v1/disk/stoprule',
        setRule: '/v1/disk/addrule',

        userInfo: '/v1/common/getuserinfor',
        logout: '/v1/disk/logout',

        product: "/v1/common/searchproductline",
        address: "/v1/common/searchmeetingroom",
        person: "/v1/common/searchuser",
        meetInfo: "/v1/meeting/getownerinfor",

        /*ibox*/
        setIboxRule: '/v1/disk/addshare',
        iboxStopShare: '/v1/disk/stopshare',
        shareDoc: "/v1/common/forward",
        iboxList: '/v1/disk/filelist',
        userList: '/v1/disk/getsharefile',
        shareList: '/v1/disk/getfileshare',
        searchUser: '/v1/common/searchuser',
        hiGroup: '/v1/common/myhigroup',
        sendMsg: '/v1/meeting/sendmsg',
        iboxfileInfo: '/v1/disk/getfileinfor',
        searchTree: '/v1/common/searchhigroup',

        /*treeurl*/
        turl: '/v1/disk/dirlists',
        curl: '/v1/disk/dirlists',
        addurl: '/v1/disk/createdir',
        moveurl: '/v1/disk/movefile',
        removeurl: '/v1/disk/deletefile',
        seturl: '/v1/disk/updateinfor',

        /*team*/
        addqzone: '/v1/team/addqzone',

        tturl: '/v1/team/dirlists',
        tmoveurl: '/v1/team/delqzone',

        tseturl: '/v1/team/updateqzone',

        menulist: '/v1/team/menulist',
        tfilelist: '/v1/team/filelist',

        teamrules: '/v1/team/getfilerule',
        setteamrule: '/v1/team/addrule',
        stopteamrule: '/v1/team/stoprule',
        ownerinfor: '/v1/team/ownerinfor'

    };

    $.addTimeHours = function (date, hours) {
        var m = hours * 60 * 60 * 1000;
        var mbefore = date.getTime();
        var mafter = mbefore + m;
        var n = new Date();
        n.setTime(mafter);
        return n;
    };
    $.urlToJson = function (url) {
        var newData = {};
        var keys = url.split('&');
        $.each(keys, function (index, key) {
            key = key.split('=');
            newData[key[0]] = key[1] || '';
        });
        return newData;
    };

    $.extend($.fn, {
        emptyFn: function () {
        },

        poptips: function (configs) {

            var newObj, left = configs.left, width = configs.width, top = configs.top, selector = configs.selector, parent = configs.parent || 'body', $parent = $(parent), cls = configs.cls;

            function showTips(x, y, w, str) {

                newObj = $('.poptips');
                if (!newObj.length) {
                    newObj = $('<div />');
                }
                if (cls) {
                    newObj.removeClass().addClass('poptips ' + cls);
                } else {
                    newObj.removeClass().addClass('poptips');
                }
                newObj.html(str).appendTo(parent).stop();
                w = configs.useClickCoord ? -(newObj.width() - w) / 2 : 0;
                newObj.css({
                    position: 'absolute',
                    left: x,
                    top: y,
                    marginLeft: w,
                    width: width

                }).show()
            }

            function hideTips() {
                newObj && newObj.hide();
            }

            $(parent).on('mouseover', selector, function (e) {
                var obj = e.currentTarget, offset = $(obj).offset(), oWidth, x, y, str, offsetParent = $(parent).offset(), w;
                str = obj.getAttribute('data-tips');
                if (!str) return;
                if (str == 'S') {/*表示使用该元素的值*/
                    str = obj.innerHTML;
                }
                w = $(obj).width();
                x = offset.left - offsetParent.left;
                y = offset.top - offsetParent.top + $parent[0].scrollTop + obj.clientHeight;
                if (configs.useClickCoord) {
                    x = offset.left - offsetParent.left + e.offsetX;
                    y = offset.top - offsetParent.top + $parent[0].scrollTop + obj.clientHeight;
                }
                $(obj).on('click', function () {/*fixed the bug when deleted,the mouseout event cant be triggered*/
                    hideTips();
                });
                x = typeof left != "undefined" ? (x + left) : (x);
                y = typeof top != "undefined" ? (y + top) : (y);

                showTips(x, y, w, str);
            }).on('mouseout', selector, function (e) {
                hideTips();
            });

            return;

        },
        tips: function (str, type, persist, cls) {
            cls = cls || 'tipsall';
            var $obj = $('.' + cls);
            if (!$obj.length) $obj = $('<div class="' + cls + '"/>');
            if (type) {
                $obj.addClass('blue');
            } else {
                $obj.removeClass('blue');
            }
            $obj.html(str).appendTo('body').fadeIn(1000);
            if (persist) return;
            if (window.intFade) clearTimeout(window.intFade);
            window.intFade = setTimeout(function () {
                $obj.fadeOut(500);
            }, 1500);

        },
        scrollLoadMore: function (options) {
            var el = options.el;
            var $el = $(el);
            /*$(el).on('scroll', function (e) {
             window.lastScrollTop = e.target.scrollTop;
             if (e.target.scrollHeight <= e.target.scrollTop + e.target.offsetHeight) {
             clearTimeout(window.loadMoreTime);
             window.loadMoreTime = setTimeout(function () {
             Backbone.Events.trigger('loadMore');

             }, 200);

             }
             });*/
            $el.on('scroll', function (e, delta, deltaX, deltaY) {
                //console.log(event, delta, deltaX, deltaY);
                //$el.attr('data-lastTop', $el[0].scrollTop);
                if (($el[0].scrollHeight - 5) <= $el[0].scrollTop + $el[0].offsetHeight) {
                    clearTimeout(window.loadMoreTime);
                    window.loadMoreTime = setTimeout(function () {
                        Backbone.Events.trigger('loadMore');

                    }, 200);

                }
            });
        },

        getCurDate: function () {/*获取基于某个时间点的整点时间,以及1个小时后的时间*/
            /*时间初始化*/
            var date = {};
            /*t2为取整时间*/
            var t1 = new Date(), tstart = new Date();

            var i = t1.getMinutes();
            tstart.setMinutes(0);
            var addH = i < 30 ? 0.5 : 1;
            tstart = $.addTimeHours(tstart, addH);
            var tend = $.addTimeHours(tstart, 1);
            var tmonth = $.addTimeHours(tstart, 240);

            date.minDate = tstart.dateFormat('Y-m-d');
            date.maxDate = tmonth.dateFormat('Y-m-d');

            date.stime = [tstart.dateFormat('Y-m-d'),
                tstart.dateFormat('H:i')
            ];
            date.etime = [tend.dateFormat('Y-m-d'),
                tend.dateFormat('H:i')
            ];
            date.str = t1.dateFormat('Y-m-d H:i:s');
            /*弹层初始化*/
            return date;
        }
    });
    $.fn.overflowTips = function () {

                }

});
