'use strict';

var path = require('path');
var srvConfig = require('./config');
var log = require('./logger')(__filename);

module.counter = 0;

function Game(gameDir) {
  // TODO: test for package.json before require it.
  this.dataDir = path.resolve(gameDir);
  this.srcDir = path.join(this.dataDir, 'game');
  this.port = (srvConfig.get('gamePortStart') || 3001) + module.counter++;
  try {
    this.pakConfig = require(path.join(this.srcDir, 'package.json'));
  } catch(e) {
    this.pakConfig = {};
    log.warn('Cant load package.json', e);
  }
  try {
    this.gameConfig = require(path.join(this.dataDir, 'data.json'));
  } catch(e) {
    this.gameConfig = {};
    log.warn('Cant load data.json', e);
  }
  this.main = path.join(this.srcDir, (this.pakConfig.main || 'index.js'));
  this.codeName = path.basename(this.dataDir);
  if ( !this.gameConfig.title ) {
    this.gameConfig.title = this.pakConfig.name || this.codeName;
  }
}

module.exports = Game;
