'use strict';

require('should');
var path = require('path');
var Game = require('../lib/game');

describe('Game module', function() {

  it('should load configuration', function() {
    var game = new Game('examples/some-game');
    game.should.have.property('port').greaterThan(3000);
    game.config.name.should.be.equal('some-game');
  });

  it('should find main file', function() {
    var game = new Game('examples/some-game');
    var dataDir = path.resolve('examples/some-game');
    game.main.should.be.equal(path.join(dataDir,'game/index.js'));
  });

});
