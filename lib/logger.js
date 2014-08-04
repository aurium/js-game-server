'use strict';

var path = require('path');
var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({colorize:true, level:'debug'})
  ]
});

// If we simply append {source:source} to the args,
// winston will stringfy a possible extra hash data.
// So, if the last arg is a hash, add the source to it.
function addSource(args, source) {
  var last = args.length - 1;
  if ( args[last] && args[last].constructor === Object ) {
    args[last].source = source;
  } else {
    args[args.length++] = {source:source};
  }
}

module.exports = function logFactory(source) {
  var baseDir = path.resolve(path.join(__dirname,'..'));
  source = source.substr( baseDir.length + 1 );
  var log = function(){
    addSource(arguments, source);
    logger.info.apply(logger, arguments);
  };
  ['debug', 'info', 'warn', 'error'].forEach(function(kind){
    log[kind] = function(){
      addSource(arguments, source);
      logger[kind].apply(logger, arguments);
    };
  });
  return log;
};

module.exports.setConfig = function(config) {
  if (config.toFile) {
    logger.add(winston.transports.File, {filename: config.toFile});
  }
  if (typeof config.silentSTDIO == 'boolean') {
    logger.transports.console.silent = config.silentSTDIO;
  }
  if (typeof config.withColors == 'boolean') {
    logger.transports.console.colorize = config.withColors;
  }
};
