"use strict";

var logFactory = require('../lib/logger');
var sinon = require('sinon');
var log = logFactory('test');
var fs = require('fs');
var mockFS;

describe('Logger', function() {

  beforeEach(function() { mockFS = sinon.mock(fs) });
  afterEach(function () { mockFS.restore() });

  it('should log to STDIO', function() {
    logFactory.setWriteTo('STDIO');
    var mockConsole = sinon.mock(console);
    mockConsole.expects('log').once();
    log('testing');
    mockConsole.verify();
    mockConsole.restore();
  });

  it('should log to a file', function() {
    logFactory.setWriteTo('/somedir/somefile.log');
    mockFS.expects('writeFile').once();
    log('testing');
    mockFS.verify();
  });

});
