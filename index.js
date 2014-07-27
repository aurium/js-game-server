"use strict";

var APP_HUMANNAME = exports.APP_HUMANNAME = 'Sandboxed JavaScript Game Server';
var APP_SYSNAME   = exports.APP_SYSNAME   = 'js-game-server';

var fs = require('fs');
var config = require('./lib/config');
var logFactory = require('./lib/logger');
var log = logFactory('SJGS Main');

exports.main = function() {
  // Ensure games directory exists
  if ( !fs.existsSync( config.get('games_directory') ) ) {
    log.error('Unable to read "' + config.get('games_directory') + '"');
    process.exit(1);
  }

  var sandboxer = new (require('./lib'));
  var directories = sandboxer.list();

  directories.forEach(function(directory, index) {
    sandboxer.spawn(directory, 3001 + index);
  });
}

if (!module.parent) {
  // This script was *not* required by a test or someother thing.
  var logConf = config.get('log') || {};
  logFactory.setUseColors(logConf.withColors);
  logFactory.setWriteTo(logConf.toFile || 'STDIO');
  exports.main(process.env.GAMES_DIR);
}
