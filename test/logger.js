'use strict';

var fs = require('fs');
var sinon = require('sinon');
var should = require('should');

var logFactory = require('../lib/logger');
var log = logFactory('test');

describe('Logger', function() {
  beforeEach(function() {
    sinon.stub(fs, 'appendFile');
  });

  afterEach(function () {
    fs.appendFile.restore();
  });

  it('should log', function() {
    logFactory.setWriteTo('/dev/null');
    log('testing');
    sinon.assert.calledWithMatch(fs.appendFile, '/dev/null', 'testing');
  });

  it('should log multiple args', function() {
    logFactory.setWriteTo('/dev/null');
    logFactory.setUseColors(false);
    log('testing', 123);
    sinon.assert.calledWithMatch(fs.appendFile, '/dev/null', 'testing | 123');
  });

  it('should log multiple complex args', function() {
    logFactory.setWriteTo('/dev/null');
    logFactory.setUseColors(false);
    log([11,22,33], {a:true, b:false});
    sinon.assert.calledWithMatch(fs.appendFile,
      '/dev/null', /11, *22, *33.*\|.*a: *true, *b: *false/);
  });

  it('should log multiple args with color', function() {
    logFactory.setWriteTo('/dev/null');
    logFactory.setUseColors(true);
    log('testing', 123);
    sinon.assert.calledWithMatch(fs.appendFile, '/dev/null', /testing | .*123/);
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
