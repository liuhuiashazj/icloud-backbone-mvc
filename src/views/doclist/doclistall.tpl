
<div class="wtablist ">
    <%if(route=='ibox'||route=='team'){%>

    <div class="op8"></div>
    <%}%>
    <div class="wrapop1">
        <div class="op1">
            <%if(route!='newmeet'&&route!='search'){%>
            <%if(route=='editmeet'&&copy=='1'){%>
                <span
                class="tit">会议文档</span><span
                class="upload" id="fileupload">上传</span><span
                class="del">删除</span>
            <%}else{%>
            <%if(route!='ibox'&&route!='team'){%><span
                class="tit">会议文档</span><%}%><span
                class="newdir able">新建文件夹</span><span
                class="upload" id="fileupload">上传</span><span
                class="down">下载</span><span
                class="rename">重命名</span><span
                class="del">删除</span><%if(route!='ibox'&&route!='team'){%><span
                class="addsum able">创建会议纪要</span><%}%>
            <%}}else if(route=='search'){%>
            <span
                class="down">下载</span><span
                class="rename">重命名</span><span
                class="del">删除</span>
            <%}else{%>
            <span
                class="tit">会议文档</span><span
                class="upload" id="fileupload">上传</span><span
                class="del">删除</span>
            <%}%>
        </div>
    </div>
        <%if(route=='newmeet'){%>
        <div class="uptips">每次最多10个文件，单个文件最大100m</div>
        <%}%>

        <div class="op7">

        </div>
        <div class="wrapdoclist">

            <div class="doclistinner">

            </div>

            <div  id="pastewrap<%if(route=='team'||route=='ibox'){%><%=route%><%}%>" >松开鼠标开始上传</div>

        </div>
</div>