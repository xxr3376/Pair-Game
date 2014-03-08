<form class="age-range-form">

  <h1> 年龄下界 </h1>
  <input class="mousetrap lower" type="number" min=0 max=100 required <%= @lower ? '' : 'disabled="disabled"' %> />

  <h1> 年龄上界 </h1>
  <input class="mousetrap upper" type="number" min=0 max=100 required <%= @upper ? '' : 'disabled="disabled"' %> />

  <% if (@upper || @lower) { %>
  <input type="submit" value="完成"/>
  <% } %>
</form>
