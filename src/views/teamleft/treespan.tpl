<span class="jstree-whole"></span>
<div class="jstree-witem <%if(this.islock){%>locked<%}%>" >
 <i class="jstree-icon <%if(this.type=="2"&&this.fid=="-1"){%>share<%}else if(this.type=="2"){%>person<%}else{%>file<%}%>"></i>
<div class="jstree-wname" >
 <%if(!this.isInput){%>
 <span class="jstree-anchor" data-menu="<%this.allowmenu?1:0%>"  <%if(!(this.text.length < 15)){%>data-tips="S" <%}%> data-fid="<%this.fid%>"  <%if(this.type=="1"&&this.depth!=1){%>draggable="true"<%}%> data-drop="<%if(this.type=="1"){%>1<%}%>"><%this.text%></span>
 <%}else{%>
 <input class="jstree-input"  type="text" value="<%this.text%>"/><span class="jstree-cancel"></span>
 <%}%>

 </div>
</div>