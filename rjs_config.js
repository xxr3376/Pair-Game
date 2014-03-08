requirejs.config({
  baseUrl: 'app/static/js',
  paths: {
    // vendor libraries
    text: '../vendor/requirejs/text',

    // libraries
    tpl: 'lib/requirejs/tpl',

    // path alias
    template: 'template',

    jquery: 'lib/jquery-2.0.3.min',
    mousetrap: 'lib/mousetrap.min'
  }
})
