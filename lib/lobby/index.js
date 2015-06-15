'use strict';

var
    config = require('../config'),
    path   = require('path');

var lobby = module.exports = {
  log:       require('../logger')(__filename),
  config:    config,
  sandboxer: require('../sandboxer'),
  app:       require('express')(),
  pubDir:    path.join(__dirname, 'public'),
  server:    null,
  port:      config.get('lobbyPort') || 3000
};

lobby.start = function() {
  lobby.server = lobby.app.listen(lobby.port, function() {
    var domain = config.get('domain') || 'localhost';
    var url = 'http://' + domain + ':' + lobby.port;
    if ( lobby.port !== lobby.server.address().port ) {
      lobby.warn('Server port changed! (WTF!?)');
      lobby.port = lobby.server.address().port;
    }
    lobby.log('Game lobby started! Visit ' + url, {port: lobby.port});
  });

  lobby.app.set('views', path.join(__dirname, 'views'));
  lobby.app.set('view engine', 'ejs');

  lobby.app.use('/', require('./routes'));

  // Catch errors:
  lobby.app.use(notFound);
  lobby.app.use(logErrors);
  lobby.app.use(clientErrorHandler);
  lobby.app.use(errorHandler);

  return lobby.server;
};

function notFound(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

function logErrors(err, req, res, next) {
  if (err.status === 404) {
    lobby.log.warn('404 (not found) for ' + req.url);
  } else {
    lobby.log.error('ERROR ' + err.status + ' for ' + req.url, err.stack);
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
  next(err);
}
