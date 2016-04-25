
<!--文件列表-->
<%if(data.showWrap&&data.docs.length){%>

    <table border="0" cellpadding="0" cellspacing="0" class="items detailtab" >
    <tr class="htr">
        <th class="t1 <%if(data.useSort&&(data.sort.sort=='fname'||!data.sort.sort)){%>cur<%}%>"><input type="checkbox" class="selectall bluebox"/><%if(data.route=='team'){%><span class="sort">文件<span 
        class="by <%if(data.useSort&&(data.sort.sort=='fname'||!data.sort.sort)){%><%=data.sort.by||"desc"%><%}%>"
        data-sort="fname"></span></span><%}else{%>文件<%}%></th>
        <th class="t2"></th>
        <th class="t3"></th>
        <%if(data.route=='search'){%><th class="t6 categoryh">来源</th><%}%>
        <th class="t4 <%if(data.useSort&&data.sort.sort=='ftime'){%>cur<%}%>"><%if(data.route=='team'){%><span class="sort">更新时间<span 
        class="by <%if(data.useSort&&data.sort.sort=='ftime'||!data.sort.sort){%><%=data.sort.by||"desc"%><%}%>"
        data-sort="ftime"></span></span><%}else{%>更新时间<%}%></th>
        <%if(data.fromShare&&data.route=='ibox'){%><th class="t6">上传者</th><%}%>
        <th class="t5 <%if(data.useSort&&data.sort.sort=='fsize'){%>cur<%}%>"><%if(data.route=='team'){%><span class="sort">大小<span 
        class="by <%if(data.sort.sort=='fsize'||!data.sort.sort){%><%=data.sort.by||"desc"%><%}%>"
        data-sort="fsize"></span></span><%}else{%>大小<%}%></th>
        <%if(!(data.route=='ibox')){%><th class="t6"><%if(data.route=='team'){%>创建者<%}else{%>上传者<%}%></th><%}%>
        <%if(!data.isSearch&&data.route!='newmeet'&&!data.fromShare&&data.route!='team'){%><th class="t7">共享权限</th><%}%>
    </tr>
<%}%>
<%for(var i=0,l=data.docs.length;i<l;i++){ var doc=data.docs[i];%>
    <tr
            class="doc <%if(doc.islock==1){%>folder-locked<%}%>"
            data-fid="<%=doc.fid%>"
            id="f<%=doc.fid%>"
            data-mid="<%=doc.mid%>"
            data-url="<%=doc.editurl%>"
            data-create="<%=doc.isCreate%>"
            data-editing="<%=doc.isEditing%>"
            <%if(doc.allow_download=="1"){%>data-down='1'<%}%>
            <%if(doc.allow_edit=="1"){%>data-edit='1'<%}%>
            <%if(doc.allow_delete=="1"){%>data-del='1'<%}%>
            <%if(doc.isdir=='1'){%>data-isdir='1'<%}%>
            data-ext="<%=doc.fileext%>"
            data-name="<%=doc.filename%>"
            data-isSearch="<%=data.isSearch%>"
            data-from="<%=doc.from%>"
    >
        <td ><input class="bluebox selectone" type="checkbox"/><span class="icon <%=doc.fileext%> <%if(doc.isdir==1){%>dir<%}%>"></span></td>
        <td class="t2"><div <%if(data.route=='ibox'&&doc.isdir!=1&&!data.fromShare){%>draggable="true" <%}%>class="<%if(data.route!='newmeet'){%>fname<%}%>" > <%if(doc.isCreate!='1'){%><%=doc.filename%><%}else{%><input type="text" value="<%=doc.filename%>"/><%}%><%if(doc.useCancel){%><span class="crename"></span><%}%></div></td>
        <td>
            <div class="op2" >
            <%if(doc.allow_download=="1"&&data.route!='newmeet'){%><span class="down" data-tips="下载"></span><%}%>
            <%if(doc.allow_edit=="1"&&data.route!='newmeet'&&doc.isdir!='1'){%><span class="edit" data-tips="编辑"></span><%}%>
            <%if(doc.allow_delete=="1"&&data.route!='newmeet'){%><span class="rename" data-tips="重命名"></span><%}%>
            <%if(doc.allow_delete=="1"){%><span class="del" data-tips="删除"></span><%}%>
            <%if((data.route=='ibox'||data.route=='team')&&doc.isdir!='1'){%><span class="share" data-tips="转发到hi"></span><%}%>
             <%if(data.route=='ibox'&&!data.fromShare){%><span class="authoring" data-tips="共享"></span><%}%>
            </div>
        </td>
<%if(data.route=='search'){%><td class="category"            data-from="<%=doc.from%>"
 data-mid="<%=doc.mid%>"
 data-name="<%=doc.username%>"
 data-pid="<%var tree=doc.tree||[];var par=tree.pop()||{};%><%=par.fid%>"
>
    <%if(doc.from=='1'){%><a href="#">会议</a>
    <%}else{%><a href="#"><%if(doc.from=='2'){%>自己<%}else{%>共享<%}%></a><%}%>
        </td><%}%>
        <td><div class="ctime"><%=doc.ctime%></div></td>
        <%if(data.fromShare&&data.route=='ibox'){%><td ><%=doc.realname%></td><%}%>
        <td><%if(doc.isdir!='1'){%>
        <%if(doc.size<1024){%>
            <%=doc.size%>B
        <%}else if(doc.size<1024*1024){%>
            <%=(doc.size/(1024)).toFixed(1)%>K
        <%}else{%>
            <%=(doc.size/(1024*1024)).toFixed(2)%>M
        <%}%>
        <%}else{%>--<%}%></td>
        <%if(!(data.route=='ibox')){%><td class="t6"><%if(data.route=='team'){%><%=doc.realname%><%}else{%><%if(doc.isdir!='1'){%><%=doc.realname%><%}else{%>--<%}%><%}%></td><%}%>
        <%if(!data.isSearch&&data.route!='newmeet'&&!data.fromShare&&data.route!='team'){%>
        <td class="t7">
            <%if(doc.allow_delete=="1"){%>
                <span class="<%if(data.route=='ibox'&&doc.access_type!=1){%>
                <%}else{%>
                    author
                <%}%>">
                <%if(doc.access_type==1){%>
                    已共享
                <%}else{%>
                    未共享
                <%}%>
                </span>
                <%}else{if(doc.access_type==1){%>
                    已共享
                <%}else{%>
                    未共享
            <%}}%>
        </td>
        <%}%>
    </tr>
<%}%>
<%if(data.showWrap&&data.docs.length){%>
    </table>

<%}%>
<%if(data.docs.length==0){%>
    <div class="<%if(data.isSearch){%>wrap-no<%}%> <%if(data.route=='ibox'){%>wrap-no10<%}%>"><div class="nolist2 <%if(data.isSearch){%>nolist3<%}%> <%if(data.route=='ibox'){%>nolist10<%}%>"></div></div>
<%}%>
<%if(data.showLoad&&data.has_more){%>
    <div class="loading" ></div>
<%}%>



