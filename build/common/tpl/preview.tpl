<table border="0" cellpadding="0" cellspacing="0">
    <tr data-fid="<%=fid%>" data-mid="<%=mid%>" data-url="<%=editurl%>">
        <td>
            <div class="fname"><%=name%></div>
            <%if(down){%>
            <div class="wrapop0">
                <div class="op0">
                    <%if(down){%><span class="down ">下载</span><%}%>
                    <%if(edit){%><span class="edit">编辑</span><%}%>
                    <%if(del){%><span class="del">删除</span><%}%>

                </div>
                <%if(edit||del){%><div class="ophead"></div><%}%>
            </div>
            <%}%>
            <div class="close close4"></div>

        </td>
    </tr>
</table>

