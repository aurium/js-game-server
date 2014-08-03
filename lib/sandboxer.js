'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var srvConfig = require('./config');

var Sandbox = require('sandboxer');
var shims = require('./shims');

var log = require('./logger')(__filename);

var gamesDir = srvConfig.get('games_directory');
var games = {};

module.exports.list = function list() {
  if (Object.keys(games).length === 0) {
    var counter = 0;

    fs.readdirSync(gamesDir).filter(function(file) {
      // Filter directories
      return fs.statSync(path.join(gamesDir, file)).isDirectory();
    }, this).forEach(function(file) {
      games[file] = {
        port: (srvConfig.get('gamePortStart') || 3001) + counter++,
        config: require(path.join(gamesDir, file, 'package.json'))
        // TODO: test for package.json before require it.
      };
    });
  }

  return games;
};

module.exports.spawn = function spawn(game) {
  var port = games[game].port;
  var gameConfig = games[game].config;

  log('spawning', {game:game, port:port});

  // Read the package info
  var fullpath = path.join(gamesDir, game);
  var entry = path.join(fullpath, (gameConfig.main || 'index.js'));

  // Start the HTTP server and socket.io
  var server = new http.Server();
  var io = socketio(server);
  server.listen(port);

  // Create the sandbox
  var sandbox = new Sandbox(path.join(gamesDir, game), {
    modules: srvConfig.get('sanctioned_modules'),
    shims: {
      'sandbox-io': shims.io(io),
      'sandbox-server': shims.server(server)
    },
    globals: {
      console: console
    }
  });

  try {
    // Load the game
    sandbox.load(entry);
  } catch (err) {
    server.close();
  }
};
