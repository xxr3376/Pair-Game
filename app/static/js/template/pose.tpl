<% var i; %>
<% if (@type === 'yaw') { %>
  <table>
    <tr>
      <% for (i = 0; i < 4; i++) { %>
        <td data-cell="<%= i %>" class="select-yaw"></td>
        <td><img src="<%= @prefix + @pitch + i %>.jpg"></td>
      <% } %>
      <td data-cell="<%= i %>" class="select-yaw"></td>
    </tr>
  </table>
<% } else { %>
  <table>
    <% for (i = 0; i < @cells.length; i++) { %>
      <tr>
        <td data-cell="<%= i %>" class="select-pitch"></td>
      </tr>
      <tr>
        <td><img src="<%= @prefix + @cells[i] %>"></td>
      </tr>
    <% } %>
    <tr>
      <td data-cell="<%= i %>" class="select-pitch"></td>
    </tr>
  </table>
<% } %>
