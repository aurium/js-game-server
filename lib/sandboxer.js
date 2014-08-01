'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var config = require('./config');

var Sandbox = require('sandboxer');
var shims = require('./shims');

var log = require('./logger')(__filename);

function Sandboxer() {
  this.base = config.get('games_directory');
  this.modules = config.get('sanctioned_modules');
  this.games = {};
}

Sandboxer.prototype.list = function() {
  if (Object.keys(this.games).length === 0) {
    var counter = 0;

    fs.readdirSync(this.base).filter(function(file) {
      // Filter directories
      return fs.statSync(path.join(this.base, file)).isDirectory();
    }, this).forEach(function(file) {
      this.games[file] = {
        port: (config.get('gamePortStart') || 3001) + counter++,
        config: require(path.join(this.base, file, 'package.json'))
        // TODO: test for package.json before require it.
      };
    }, this);
  }

  return this.games;
};

Sandboxer.prototype.spawn = function(game) {
  var port = this.games[game].port;
  var config = this.games[game].config;

  log('spawning', {game:game, port:port});

  // Read the package info
  var fullpath = path.join(this.base, game);
  var entry = path.join(fullpath, (config.main || 'index.js'));

  // Start the HTTP server and socket.io
  var server = new http.Server();
  var io = socketio(server);
  server.listen(port);

  // Create the sandbox
  var sandbox = new Sandbox(path.join(this.base, game), {
    modules: this.modules,
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

module.exports = Sandboxer;
