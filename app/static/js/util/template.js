define([], function() {
  'use strict';

  /**
   * TODO
   *  comment delimiters
   */

  // escapeValue | interpolateValue | evaluateValue
  var reDelimiters = /<%-([\s\S]+?)%>|<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;

  var reDataVariable = /@([a-zA-Z$_])/g;
  function replaceDataVariable (value) {
    return value.replace(reDataVariable, 'data.$1');
  }

  var rePrintFunction = /print\(/g;

  var reEmptyStringLeading = /\b_out \+= "";/g;
  var reEmptyStringMiddle = /\b(_out \+?=) "" \+/g;
  // var reEmptyStringTrailing = /(_escape\(.*?\)|\b_tmp\)) \+ "";/g;
  var reEmptyStringTrailing = /(_escape\(.*?\)) \+ "";/g;

  function compileSingle(text, options) {
    options = options || {};

    var strip = options.stripWhitespace;
    if (strip === 'html') {
      text = text.replace(/^\s+|\s+$/g, '');
    }

    var index = 0;
    var source = '';
    text.replace(reDelimiters, function(match, escapeValue, interpolateValue, evaluateValue, offset) {
      // literal text not in delimiters
      var literal = text.slice(index, offset);
      literal = literal.replace(/"|\\/g, '\\$&');
      if (strip === 'html') {
        literal = literal.replace(/\s+/g, ' ');
      } else {
        literal = literal.replace(/\r|\n/g, function(match) {
          return match === '\r' ? '\\r' : '\\n';
        });
      }
      source += literal;
      
      if (escapeValue) {
        escapeValue = replaceDataVariable(escapeValue);
        source += '" + _escape(' + escapeValue + ') + "';
      }
      if (evaluateValue) {
        evaluateValue = replaceDataVariable(evaluateValue).replace(rePrintFunction, '_out += (');
        source += '"; ' + evaluateValue + '; _out += "';
      }
      if (interpolateValue) {
        interpolateValue = replaceDataVariable(interpolateValue);
        // source += '" + ((_tmp = (' + interpolateValue + ')) == null ? "" : _tmp) + "';
        source += '" + (' + interpolateValue + ') + "';
      }
      index = offset + match.length;

      return match;
    });

    return 'function(data) { data || (data = {}); var _out = "' + source + '"; return _out; }';
  }

  var template = {};

  template.compile = function(templates, options) {
    var func = '"use strict";';

    // escape function body
    func += 'var _htmlEscape = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\\"": "&quot;", "\'": "&#39;" };';
    func += 'var _reHtmlEscape = /[&<>"\']/g;';
    func += 'var _escape = function(str) { return ("" + str).replace(_reHtmlEscape, function(match) { return _htmlEscape[match]; }); };';

    if (typeof templates === 'string' || templates instanceof String) {
      func += 'return ' + compileSingle(templates, options) + ';';
    } else {
      var source = '';
      var first = true;
      for (var key in templates) {
        if (first) {
          first = false;
        } else {
          source += ', ';
        }

        source += '"' + key.replace(/"/g, '\\"') + '": ' + compileSingle(templates[key], options);
      }
      func += 'return {' + source + '};';
    }

    func = func.replace(reEmptyStringLeading, '')
               .replace(reEmptyStringMiddle, '$1')
               .replace(reEmptyStringTrailing, '$1;');

    /* jshint evil:true */
    var result = (new Function([], func)).call(undefined);
    result.source = func;
    return result;
  };

  return template;
});
