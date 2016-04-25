<div id="sug" class="sug">
    <%if(role=="address"){%>
    <ul>
        <%for(var i=0;i<lists.length;i++){var data=lists[i];%>
        <li data-pid="<%=pid%>" data-id="<%=data.content%>" data-name="<%=data.content%>"><%=data.content%></li>
        <%}%>
    </ul>
    <%}else if(role=="person"){%>
    <ul>
        <%for(var i=0;i<lists.length;i++){var data=lists[i];%>
        <li data-pid="<%=pid%>" data-id="<%=data.key%>" data-name="<%=data.truename%>"><%=data.truename%>(<%=data.departmentName%>)<%=data.key%>@baidu.com</li>
        <%}%>
    </ul>
    <%}else if(role=="product"){%>
    <ul>
        <%for(var i=0;i<lists.length;i++){var data=lists[i];%>
        <li data-id="<%=data.id%>" data-name="<%=data.content%>"><%=data.content%></li>
        <%}%>
    </ul>
    <%}%>
</div>