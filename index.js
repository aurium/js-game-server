"use strict";

var APP_HUMANNAME = exports.APP_HUMANNAME = 'Sandboxed JavaScript Game Server';
var APP_SYSNAME   = exports.APP_SYSNAME   = 'js-game-server';

var fs = require('fs');
var http = require('http');
var config = require('./lib/config');
var logFactory = require('./lib/logger');
var log = logFactory('SJGS Main');
var sandboxer = new (require('./lib/sandboxer'));

exports.main = function() {
  // Ensure games directory exists
  if ( !fs.existsSync( config.get('games_directory') ) ) {
    log.error('Unable to read "' + config.get('games_directory') + '"');
    process.exit(1);
  }

  for ( var game in sandboxer.list() ) sandboxer.spawn(game);

  exports.startLobby();
}

exports.startLobby = function() {
  var domain = config.get('domain') || 'localhost';
  var port = config.get('lobbyPort') || 3000;
  log('Starting game lobby on port '+port);
  var server = new http.Server();
  http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h1>Games list</h1>');
    var list = sandboxer.list();
    for ( var game in list )
      res.write('<li><a href="//'+domain+':'+list[game].port+'/">'+game+'</a></li>');
    res.end();
  }).listen(port);
}

if (!module.parent) {
  // This script was *not* required by a test or someother thing.
  var logConf = config.get('log') || {};
  logFactory.setUseColors(logConf.withColors);
  logFactory.setWriteTo(logConf.toFile || 'STDIO');
  exports.main(process.env.GAMES_DIR);
}
