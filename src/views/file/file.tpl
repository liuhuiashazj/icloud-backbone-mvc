<div class="crumbs">
    <%if(data.source=='meeting'){%>
    <span class="gomain">会议</span>&gt;<span class="gomeet"><%=data.infor.meet%></span>&gt;<span><%=data.infor.file_name%>.<%=data.infor.file_ext%></span>
    <%}else{%>
    <span class="<%if(data.source=='share'){%>gomeet<%}else{%>gomain<%}%>" data-fid="<%if(data.source=='share'){%>share<%}%>"><%if(data.source=='share'){%>共享<%}else{%>个人<%}%></span><%var tree=data.tree||[];for(var i=0,l=tree.length;i<l;i++){var da=tree[i]%>&gt;<span <%if(i<l-1){%> class="gomeet" data-fid="<%if(data.source=='share'&&i!=0){%>share<%}%><%=da.fid%> <%}%>"><%=da.filename%></span><%}%>
    <%}%>

</div>
<div class="filedetail">

    <div class="op8">

        <%if(data.infor.isdownload){%><span class="down able">下载</span><%}%><%if(data.infor.allow_edit){%><span
            class="edit able" data-url="<%=data.infor.editurl%>">编辑</span><%}%><%if(data.infor.isdelete){%><span
            class="del able">删除</span><%}%>
    </div>
    <div class="title"><div class="fname" data-name="<%=data.infor.file_name%>.<%=data.infor.file_ext%>" data-ext="<%=data.infor.file_ext%>"><%=data.infor.file_name%>.<%=data.infor.file_ext%></div><%if(data.infor.isdelete){%><span class="editname"></span><%}%></div>
    <div class="infos">最后一次编辑于：<%=data.infor.editor%> <%=data.infor.update_time%></div>


    <div class="view">
        <iframe src="/v1/disk/preview?fid=<%=data.infor.f_id%>&width=<%=data.infor.width%>&height=<%=data.infor.height%>" frameborder="0" width="<%=data.infor.width%>" height="<%=data.infor.height%>"></iframe>
    </div>
</div>