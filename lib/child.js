var debug = require('debug');
var http = require('http');
var minimist = require('minimist');
var path = require('path');
var socketio = require('socket.io');

var Sandbox = require('./sandbox');
var shims = require('./shims');
var builtins = require('./builtins.json');

// Process arguments
var argv = minimist(process.argv.slice(2));
if (!argv.path) throw new Error('--path is required');
if (!argv.port) throw new Error('--port is required');

// Read the package info
var packageInfo = require(path.join(argv.path, 'package.json'));

// Retrieve the entry point
var entry = path.join(argv.path, (packageInfo.main || 'index.js'));

// Create a logger
var log = debug(packageInfo.name);

// Start the HTTP server and socket.io
var server = new http.Server();
var io = socketio(server);
server.listen(argv.port);

// Create the sandbox
var sandbox = new Sandbox(argv.path, {
  modules: builtins,
  shims: {
    'sandbox-io': shims.io(io),
    'sandbox-server': shims.server(server),
  },
  globals: {
    console: console,
  }
});

process.on('uncaughtException', function(err) {
  process.send(err);
});

// Load the game
sandbox.require(entry);
