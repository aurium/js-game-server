'use strict';

require('should');
var path = require('path');
var Game = require('../lib/game');

describe('Game module', function() {

  it('should load configuration from well configured game', function() {
    var game = new Game('examples/some-game');
    game.should.have.property('port').greaterThan(3000);
    game.pakConfig.name.should.be.equal('some-game');
    game.gameConfig.title.should.be.equal('Some Game');
    game.codeName.should.be.equal('some-game');
  });

  it('should load configuration from non configured game', function() {
    var game = new Game('examples/some-other-game');
    game.should.have.property('port').greaterThan(3000);
    game.pakConfig.name.should.be.equal('some-other-game');
    game.gameConfig.title.should.be.equal('some-other-game');
    game.codeName.should.be.equal('some-other-game');
  });

  it('should find main file', function() {
    var game = new Game('examples/some-game');
    var dataDir = path.resolve('examples/some-game');
    game.main.should.be.equal(path.join(dataDir,'game/index.js'));
  });

});
