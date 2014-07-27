"use strict";

var logFactory = require('../lib/logger');
var sinon = require('sinon');
var log = logFactory('test');
var fs = require('fs');

describe('Logger', function() {

  beforeEach(function() {
    sinon.stub(fs, 'writeFile');
  });

  afterEach(function () {
    fs.writeFile.restore();
  });

  it('should log', function() {
    logFactory.setWriteTo('/dev/null');
    log('testing');
    sinon.assert.calledOnce(fs.writeFile);
    sinon.assert.calledWithMatch(fs.writeFile, '/dev/null', 'testing');
    
  });

  it('should log multiple args', function() {
    logFactory.setWriteTo('/dev/null');
    logFactory.setUseColors(false);
    log('testing', 123);
    sinon.assert.calledWithMatch(fs.writeFile, '/dev/null', 'testing | 123');
  });

  it('should log multiple complex args', function() {
    logFactory.setWriteTo('/dev/null');
    logFactory.setUseColors(false);
    log([11,22,33], {a:true, b:false});
    sinon.assert.calledWithMatch(fs.writeFile,
      '/dev/null', /11, *22, *33.*\|.*a: *true, *b: *false/);
  });

  it('should log multiple args with color', function() {
    logFactory.setWriteTo('/dev/null');
    logFactory.setUseColors(true);
    log('testing', 123);
    sinon.assert.calledWithMatch(fs.writeFile, '/dev/null', /testing | .*123/);
  });

  it('should log to STDIO', function() {
    logFactory.setWriteTo('STDIO');
    var mockConsole = sinon.mock(console);
    mockConsole.expects('log').once();
    log('testing');
    mockConsole.verify();
    mockConsole.restore();
  });

});
