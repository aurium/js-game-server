"use strict";

var fs = require('fs');
var path = require('path');

function isFile(file) {
  var stat;
  try {
    stat = fs.statSync(file);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return false;
    }
  }

  return stat.isFile() || stat.isFIFO();
}

var suffix = [
  '.js',
  '/index.js'
];

module.exports = function(basedir) {
  return function(module) {
    if (module.match(/^(?:\.\.?\/|\/|([A-Za-z]:)?\\)/)) {
      var resolved = path.resolve(basedir, module);
      if (isFile(resolved)) {
        return resolved;
      }

      for (var i = 0; i < suffix.length; i++) {
        var file = resolved + suffix[i];
        if (isFile(file)) {
          return file;
        }
      }

      throw new Error("Cannot find module '" + module + "'");
    } else {
      return module;
    }
  };
};
