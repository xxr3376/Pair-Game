<h2>评分</h2>
<div>
  <button class="button <%= @opinion == 3 ? 'active': '' %>" id="admin-btn-accept" data-state="3">通过</button>
  <button class="button <%= @opinion == 2 ?'active': '' %>" id="admin-btn-reject" data-state="2">不通过</button>
  <input type="text" id="admin-comment" placeholder="不通过原因" value="<%- @comment %>" <% if (@opinion == 2){ %> style="display:block;" <% } %>/>
  <div class="submit-button">
    <button class="button submit block" id="admin-submit-btn"> 提交 </button>
  </div>
</div>
