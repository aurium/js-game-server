'use strict';

var config;
var log = require('./logger')(__filename);
var path = require('path');
var appName = require('../package.json').name;

// [
//   <config file path>,
//   <friendly path>,
//   <must warn?>
// ]
exports.configPlaces = [
  [
    process.env.HOME + '/.config/' + appName + '/config.json',
    null,
    false
  ],
  [
    '/etc/' + appName + '/config.json',
    null,
    true
  ],
  [
    '../config.json',
    '<' + appName + '-dir>/config.json',
    true
  ],
  [
    '../config.dist.json',
    '<' + appName + '-dir>/config.dist.json',
    true
  ]
];

exports.loadConfig = function() {
  for (var i = 0; i < exports.configPlaces.length; i++) {
    var configFile = exports.configPlaces[i];
    var friendlyPath = configFile[1] || configFile[0];

    try {
      config = require(configFile[0]);
      log('Load configuration from "' + friendlyPath + '".');
    } catch(err) {
      if (configFile[2]) {
        log.warn('Unable to load "' + friendlyPath + '".');
      }
    }

    if (config) {
      break;
    }
  }

  // Resolve config paths
  config['games_directory'] = path.resolve(config['games_directory']);

  return config;
};

exports.set = function(key, val) {
  if (!config) {
    exports.loadConfig();
  }

  config[key] = val;
  return val;
};

exports.get = function(key) {
  if (!config) {
    exports.loadConfig();
  }
  if (process.env['JSGS_' + key]) {
    return JSON.parse(process.env['JSGS_' + key]);
  }
  return config[key];
};

exports.all = function() {
  if (!config) {
    exports.loadConfig();
  }

  return config;
};

exports.clearCache = function() {
  config = null;
};
