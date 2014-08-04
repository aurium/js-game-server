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
function addSource(args, source, sourceKey) {
  var last = args.length - 1;
  if ( args[last] && args[last].constructor === Object ) {
    args[last][sourceKey] = source;
  } else {
    var data = {};
    data[sourceKey] = source;
    args[args.length++] = data;
  }
}

module.exports = function logFactory(source, isGame) {
  var sourceKey, baseDir = path.resolve(path.join(__dirname,'..'));
  if (isGame) {
    sourceKey = 'game-src';
  } else {
    source = source.substr( baseDir.length + 1 );
    sourceKey = 'source';
  }
  var log = function(){
    addSource(arguments, source, sourceKey);
    logger.info.apply(logger, arguments);
  };
  ['debug', 'info', 'warn', 'error'].forEach(function(kind){
    log[kind] = function(){
      addSource(arguments, source, sourceKey);
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
