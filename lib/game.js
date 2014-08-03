'use strict';

var path = require('path');
var srvConfig = require('./config');

module.counter = 0;

function Game(gameDir) {
  // TODO: test for package.json before require it.
  this.dataDir = path.resolve(gameDir);
  this.srcDir = path.join(this.dataDir, 'game');
  this.port = (srvConfig.get('gamePortStart') || 3001) + module.counter++;
  this.config = require(path.join(this.srcDir, 'package.json'));
  this.main = path.join(this.srcDir, (this.config.main || 'index.js'));
}

module.exports = Game;
