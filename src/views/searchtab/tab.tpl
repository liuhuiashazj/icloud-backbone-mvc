<div class="top">
        <span class="tit">搜索 <b><%=data.word%></b> 相关<%if(data.tab=='meet'){%>会议<%}else{%>文件<%}%></span>
    </div>
    <div class="optabs">
        <span data-tab="docs" class="<%if(data.tab=='docs'){%>cur<%}%>" >文件</span><span class="<%if(data.tab=='meet'){%>cur<%}%>" data-tab="meet">会议</span>
</div>