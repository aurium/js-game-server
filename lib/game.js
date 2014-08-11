'use strict';

var fs = require('fs');
var path = require('path');
var http = require('http');
var socketio = require('socket.io');
var srvConfig = require('./config');
var log = require('./logger')(__filename);

module.counter = 0;

function Game(gameDir) {
  // TODO: test for package.json before require it.
  this.dataDir = path.resolve(gameDir);
  this.srcDir = path.join(this.dataDir, 'game');
  this.port = (srvConfig.get('gamePortStart') || 3001) + module.counter++;
  this.codeName = path.basename(this.dataDir);
  try {
    this.pakConfig = require(path.join(this.srcDir, 'package.json'));
  } catch(e) {
    this.pakConfig = {};
    log.warn('Cant load package.json for ' + this.codeName, e);
  }
  try {
    this.gameConfig = require(path.join(this.dataDir, 'game.json'));
  } catch(e) {
    this.gameConfig = {};
    log.warn('Cant load game.json for ' + this.codeName, e);
  }
  this.main = path.join(this.srcDir, (this.pakConfig.main || 'index.js'));
  if ( !this.gameConfig.title ) {
    this.gameConfig.title = this.pakConfig.name || this.codeName;
  }
  this.preview = fs.readdirSync(this.dataDir).filter(function(file) {
    return /preview.*\.(png|jpe?g|gif|svg)$/i.test(file);
  })[0];
  if ( this.preview ) {
    this.preview = this.codeName + '/' + this.preview;
  }
  this.dbFile = path.join(this.dataDir, 'data.json');
  try {
    this.dbData = require(this.dbFile);
  } catch(err) {
    log.warn('Cant read game db file.', err, {game:this.codeName});
    this.dbData = {};
  }
}

Game.prototype.selectFileFromRequestPath = function(reqPath) {
  if (/^\/(\?.*)?$/.test(reqPath)) {
    reqPath = '/index.html';
  }
  if (/\.\./.test(reqPath)) {
    return {
      error: {code:403, message:"Can't ask for uppr folder"}
    };
  }
  var file = reqPath.replace(/^([^?]+).*/, '$1');
  var ext = file.replace(/^.*\./, '');
  var type = 'text/html';
  switch (ext) {
    case 'json': type = 'application/json'; break;
    case 'js'  : type = 'text/javascript';  break;
    case 'css' : type = 'text/css';         break;
    case 'gif' : type = 'image/gif';        break;
    case 'png' : type = 'image/png';        break;
    case 'jpg' : type = 'image/jpeg';       break;
  }
  return {
    path: path.join(this.srcDir, file),
    type: type,
    error: null
  };
};

// Start the HTTP server and socket.io
Game.prototype.createServer = function() {
  var game = this;
  this.server = http.createServer(function (req, res) {
    log.debug('HTTP Request', req.url, {game:game.codeName});
    var file = game.selectFileFromRequestPath(req.url);
    if (file.error) {
      res.writeHead(file.error.code, {'Content-Type': 'text/html'});
      res.end('<h1>403 Forbidden</h1> ' + file.error.message);
    } else {
      fs.readFile(file.path, function (err, data) {
        if (err) {
          log.warn("Game's file request 404", err, {game:game.codeName});
          res.writeHead(404, {'Content-Type': 'text/html'});
          res.end('<h1>404 Not Found</h1> ' + req.url + ' is not here.');
        } else {
          res.writeHead(200, {'Content-Type': file.type});
          res.end(data);
        }
      });
    }
  });
  this.io = socketio(this.server);
  return this;
};

Game.prototype.db = function(key, value, callback) {
  var game = this;
  if ( typeof value != 'undefined' ) {
    game.dbData[key] = value;
    log.debug('Register data in the game db',
             {key:key, value:value.toString(), game:this.codeName});
    fs.writeFile(this.dbFile, JSON.stringify(game.dbData), function(err) {
      if (err) {
        log.error('Cant write game db file.', err, {game:game.codeName});
      }
      log.debug('Game db file writen.', game.dbFile, {game:game.codeName});
      if (callback) {
        callback(err);
      }
    });
  }
  return game.dbData[key];
};

module.exports = Game;
