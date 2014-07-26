"use strict";

var sinon = require('sinon');

describe('Configuration', function() {
  describe('Load Configuration', function() {

    var gameServer = require('..');
    gameServer.configPlaces = [
      'nowhere1/config.json',
      'nowhere2/config.json',
      './config.dist.json'
    ];
    var mock = sinon.mock(console); // TODO: (re)write a log lib to don't mock console.

    it('should load the default file when all other fails', function() {
      gameServer.loadConfig().should
                             .have.property('sanctioned_modules')
                             .with.lengthOf(6);
    });

    it('should log configPlaces.length times', function() {
      mock.expects('log').exactly(gameServer.configPlaces.length);
      gameServer.loadConfig();
      mock.verify();
    });

  });
});
