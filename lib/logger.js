'use strict';

var chalk = require('chalk');
var fs = require('fs');
var util = require('util');

var useColors = true;
var writeTo = 'STDIO';

function now() {
  return (new Date()).toISOString().replace(/\.[^.]+$/, '');
}

var kind = {
  debug: {txt: null, color: chalk.gray},
  info: {txt: null, color: chalk.blue},
  warn: {txt: 'WARNING', color: chalk.yellow},
  error: {txt: 'ERROR', color: chalk.red}
};

function write(str) {
  if (writeTo.toUpperCase() === 'STDIO') {
    return console.log(str);
  }

  fs.appendFile(writeTo, str + '\n', function(err) {
    if (err) {
      console.error('LOGGER FAIL TO WRITE "' + writeTo + '"\n' + str);
    }
  });
}

logFactory.setUseColors = function(val) {
  useColors = !!val;
};

logFactory.getUseColors = function(){
  return useColors;
};

logFactory.setWriteTo = function(where){
  writeTo = where;
};

logFactory.getWriteTo = function(){
  return writeTo;
};

function logFactory(source) {
  var logger = logFormatter(source, kind.info);

  logger.debug = logFormatter(source, kind.debug);
  logger.info = logFormatter(source, kind.info);
  logger.warn = logFormatter(source, kind.warn);
  logger.error = logFormatter(source, kind.error);

  return logger;
}

function logFormatter(source, kind) {
  return function() {
    var args = [].slice.call(arguments);
    var txt = now() + (kind.txt ? ' ' + kind.txt : '') + ' ' + source + ':';

    if (useColors) {
      txt = kind.color(txt);
    }

    args = args.map(function(value) {
      return typeof value === 'string'
        ? value
        : util.inspect(value, {colors: useColors});
    });

    write(txt + ' ' + args.join(' | ').replace(/\n/g, ' '));
  };
}

module.exports = logFactory;
