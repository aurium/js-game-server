"use strict";

var fs = require('fs');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var config = require('./config');
var u = require('./util');

var Sandbox = require('./sandbox');
var shims = require('./shims');

var log = require('./logger')('SJGS Sandboxer');

function Sandboxer() {
  this.base = config.get('games_directory');
  this.modules = config.get('sanctioned_modules');
  this.__gameList = {};
}

Sandboxer.prototype.list = function() {
  if ( u.keys(this.__gameList).length == 0 ) {
    var counter = 0, me = this;
    fs.readdirSync(this.base).forEach(function(file) {
      if ( fs.statSync(path.join(me.base, file)).isDirectory() )
        me.__gameList[file] = {
          port: (config.get('idStart')||3001) + counter++,
          config: require(path.join(me.base, file, 'package.json'))
          // TODO: test for package.json before require it.
        };
    });
  }
  return this.__gameList;
};

Sandboxer.prototype.spawn = function(game) {
  var port = this.__gameList[game].port;
  var config = this.__gameList[game].config;
  log('spawning '+game+' and binding to port '+port);
  var fullpath = path.join(this.base, game);

  // Read the package info
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
