<%= @name%>
<div class="btn-group">
  <% for (var i = 0; i < @data.length; i++) {  %>
    <button class="attr-btn" data-cell="<%= i + 1 %>"> <%= @data[i] %> : <%= i + 1 %>  </button>
  <% } %>
  <button class="attr-btn" data-cell="0">不确定 : 0</button>
</div>
