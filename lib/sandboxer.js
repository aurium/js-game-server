'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var srvConfig = require('./config');
var Game = require('./game');

var Sandbox = require('sandboxer');
var shims = require('./shims');

var log = require('./logger')(__filename);

var gamesDir = srvConfig.get('games_directory');
var games = {};

module.exports.list = function list() {
  if (Object.keys(games).length === 0) {
    fs.readdirSync(gamesDir).filter(function(file) {
      // Filter directories
      return fs.statSync(path.join(gamesDir, file)).isDirectory();
    }).forEach(function(gDir) {
      games[gDir] = new Game( path.join(gamesDir, gDir) );
    });
  }
  return games;
};

module.exports.spawn = function spawn(game) {
  game = games[game];

  log('spawning', {game:game.codeName, port:game.port});

  // Start the HTTP server and socket.io
  var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\nMust load index.html');
  });
  var io = socketio(server);

  // Create the sandbox
  var sandbox = new Sandbox(game.srcDir, {
    modules: srvConfig.get('sanctioned_modules'),
    shims: {
      'sandbox-io': shims.io(io),
      'sandbox-server': shims.server(server)
    },
    globals: {
      console: console,
      log: require('./logger')(game.codeName, true)
    }
  });

  server.listen(game.port, function() {
    log('Game started!', {game:game.codeName, port:game.port});
    // make it to start after the server load for intelligible log and debug.
    try {
      sandbox.load(game.main);
    } catch (err) {
      log.error('Sandbox fail', err, {game:game.codeName});
      server.close(); // Stop the server when the game crash.
      setTimeout(function(){
        // Restart the game after 10 secs to avoid proc consumption from damaged code.
        spawn(game.codeName);
      }, 10000);
    }
  });

};
