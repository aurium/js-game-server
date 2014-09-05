'use strict';

var fs = require('fs');
var sinon = require('sinon');
require('should');

var config = require('../lib/config');
var mockFS;

describe('Configuration', function() {

  describe('Load Configuration', function() {
    require('../lib/logger').setConfig({silentSTDIO:true});

    beforeEach(function() {
      mockFS = sinon.mock(fs);
    });

    afterEach(function() {
      mockFS.restore();
      config.clearCache();
    });

    config.configPlaces = [
      ['nowhere1/config.json', null, false],
      ['nowhere2/config.json', null, true],
      ['nowhere3/config.json', null, true],
      ['../config.dist.json', null, true]
    ];

    it('should load the default file when all other fails', function() {
      var conf = config.loadConfig();
      conf.should.have.property('sanctioned_modules').with.lengthOf(6);
    });

    it('should load the config when user try to get some data', function() {
      config.get('sanctioned_modules').should.have.lengthOf(6);
    });

    it('should load config from env var when it is set', function() {
      config.get('lobbyPort').should.be.equal(3000);
      process.env['JSGS_lobbyPort'] = '1234';
      config.get('lobbyPort').should.be.equal(1234);
    });
  });

});
