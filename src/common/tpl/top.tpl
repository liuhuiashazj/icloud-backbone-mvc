<!--edit 和detail 共用-->
<%if(route!='newmeet'){%>
<div class="crumbs">
        <span class="back">返回</span><span><%=htitle%></span>&gt;<span><%=data.title%></span>
</div>
<%}%>

<div class="wrapnew">
<!--详情页-->
<%if(!route.match(/detail/)){%>
    <div class="wnew">
        <div class="wtitle">
            <span  class="ltab">会议主题</span>
            <div class="scenter"><input autocomplete="off" value="<%=data.title%>"  type="text" name="title" data-check="need" data-tips="self"/></div>
            <div class="wrappro">产品线：<div class="sright2"><input id="product"
               name="productline" value="<%=data.productline%>" type="text" data-role="product"     /></div></div>
        </div>
        <div class="wtime">
            <span class="ltab">会议时间</span><p class="start">
            <input autocomplete="off"  type="text" id="datemonth" data-time="<%if(date.stime){%><%=date.stime[0]%><%}%>"/><input class="date" autocomplete="off"  type="text" id="datetimer"  data-time="<%if(date.stime){%><%=date.stime[1]%><%}%>"/></p>
            ~<p class="end">
            <input autocomplete="off"  type="text" id="datemonth1" data-time="<%if(date.etime){%><%=date.etime[0]%><%}%>"/><input class="date" autocomplete="off"  type="text" id="datetimer1"  data-time="<%if(date.etime){%><%=date.etime[1]%><%}%>"/></p>
        </div>
        <div class="wadress">
            <span class="ltab">会议地点</span>
            <div class="sright"><input name="address" value="<%=data.address%>"  autocomplete="off"  id="adress1" type="text"  data-role="address"  data-tips="self"  /></div>
        </div>
        <div class="wperson">
            <span class="ltab">负责人</span>
            <div class="sright"><%if(data.owner){%><span class="val" data-id="<%=data.owner.username%>"><%=data.owner.name%></span><%}%><input autocomplete="off"  id="person1"  type="text"  data-role="person" data-tips="parent" data-check="only need"/></div>
        </div>
        <div class="wattend">
            <span class="ltab">参会人</span>
            <div class="sright"><%if(data.attends&&data.attends.length){for(var i=0,l=data.attends.length;i<l;i++){ var d=data.attends[i]%><span class="val" data-id="<%=d.username%>"><%=d.name%></span><%}}%><input autocomplete="off"  id="person2" data-data="filter=all" type="text" data-role="person" data-tips="parent"  data-check="need"/></div>
        </div>
        <div class="wmark">
            <span class="ltab">备注</span>
            <div class="sright"><input name="desc" autocomplete="off"  type="text"  value="<%=data.desc%>"/></div>
        </div>
        <div class="wmore">
            <span class="ltab">更多</span><input autocomplete="off"  class="bluebox" type="checkbox" name="is_todo" id="remind" <%if(data.is_todo=='1'){%>checked<%}%>/>生成Hi待办 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input autocomplete="off"
                class="bluebox" type="checkbox" name="is_email" id="email" <%if(data.is_mail=='1'){%>checked<%}%> />发送会议邮件
        </div>
        <%if(route!='detailp'&&route!='detailm'){%>
        <div class="op3">
            <%if(route=='editmeet'){%>
            <div class="save">保存</div>
            <%}else{%>
            <div class="send">提交会议</div>
            <%}%>

            <div class="cancel">取消</div>
        </div>
        <%}%>

    </div>
<!--编辑页-->
<%}else{%>
    <div class="meetdetails">
        <div class="op3">
            <!--<span class="add" data-url="<%=data.docurl%>"><a href="#" target="_blank" title="">添加会议纪要</a></span>--><%if(data.is_allowedit){%><span class="edit"><a href="#" title="">编辑</a></span><%}%><%if(data.is_allowdel){%><span class="del"><a href="#" title="">删除</a></span><%}%><span
                class="copy"><a href="#" title="">复制</a></span>
        </div>
        <div class="title"><span class="tit"><%=data.title%></span><span class="name"><%=data.productline%></span>
        </div>

        <div class="wnew">
            <div><span  class="ltab">会议时间</span><div><%=data.meeting_stime%>&nbsp;&nbsp;~&nbsp;&nbsp;<%=data.meeting_etime%></div></div>
            <div><span  class="ltab">会议地点</span><div class="l80"><%=data.address%></div></div>
            <div><span class="ltab">负责人</span><div class="l80"><%if(data.owner){%><%=data.owner.name%><%}%></div></div>
            <div><span class="ltab">参会人</span><div class="l80"><%if(data.attends){%><%for(var i=0,l=data.attends.length;i<l;i++){%><%=data.attends[i].name%><%if(i!==l-1){%>、<%}%><%}%><%}%></div></div>
            <div><span class="ltab">备注</span><div class="l80"><%=data.desc%></div></div>
        </div>
    </div>
    <%}%>

</div>
