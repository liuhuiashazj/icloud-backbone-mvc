<%for(var i =0,l=datas.length;i<l;i++){var data=datas[i]%>
<tr 
class="<%if(data.isrewrite!='1'){%> disable<%}%>" 
data-email="<%=data.email%>" 
data-key="<%=data.key||data.email%>"
data-isqadmin="<%=data.isqadmin%>"  
data-name="<%if(data.rtype=="1"){%><%=data.realname%><%}else if(data.rtype=='3'){%><%=data.name%><%}else{%><%=data.key%><%}%>" 
data-rtype="<%=data.rtype%>" 
data-isrewrite="<%=data.isrewrite%>"  
>
<td class="t1"><span class="t1-index"><%=(start+i)%></span></td>
<td class="t2"><div><%if(data.isqadmin){%><span class="ttip" data-tips="空间管理员"></span><%}%><%if(data.rtype=="1"){%><%=data.realname%><%}else if(data.rtype=="3"){%><%=data.name%><%}else{%><div class="ttip" data-tips="<%=data.email%>"><%=data.email%></div><%}%></div></td>
<td><input class="greybox"  value="isview" type="checkbox" <%if(data.isview){%>checked<%}%> name="" <%if(data.isrewrite!='1'){%> disabled="disabled"<%}%>/></td>

<td><input class="greybox"  value="isupload" type="checkbox" <%if(data.isupload){%>checked<%}%> name="" <%if(data.isrewrite!='1'){%> disabled="disabled"<%}%>/></td>
<td><input class="greybox"  value="isdownload" type="checkbox" <%if(data.isdownload){%>checked<%}%> name="" <%if(data.isrewrite!='1'){%> disabled="disabled"<%}%> /></td>

<%if(showEditLine){%><td><input class="greybox"  value="isedit" type="checkbox" <%if(data.isedit){%>checked<%}%> name="" <%if(data.isrewrite!='1'){%> disabled="disabled"<%}%>/></td><%}%>

<td><input class="greybox"  value="isdel" type="checkbox" <%if(data.isdel){%>checked<%}%> name="" <%if(data.isrewrite!='1'){%> disabled="disabled"<%}%>/></td>

<%if(showAddLine){%><td class="two-col"><input class="greybox"  value="isedit" type="checkbox" <%if(data.isedit){%>checked<%}%> name="" <%if(data.isadd!='1'){%> disabled="disabled"<%}%>/></td><%}%>

<td><input class="greybox"  value="isadmin" type="checkbox" <%if(data.isadmin){%>checked<%}%> name="" <%if(data.isrewrite!='1'){%> disabled="disabled"<%}%>/></td>
<td><span class="delrule ttip"  data-tips="<%if(data.rtype=="1"){%>删除<%}else{%>清除<%}%>" ></span></td>
</tr><%}%>