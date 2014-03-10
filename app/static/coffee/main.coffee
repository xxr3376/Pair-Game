require.config({
  baseUrl: '/static/js',
  urlArgs: 'v=' + Date.now(),
  paths:
    # vendor libraries
    text: '/static/vendor/requirejs/text'
    q: 'lib/q'

    # libraries
    tpl: 'lib/requirejs/tpl'

    # path alias
    template: 'template'

    jquery: 'lib/jquery-2.0.3.min'
    mousetrap: 'lib/mousetrap.min'
})
