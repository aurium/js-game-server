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
  var server = new http.Server();
  var io = socketio(server);
  server.listen(game.port);

  // Create the sandbox
  var sandbox = new Sandbox(game.srcDir, {
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
    sandbox.load(game.main);
  } catch (err) {
    server.close();
  }
};
