"use strict";

var chalk = require('chalk');
var inspect = require('util').inspect;
var now = function() { return (new Date).toISOString().replace(/\.[^.]+$/,'') };
var useColors = true;
var writeTo = 'STDIO';
var fs = require('fs');

var kind = {
  info:  { txt: null,     color:chalk.blue   },
  warn:  { txt:'Warning', color:chalk.yellow },
  error: { txt:'ERROR',   color:chalk.red    }
};

var logFactory = module.exports = function(source) {
  var logger   = function() { logFormater(source, kind.info,  arguments) };
  logger.info  = function() { logFormater(source, kind.info,  arguments) };
  logger.warn  = function() { logFormater(source, kind.warn,  arguments) };
  logger.error = function() { logFormater(source, kind.error, arguments) };
  return logger;
};

function write(str) {
  if ( writeTo.toUpperCase() == 'STDIO' ) return console.log(str);
  fs.writeFile(writeTo, str, function(err) {
    if (err) console.error('LOGGER FAIL TO WRITE "+writeTo+"\n'+str);
  });
}

var logFormater = logFactory.logFormater = function (source, kind, origArgs) {
  var txt = now() + ( kind.txt ? ' '+kind.txt : '' ) +' '+ source +':';
  if ( useColors ) txt = kind.color(txt);
  var args = []; args.push.apply(args,origArgs);
  args.forEach(function(val, i) {
    if ( typeof(val) != 'string' ) args[i] = inspect( val, {colors:true} );
  });
  write(txt, args.join(' | ').replace(/\n/g,' '));
};

logFactory.setUseColors = function(val){ useColors = !!val; }
logFactory.getUseColors = function(){ return useColors }

logFactory.setWriteTo = function(where){ writeTo = where; }
logFactory.getWriteTo = function(){ return writeTo }

