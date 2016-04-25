<div class="wraprule <%if(showEditLine&&showAddLine){%>col-1<%}else if(showAddLine){%>col-2 <%}else if(showEditLine){%>col-3<%}%>">
    <div class="nav">权限设置<%=name%></div>
    <div class="tips-relation"> <div>"查看"为最小权限,被包含于其他所有权限中<br />"管理"为最大权限,包含其他所有权限</div></div>
    <div class="close close4"></div>
    <div class="content">
        <div class="left">
            <ul class="switch">
                <li class="cur first" data-for="rpart"><span>部门</span></li>
                <li data-for="ruser"><span>用户</span></li>
                <li data-for="rmail"><span>邮件组</span></li>
            </ul>
        </div>
        <div class="right">
            <div class="rpart">
                <div class="top"><span>部门</span><input 
                type="text" 
                class="search spart"/><span 
                class="bbutton" id="startSearch">搜索</span>
                </div>
                <div class="wrapitems2">
                    <div class="wraphead">
                        <span>序号</span><span>部门</span><span>查看</span><span>上传</span><span>下载</span><%if(showEditLine){%><span>编辑</span><%}%><span>删除</span><%if(showAddLine){%><span class="two-col">添加目录</span><%}%><span>管理</span><span>操作</span>
                    </div>
                    <div class="wraptable">
                        <table class="items2">
                        </table>
                    </div>

                </div>

            </div>
            <div class="ruser">
                <div class="top"><span>用户</span><input type="text" class="search  suser" /><span 
                class="bbutton" id="auser">添加</span><span class="addall">添加所有人</span>
                </div>
                <div class="wrapitems2">
                    <div class="wraphead">
                        <span class="t1">序号</span><span class="t2">用户名</span><span class="t3">查看</span><span class="t3">上传</span><span class="t3">下载</span><%if(showEditLine){%><span>编辑</span><%}%><span>删除</span><%if(showAddLine){%><span class="two-col">添加目录</span><%}%><span class="t3">管理</span><span class="t3">操作</span>
                    </div>
                    <div class="wraptable">
                        <table class="items2">
                        </table>
                    </div>

                </div>


            </div>
            <div class="rmail">
                <div class="top"><span>用户</span><input type="text" class="search  suser" /><span 
                class="bbutton" id="auser">添加</span>
                </div>
                <div class="wrapitems2">
                    <div class="wraphead">
                        <span class="t1">序号</span><span class="t2">邮件组</span><span class="t3">查看</span><span class="t3">上传</span><span class="t3">下载</span><%if(showEditLine){%><span>编辑</span><%}%><span class="t3">删除</span><%if(showAddLine){%><span class="two-col">添加目录</span><%}%><span class="t3">管理</span><span class="t3">操作</span>
                    </div>
                    <div class="wraptable">
                        <table class="items2">
                        </table>
                    </div>

                </div>


            </div>


        </div>
    </div>
    <div class="bottom">
        <input type="checkbox" class="inherit greybox"/><span class="grey">继承父级权限</span><span class="tips">您更改的权限将丢失,恢复到与父目录一致</span>
    </div>
    <span class="bbutton" id="ok5">确认</span>
</div>
