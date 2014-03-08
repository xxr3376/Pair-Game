<select id="admin-user-select">
<% for (var user_id in @users) { %>
  <option data-id="<%= user_id %>" <% if (user_id == @current) {%> selected="selected" <% } %> >
    <%= @users[user_id] %> 
  </option>
<% } %>
</select>
<h2>评分</h2>
<% if (@opinion == 'patched') { %>
<div class="patched">
标注员已修改，上次未通过原因：<span class="old-comment"><%-@comment %></span>
</div>
<% } %>
<div>
  <button class="button <%= @opinion =='accept'?'active': '' %>" id="admin-btn-accept" data-state="accept">通过</button>
  <button class="button <%= @opinion =='reject'?'active': '' %>" id="admin-btn-reject" data-state="reject">不通过</button>
  <input type="text" id="admin-comment" placeholder="不通过原因" value="<%- @comment %>" <% if (@opinion == 'reject'){ %> style="display:block;" <% } %>/>
  <div class="submit-button">
    <button class="button submit block" id="admin-submit-btn"> 提交 </button>
  </div>
</div>
