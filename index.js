"use strict";

var chalk = require('chalk');
var fs = require('fs');
var path = require('path');

var Sandboxer = require('./lib');

var APP_HUMANNAME = 'Sandboxed JavaScript Game Server';
var APP_SYSNAME = 'js-game-server';

// Load configuration
exports.configPlaces = [
  process.env.HOME+'/.config/'+APP_SYSNAME+'/config.json',
  '/etc/'+APP_SYSNAME+'/config.json',
  './config.json',
  './config.dist.json'
];
exports.config = null;
exports.loadConfig = function() {
  var i = -1, config = null, configFile;
  while ( i++, config == null && (configFile=exports.configPlaces[i]) )
    try {
      config = require(configFile);
      console.log(chalk.blue('Load configuration from"'+configFile+'".'));
    } catch(err) {
      console.log(chalk.yellow('Unable to load "'+configFile+'".'));
    }
  // Resolve config paths
  config.games_directory = path.resolve(config.games_directory);
  return exports.config = config;
}

exports.main = function() {
  // Ensure games directory exists
  if (!fs.existsSync(exports.config.games_directory)) {
    console.log(chalk.red("Unable to read '" + exports.config.games_directory + "'"));
    process.exit(1);
  }

  var sandboxer = new Sandboxer(exports.config);
  var directories = sandboxer.list();

  directories.forEach(function(directory, index) {
    sandboxer.spawn(directory, 3001 + index);
  });
}

if (!module.parent) {
  // This script was *not* required by a test or someother thing.
  exports.loadConfig();
  exports.main(process.env.GAMES_DIR);
}
