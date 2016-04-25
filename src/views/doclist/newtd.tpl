<%if(status){%>
    <%if(progressNum){%><span>上传中:<%=progressNum%></span><%}%>
    <%if(successNum){%><span>成功:<%=successNum%></span><%}%>
    <%if(uploadFailNum){%><span class="colfail">失败:<%=uploadFailNum%></span><%}%>
    <%if(interruptNum){%><span class="colfail">终止:<%=interruptNum%></span><%}%>
<%}else{%>
<%for(var i=0,l=docs.length;i<l;i++){var doc=docs[i];%>
    <div class="item" id="<%=doc.id%>">
    <span class="icon t1 <%=doc.ext%>"></span><span class="t2"><%=doc.name%></span><span class="t3">
        <%if(doc.size<1024){%>
            <%=doc.size%>B
        <%}else if(doc.size<1024*1024){%>
            <%=(doc.size/(1024)).toFixed(1)%>K
        <%}else{%>
            <%=(doc.size/(1024*1024)).toFixed(2)%>M
        <%}%>
    </span><span
        class="status t4"></span><span data-status="pending" class="delfile t5">删除</span><span class="progress t7"></span>
    </div>
<%}%>
<%}%>
