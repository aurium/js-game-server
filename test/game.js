'use strict';

require('should');

var Game = require('../lib/game');

describe('Game module', function() {

  it('should load configuration', function() {
    var game = new Game('../examples/some-game');
    game.should.have.property('port').greaterThan(3000);
  });

});
