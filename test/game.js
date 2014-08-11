'use strict';

require('should');
var sh = require('shelljs');
var fs = require('fs');
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
    var game = new Game('test/examples/poor-game');
    game.should.have.property('port').greaterThan(3000);
    game.pakConfig.name.should.be.equal('poor-game');
    game.gameConfig.title.should.be.equal('poor-game');
    game.codeName.should.be.equal('poor-game');
  });

  it('should find main file', function() {
    var game = new Game('examples/some-game');
    var srcDir = path.resolve('examples/some-game/game');
    game.main.should.be.equal(path.join(srcDir,'main.js'));
  });

  it('should start a db file', function(done) {
    var gameDir = path.join(sh.tempdir(), 'game.tmp' + Math.random());
    var dataFile = path.join(gameDir,'data.json');
    sh.cp('-r', 'examples/some-game', gameDir);
    sh.rm('-r', dataFile);
    var game = new Game(gameDir);
    game.db('number', 42, function() {
      var data = require(dataFile);
      data.number.should.be.equal(42);
      sh.rm('-r', gameDir);
      done();
    });
  });

  it('should use db file', function() {
    var gameDir = path.join(sh.tempdir(), 'game.tmp' + Math.random());
    var dataFile = path.join(gameDir,'data.json');
    sh.cp('-r', 'examples/some-game', gameDir);
    fs.writeFileSync(dataFile, '{"number": 42}');
    var game = new Game(gameDir);
    game.db('number').should.be.equal(42);
    game.db('phrase', 'So long, and thanks for all the fish');
    var data = require(dataFile);
    data.number.should.be.equal(42);
    data.phrase.should.be.equal('So long, and thanks for all the fish');
    sh.rm('-r', gameDir);
  });

});
