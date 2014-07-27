"use strict";

var fs = require('fs');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var config = require('./config');

var Sandbox = require('./sandbox');
var shims = require('./shims');

var log = require('./logger')('SJGS Sandboxer');

function Sandboxer() {
  this.base = config.get('games_directory');
  this.modules = config.get('sanctioned_modules');
}

Sandboxer.prototype.list = function() {
  return fs.readdirSync(this.base).filter(function(file) {
    return fs.statSync(path.join(this.base, file)).isDirectory();
  }, this);
};

Sandboxer.prototype.spawn = function(game, port) {
  log('spawning for '+game)
  var fullpath = path.join(this.base, game);

  // Read the package info
  var packageInfo = require(path.join(fullpath, 'package.json'));
  var entry = path.join(fullpath, (packageInfo.main || 'index.js'));

  // Start the HTTP server and socket.io
  var server = new http.Server();
  var io = socketio(server);
  server.listen(port);

  // Create the sandbox
  var sandbox = new Sandbox(path.join(this.base, game), {
    modules: this.modules,
    shims: {
      'sandbox-io': shims.io(io),
      'sandbox-server': shims.server(server),
    },
    globals: {
      console: console,
    }
  });

  try {
    // Load the game
    sandbox.require(entry);
  } catch (err) {
    server.close();
  }
};

module.exports = Sandboxer;
