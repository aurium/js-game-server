"use strict";

var log = require('./log')('secure-require');

module.exports = function secureRequireFactory(allowedDir) {
  if ( allowedDir.substr(-1) != '/' ) allowedDir += '/';
  return function(moduleName) {
    // TODO: simple module loader
    if (moduleName.indexOf('..')>-1) throw 'Trying to walk back?';
    log('Tried to load '+allowedDir+moduleName+'.js');
    return null;
  }
}
