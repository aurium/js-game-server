/* Version 0.0.2 - Proof of Concept */
"use strict";

var vm = require('vm'),
    fs = require('fs'),
    async = require('async'),
    socketWraper = require('./socket-wraper'),
    //logFormater = require('./log').logFormater,
    //log = function() { logFormater('#', arguments) };
    log = require('./log')('game-server');

var gameIds = exports.gameIds = {};

var getGameIds = exports.getGameIds = function (gamesDir, callback) {
  var idsFile = gamesDir+'game-ids.json';
  fs.stat(idsFile, function(err, stats) {
    if (err) {
      log('WARNING: There is no '+gamesDir+'game-ids.json.');
      callback();
    } else {
      fs.readFile(idsFile, function (err, data) {
        if (err) log('ERROR while reading '+idsFile, err);
        else gameIds = exports.gameIds = JSON.parse(data);
        callback();
      });
    }
  });
}

var main = exports.main = function (gamesDir) {
  if ( gamesDir.substr(-1) != '/' ) gamesDir += '/';
  getGameIds(gamesDir, function() {
    var lastID = 0; // TODO: get the biggest ID from gameIds.
    fs.readdir(gamesDir, function(err, files) {
      if (err) throw err;
      files.forEach(function(f) {
        fs.stat(gamesDir+f, function(err, stats) {
          var file = this.toString();
          if (err) log('Stat ERROR for '+file, err);
          else if( stats.isDirectory() ) {
            if (!gameIds[file]) {
              log('WARNING: Game '+file+' has no preset ID. Setting by increment.');
              gameIds[file] = ++lastID;
            }
            log('Loading '+file+' ID:'+gameIds[file]);
            loadGame(gamesDir, file);
          }
        }.bind(f));
      });
    });
  });
}

var loadGame = exports.loadGame = function (gamesDir, gameName) {
  var gameDir = gamesDir+gameName,
      gameMainFile = gameName+'/index.js',
      gameId = gameIds[gameName];
  fs.readFile(gamesDir+gameMainFile, function (err, gameCode) {
    if (err) return log('ERROR: Cant read '+gameName, err.message);
    try {
      log('Starting '+gameName+'...');
      var srv = require('http').Server();
      var io = require('socket.io')(srv);
      srv.listen(3000+gameId);
      var sandbox = vm.createContext({
        require: require('./secure-require')(gameDir),
        //log: function() { logFormater(gameName, arguments) },
        log: require('./log')(gameName),
        onConn: function(callback){
          io.on('connection', function(socket){
            callback(socketWraper(socket) )
          });
        },
        sockets: function(){
          io.sockets.map(function(s){ return socketWraper(s) });
        },
        emit: function(){ io.emit.apply( io, arguments) },
        use: function(fn) {
          io.use(function(socket, next) {
            fn( socketWraper(socket), next );
          });
        }
      });
      vm.runInContext(gameCode, sandbox, gameMainFile);
      log(gameName+' is running.');
    } catch(err) {
      log('Error in '+gameName, (err.stack||err).split(/\n\s*/));
      srv.close(); // TODO: Now we can try to start it again.
    }
  });
}

// TODO: trap Ctrl+C and io.emit an exit message for all clients.

if (!module.parent) {
  // This script was *not* required by a test or someother thing.
  if ( !process.env.GAMES_DIR || process.env.GAMES_DIR.length == 0 ) {
    throw(
      'You must to set the GAMES_DIR environment variable.\n' +
      'Read the "Runing" section on README.md file.'
    );
  }
  main(process.env.GAMES_DIR);
}
