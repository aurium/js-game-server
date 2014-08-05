'use strict';

var log = require('../logger')(__filename);
var config = require('../config');
var sandboxer = require('../sandboxer');
var path = require('path');
var express = require('express');
var app = express();
var server;
var pubDir = path.join(__dirname, 'public');
var port = config.get('lobbyPort') || 3000;

exports.start = function() {
  server = app.listen(port, function() {
    var url = 'http://' + (config.get('domain') || 'localhost') + ':' + port;
    log('Game lobby started! Visit ' + url, {port:server.address().port});
  });

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  var router = express.Router();

  router.get('/', function(req, res) {
    res.render('index', {
      serviceName: config.get('serviceName') || 'Sandboxed JS Game Server',
      domain: config.get('domain') || 'localhost',
      gameList: sandboxer.list()
    });
  });

  app.use(require('stylus').middleware(pubDir));
  log.debug('Set express public dir: ' + pubDir);
  router.use(express.static(pubDir));
  log.debug('Set express public dir: ' + config.get('games_directory'));
  router.use(express.static(config.get('games_directory')));

  app.use('/', router);

  // Catch errors:
  app.use(notFound);
  app.use(logErrors);
  app.use(clientErrorHandler);
  app.use(errorHandler);

  return server;
};

function notFound(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

function logErrors(err, req, res, next) {
  if (err.status === 404) {
    log.warn('404 (not found) for ' + req.url);
  } else {
    log.error('ERROR ' + err.status + ' for ' + req.url, err.stack);
  }
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, {error: err});
  } else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500);
  // TODO: must not leak stacktraces to user on production
  res.render('error', {error: err});
}

exports.getServer = function() {
  return server;
};
