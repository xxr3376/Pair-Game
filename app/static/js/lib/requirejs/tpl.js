define(['text', 'util/template'], function(text, template) {
  'use strict';

  var buildMap = {};

  var load = function(name, parentRequire, onload /*, config */) {
    text.get(parentRequire.toUrl('template/' + name + '.tpl'), function(data) {
      onload(buildMap[name] = template.compile(data));
    });
  };

  var write = function (pluginName, moduleName, write) {
    if (moduleName in buildMap) {
      write("define('" + pluginName + "!" + moduleName  +
            "', function() { " + buildMap[moduleName].source + "});\n");
    }
  }

  return {
    write: write,
    load: load
  };
});
