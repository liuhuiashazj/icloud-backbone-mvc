
<%for(var i=0,l=result.length;i<l;i++){ var per=result[i];var au=per.chmod.split('')%>
<tr data-mail="<%=per.email%>" data-rtype="<%=per.rtype%>" data-chmod="<%=per.chmod%>">
<td class="t1"><span><%=per.realname||per.name%><%if(per.depart){%>(<%=per.depart%>)<%}%></span></br><span><%=per.email%></span></td>
<td class="t2 <%if(!per.isadmin){%>wrapop5<%}%>"><%if(!per.isadmin){%><span class="op5" > <%if(au[0]==1){%>查看<%}%><%if(au[1]==1){%>&nbsp;下载<%}%><%if(au[2]==1){%>&nbsp;编辑<%}%><%if(per.chmod=='000'){%>不可见<%}%></span><%}else{%>管理<%}%></td>
</tr>
<%}%>
