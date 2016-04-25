
<%if(data.showWrap&&data.data.length){%>
    <%if(data.meeting){%>
    <div class="fixtop">
        <div class="nav"><!--<%=data.meeting%>-->会议状态
            <ul class="status">
                <li <%if(data.classify=='')
{%>class="on"<%}%> ><input type="radio" name="status" <%if(data.classify=='')
{%>checked="true"<%}%> data-classify=""/>全部</li>
                <li <%if(data.classify=='unfinish')
{%>class="on"<%}%> ><input type="radio" name="status" <%if(data.classify=='unfinish')
{%>checked="true"<%}%> data-classify="unfinish"/>未完成 </li>
                <li <%if(data.classify=='finished')
{%>class="on"<%}%> ><input type="radio" name="status" <%if(data.classify=='finished')
{%>checked="true"<%}%> data-classify="finished"/>已完成</li>
            </ul>
        </div>
        <div class="page"></div>
    </div>
    <%}%>
<div id="listwrap">
    <table class="meet items" border="0" cellpadding="0" cellspacing="0">
    <tr class="htr">
        <th class="t1">会议 <span class="total"><%if(data.totalPn){%>(<%=data.totalPn%>)<%}%></span></th>

        <th class="t3"><span class="sort"><%if(data.sort&&data.sort=='stime'){%>会议开始时间<%}else{%>会议创建时间<%}%><span class="by <%=data.by%>" data-by="<%=data.by%>"></span></span></th>
        <th class="t2">负责人</th>
        <th class="t4">地点</th>
        <th class="t5">会议文档</th>
        <th class="t6"></th>
    </tr>
<%}%>
<%for(var i=0,l=data.data.length;i<l;i++){ var da=data.data[i];%>
    <tr class="detail <%if(i%2!=0){%>odd<%}%>" data-mid="<%=da.mid%>">
        <td class="t1"><%=da.title%></td>

        <td><%if(data.sort&&data.sort=='stime'){%><%=da.meeting_stime%><%}else{%><%=da.ctime%><%}%></td>
        <td><%=da.owner.name%></td>
        <td><%=da.address%></td>
        <td><%=da.files%></td>
        <td><%if(da.is_admin=='1'){%><span class="del delmeet"></span><%}%></td>

    </tr>
<%}%>

<%if(data.showWrap&&data.data.length){%>
    </table>
<%}%>
<%if(!data.data.length&&data.pn==1&&!data.hideNo){%>
    <div class="<%if(data.isSearch){%>wrap-no<%}%>"><div class="nolist <%if(data.isSearch){%>nolist4<%}%>"></div></div>
<%}%>
<%if(data.hasMore&&data.showWrap){%><div class="loading" ></div><%}%>
<%if(data.showWrap){%>
</div>
<%}%>