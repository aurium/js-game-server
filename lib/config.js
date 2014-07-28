"use strict";

var config = null;
var appName = require('..').APP_SYSNAME;
var log = require('./logger')('SJGS Config');
var path = require('path');

exports.configPlaces = [
/*[ <config file path> ,    <friendly path>,                  <must warn?> ]*/
  [ process.env.HOME+'/.config/'+appName+'/config.json', null,    false    ],
  [ '/etc/'+appName+'/config.json', null,                         true     ],
  [ '../config.json',      '<'+appName+'-dir>/config.json',       true     ],
  [ '../config.dist.json', '<'+appName+'-dir>/config.dist.json',  true     ]
];

exports.loadConfig = function() {
  var i = -1, configFile;
  while ( i++, !config && (configFile=exports.configPlaces[i]) ) {
    var friendlyPath = configFile[1] || configFile[0];
    try {
      config = require(configFile[0]);
      log('Load configuration from"'+friendlyPath+'".');
    } catch(err) {
      if (configFile[2]) log.warn('Unable to load "'+friendlyPath+'".');
    }
  }
  // Resolve config paths
  config.games_directory = path.resolve(config.games_directory);
  return config;
};

exports.set = function(key, val) {
  if ( !config ) exports.loadConfig();
  return ( config[key] = val );
};

exports.get = function(key) {
  if ( !config ) exports.loadConfig();
  return config[key];
};

exports.all = function() {
  if ( !config ) exports.loadConfig();
  return config;
};

exports.clearCache = function() {
  config = null;
};

