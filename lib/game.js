'use strict';

var path = require('path');
var srvConfig = require('./config');

module.counter = 0;

function Game(gameDir) {
  // TODO: test for package.json before require it.
  this.port = (srvConfig.get('gamePortStart') || 3001) + module.counter++;
  this.config = require(path.join(gameDir, 'game/package.json'));
}

module.exports = Game;
