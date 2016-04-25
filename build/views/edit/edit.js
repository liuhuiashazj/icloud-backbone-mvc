define("text!common/tpl/top.tpl",[],function(){return'<!--edit 和detail 共用-->\n<%if(route!=\'newmeet\'){%>\n<div class="crumbs">\n        <span class="back">返回</span><span><%=htitle%></span>&gt;<span><%=data.title%></span>\n</div>\n<%}%>\n\n<div class="wrapnew">\n<!--详情页-->\n<%if(!route.match(/detail/)){%>\n    <div class="wnew">\n        <div class="wtitle">\n            <span  class="ltab">会议主题</span>\n            <div class="scenter"><input autocomplete="off" value="<%=data.title%>"  type="text" name="title" data-check="need" data-tips="self"/></div>\n            <div class="wrappro">产品线：<div class="sright2"><input id="product"\n               name="productline" value="<%=data.productline%>" type="text" data-role="product"     /></div></div>\n        </div>\n        <div class="wtime">\n            <span class="ltab">会议时间</span><p class="start">\n            <input autocomplete="off"  type="text" id="datemonth" data-time="<%if(date.stime){%><%=date.stime[0]%><%}%>"/><input class="date" autocomplete="off"  type="text" id="datetimer"  data-time="<%if(date.stime){%><%=date.stime[1]%><%}%>"/></p>\n            ~<p class="end">\n            <input autocomplete="off"  type="text" id="datemonth1" data-time="<%if(date.etime){%><%=date.etime[0]%><%}%>"/><input class="date" autocomplete="off"  type="text" id="datetimer1"  data-time="<%if(date.etime){%><%=date.etime[1]%><%}%>"/></p>\n        </div>\n        <div class="wadress">\n            <span class="ltab">会议地点</span>\n            <div class="sright"><input name="address" value="<%=data.address%>"  autocomplete="off"  id="adress1" type="text"  data-role="address"  data-tips="self"  /></div>\n        </div>\n        <div class="wperson">\n            <span class="ltab">负责人</span>\n            <div class="sright"><%if(data.owner){%><span class="val" data-id="<%=data.owner.username%>"><%=data.owner.name%></span><%}%><input autocomplete="off"  id="person1"  type="text"  data-role="person" data-tips="parent" data-check="only need"/></div>\n        </div>\n        <div class="wattend">\n            <span class="ltab">参会人</span>\n            <div class="sright"><%if(data.attends&&data.attends.length){for(var i=0,l=data.attends.length;i<l;i++){ var d=data.attends[i]%><span class="val" data-id="<%=d.username%>"><%=d.name%></span><%}}%><input autocomplete="off"  id="person2" data-data="filter=all" type="text" data-role="person" data-tips="parent"  data-check="need"/></div>\n        </div>\n        <div class="wmark">\n            <span class="ltab">备注</span>\n            <div class="sright"><input name="desc" autocomplete="off"  type="text"  value="<%=data.desc%>"/></div>\n        </div>\n        <div class="wmore">\n            <span class="ltab">更多</span><input autocomplete="off"  class="bluebox" type="checkbox" name="is_todo" id="remind" <%if(data.is_todo==\'1\'){%>checked<%}%>/>生成Hi待办 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input autocomplete="off"\n                class="bluebox" type="checkbox" name="is_email" id="email" <%if(data.is_mail==\'1\'){%>checked<%}%> />发送会议邮件\n        </div>\n        <%if(route!=\'detailp\'&&route!=\'detailm\'){%>\n        <div class="op3">\n            <%if(route==\'editmeet\'){%>\n            <div class="save">保存</div>\n            <%}else{%>\n            <div class="send">提交会议</div>\n            <%}%>\n\n            <div class="cancel">取消</div>\n        </div>\n        <%}%>\n\n    </div>\n<!--编辑页-->\n<%}else{%>\n    <div class="meetdetails">\n        <div class="op3">\n            <!--<span class="add" data-url="<%=data.docurl%>"><a href="#" target="_blank" title="">添加会议纪要</a></span>--><%if(data.is_allowedit){%><span class="edit"><a href="#" title="">编辑</a></span><%}%><%if(data.is_allowdel){%><span class="del"><a href="#" title="">删除</a></span><%}%><span\n                class="copy"><a href="#" title="">复制</a></span>\n        </div>\n        <div class="title"><span class="tit"><%=data.title%></span><span class="name"><%=data.productline%></span>\n        </div>\n\n        <div class="wnew">\n            <div><span  class="ltab">会议时间</span><div><%=data.meeting_stime%>&nbsp;&nbsp;~&nbsp;&nbsp;<%=data.meeting_etime%></div></div>\n            <div><span  class="ltab">会议地点</span><div class="l80"><%=data.address%></div></div>\n            <div><span class="ltab">负责人</span><div class="l80"><%if(data.owner){%><%=data.owner.name%><%}%></div></div>\n            <div><span class="ltab">参会人</span><div class="l80"><%if(data.attends){%><%for(var i=0,l=data.attends.length;i<l;i++){%><%=data.attends[i].name%><%if(i!==l-1){%>、<%}%><%}%><%}%></div></div>\n            <div><span class="ltab">备注</span><div class="l80"><%=data.desc%></div></div>\n        </div>\n    </div>\n    <%}%>\n\n</div>\n'}),define("text!views/edit/edit.css",[],function(){return"#newtop{position:relative;}#adress1{width:100%;}"}),define("text!views/edit/suggest.tpl",[],function(){return'<div id="sug" class="sug">\n    <%if(role=="address"){%>\n    <ul>\n        <%for(var i=0;i<lists.length;i++){var data=lists[i];%>\n        <li data-pid="<%=pid%>" data-id="<%=data.content%>" data-name="<%=data.content%>"><%=data.content%></li>\n        <%}%>\n    </ul>\n    <%}else if(role=="person"){%>\n    <ul>\n        <%for(var i=0;i<lists.length;i++){var data=lists[i];%>\n        <li data-pid="<%=pid%>" data-id="<%=data.key%>" data-name="<%=data.truename%>"><%=data.truename%>(<%=data.departmentName%>)<%=data.key%>@baidu.com</li>\n        <%}%>\n    </ul>\n    <%}else if(role=="product"){%>\n    <ul>\n        <%for(var i=0;i<lists.length;i++){var data=lists[i];%>\n        <li data-id="<%=data.id%>" data-name="<%=data.content%>"><%=data.content%></li>\n        <%}%>\n    </ul>\n    <%}%>\n</div>'}),define("views/edit/edit",["text!common/tpl/top.tpl","text!views/edit/edit.css","text!views/edit/suggest.tpl","common/js/jquery.datetimepicker"],function(e,t,n){var r=Backbone.BaseView.extend({el:"#editmeet",cssText:t,template:_.template(e),tplsug:_.template(n),events:$.extend({"focus .wnew input":"focusInput","blur .wnew input":"blurInput","click .sright span":"delSpan","click .sright":"focusInput","click .send":"submitForm","click .save":"submitForm"},Backbone.BaseView.baseEvents),modal:{},drop:{},init:function(){var e=this;window.onbeforeunload=function(){e.isSave&&window.opener.onCloseNewMeet(e.options.mid)},this.date=$.fn.getCurDate()},display:function(e){var t=this;this.options=e,e.data={},e.date=this.date,this.insertData(function(){t.initDrop(),t.setDateTime()})},insertData:function(e){var t=this,n={},r=this.options;r.mid&&(n.mid=r.mid);if(r.route=="editmeet"&&r.copy==1||r.route=="newmeet")n.act="incr";$.ajax({cache:!1,url:$.urlMap.meetDetail,data:n,type:"GET",dataType:"json",success:function(n){n=n.result,t.options.mid=n.mid,Backbone.Events.trigger("updateData",{mid:n.mid}),n.meeting_stime&&(t.date.stime=n.meeting_stime.split(" "),t.date.etime=n.meeting_etime.split(" ")),t.options.data=n,t.options.htitle=t.options.copy==1?"会议复制":"编辑会议",t.$el.html(t.template(r)),Backbone.Events.trigger("insertDoclist",r),e&&e.call(t)}})},destory:function(){this.$el.html("")},initDrop:function(){var e=this,t=this.$el.attr("id");this.drop.sug=new $.fn.Dropdown({parent:"#"+t,id:"dropdown2",el:".wnew input[data-role]",type:2,leftOffset:0,topOffset:0,defaultSelect:1,css:{minWidth:202},tpl:n,getListCallback:function(e){var t=this.$obj,n=t.attr("data-role"),r=t.attr("id");this.options.role=n,this.options.pid=r,n=="person"?this.options.lists=e.result:n=="address"?this.options.lists=e.result.rows||[]:n=="product"&&(this.options.lists=e.result.rows||[])},selectCallback:function(t){if(this.options.role!="product"&&this.options.role!="address"){e.buildSug(t);return}var n=t.attr("data-name");this.$obj.val(n)},delCallback:function(e){var t=e.parent();t.find("span").last().remove()},enterCallback:function(t,n){if(!n.length&&t.val()){var r=t.val().split("@")[0],i=t.attr("id");n=$("<li></li>").attr({"data-id":r,"data-name":r,"data-pid":i}).html(r)}if(!n.length)return;if(this.options.role!="product"&&this.options.role!="address"){e.buildSug(n);return}var s=n.attr("data-name");s&&t.val(s);return}})},focusInput:function(e){var t=$(e.currentTarget);t.hasClass("sright")?t.find("input").focus():t=t.parent(),t.removeClass("errno").addClass("focus")},blurInput:function(e){var t=$(e.currentTarget),n=this,r=t.parent(),i=t.attr("data-tips");r.removeClass("focus"),clearTimeout(this.checking),this.checking=setTimeout(function(){n.checkInput(t)},200)},checkInput:function(e){var t=e.attr("data-check");if(!t||this.isGoBack)return!0;var n=e.parent();if(!n)return!1;var r=e.attr("data-tips");return t.match(/need/)&&r=="self"&&!e.val()?($.fn.tips("该项不能为空！"),n.addClass("errno"),!1):t.match(/need/)&&r=="parent"&&n.find("span").length<1?($.fn.tips("该项不能为空！"),n.addClass("errno"),!1):t.match(/only/)&&r=="parent"&&n.find("span").length>1?($.fn.tips("仅允许输入一项！"),n.addClass("errno"),!1):!0},submitForm:function(){var e=this,t=this.checkDate(),n=this.checkall();n=n&&t;if(!n)return;var r=this.getFormData();r.mid=this.options.mid;var i=$.urlMap.submitMeet;this.options.route=="editmeet"&&this.options.copy!=1&&(i=$.urlMap.updateMeet,delete r.files),$.ajax({cache:!1,url:i,type:"POST",dataType:"json",data:r,success:function(t){if(t.errno){$.fn.tips(t.errmsg);return}$.fn.tips("保存成功！",1);if(e.options.route=="newmeet")e.isSave=!0,setTimeout(function(){window.close()},1e3);else{var n={route:"detailm",detail:"all",page:e.options.mid};window.updateItem=!0,e.goDetailPage(n)}}})},checkDate:function(){var e=[],t=[];this.$el.find(".wtime input").each(function(n,r){var i=$(r).attr("data-time");n<=1?e.push(i):t.push(i)});var n=e.join(" ").replace(/-/g,"/"),r=t.join(" ").replace(/-/g,"/"),i=new Date(n),s=new Date(r);return i>=s?($.fn.tips("结束时间要大于开始时间!"),this.$el.find(".wtime input").addClass("errno"),!1):(this.$el.find(".wtime input").removeClass("errno"),!0)},checkall:function(){var e=this,t=this.$el.find("input"),n=!0;for(var r=0,i=t.length;r<i;r++){var s=$(t[r]),o=e.checkInput(s);n=n&&o;if(!o)break}return n},getFormData:function(){var e=this.$el.find("input"),t={};e.each(function(e,n){var r=$(n).attr("name"),i=$(n).val();r&&($(n).attr("type")=="checkbox"&&(i=n.checked?1:0),t[r]=i)}),t.owner=this.$el.find(".wperson .val").attr("data-id");var n=this.$el.find(".wattend .val"),r=[];n.each(function(e,t){r.push($(t).attr("data-id"))}),t.attends=r.join(",");var i=[],s=[];return this.$el.find(".wtime input").each(function(e,t){var n=$(t).attr("data-time");e<=1?i.push(n):s.push(n)}),t.meeting_stime=i.join(" "),t.meeting_etime=s.join(" "),t},buildSug:function(e){var t=e.attr("data-id"),n=e.attr("data-name"),r=e.attr("data-pid"),i=$('<span class="val" />').attr("data-id",t).html(n),s=$("#"+r).parent().find('span[data-id="'+t+'"]').length;return $("#"+r).val("").focus(),s?($.fn.tips("已经添加了"),!1):(i.insertBefore("#"+r),!0)},delSpan:function(e){var t=$(e.currentTarget);t.remove()},setDateTime:function(){var e=this,t=$("#datemonth"),n=$("#datetimer"),r=$("#datemonth1"),i=$("#datetimer1"),s={dayOfWeekStart:1,lang:"zh",format:"Y-m-d",maxDate:e.date.maxDate,formatDate:"Y-m-d",step:5,timepicker:!1,yearStart:2015,yearEnd:2020,style:"color:red",validateOnBlur:!0},o={lang:"zh",datepicker:!1,format:"H:i",step:30};t.datetimepicker($.extend({value:e.date.stime[0],onChangeDateTime:function(e){var n=e.dateFormat("Y-m-d");t.attr("data-time",n),r.val(n).attr("data-time",n)}},s)),n.datetimepicker($.extend({value:e.date.stime[1],onChangeDateTime:function(e){var t=e.dateFormat("H:i"),r=$.addTimeHours(e,1).dateFormat("H:i");n.attr("data-time",t),i.val(r).attr("data-time",r)}},o)),r.datetimepicker($.extend({value:e.date.etime[0],onChangeDateTime:function(e){var t=e.dateFormat("Y-m-d");r.attr("data-time",t)}},s)),i.datetimepicker($.extend({value:e.date.etime[1],onChangeDateTime:function(e){var t=e.dateFormat("H:i");i.attr("data-time",t)}},o))}});return r});