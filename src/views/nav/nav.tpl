<div class="headnav">会议云</div>
<ul class="tabnav">
<li data-route="meeting" <%if(route!='product'&&route!='detailp'){%>class="cur"<%}%>>个人视图</li>
<li data-route="product" <%if(route=='product'||route=='detailp'){%>class="cur"<%}%>>产品视图</li>
</ul>

<div class="addnew addnewmeet">新建会议</div>
<%if(route=='product'||route=='detailp'){%>
<ul class="listnav">
    <%for(var i=0,l=data.length;i<l;i++){var pro=data[i].productline||'all';%>
    <li class="<%if(role==pro||(route=='product'&&product==pro)){%>cur<%}%>" data-product="<%=pro%>"><%=pro=='all'?'未知产品':pro%></li>
    <%}%>
</ul>
<%}else{%>
<ul class="listnav">
    <li class="all <%if(role=='all'){%>cur<%}%>" data-role="all">全部会议</li>
    <li class="creator <%if(role=='creator'){%>cur<%}%>" data-role="creator">我发起的会议</li>
    <li class="owner <%if(role=='owner'){%>cur<%}%>" data-role="owner">我负责的会议</li>
    <li class="attend <%if(role=='attend'){%>cur<%}%>" data-role="attend">我参加的会议</li>
</ul>
<%}%>