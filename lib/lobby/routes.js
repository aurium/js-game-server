'use strict';

var lobby = require('./');
var express = require('express');
var router = express.Router(); // eslint-disable-line new-cap
var serveStatic = require('serve-static');

router.get('/', function(req, res) {
  res.render('index', {
    serviceName: lobby.config.get('serviceName') || 'Sandboxed JS Game Server',
    domain:      lobby.config.get('domain') || 'localhost',
    gameList:    lobby.sandboxer.list()
  });
});

router.use(require('stylus').middleware(lobby.pubDir));

lobby.log.debug('Set express public dir: ' + lobby.pubDir);
router.use( serveStatic(lobby.pubDir) );

var gamesDir = lobby.config.get('games_directory');
lobby.log.debug('Set express public dir: ' + gamesDir);
router.use( serveStatic(gamesDir, {'index': ['index.html', 'index.htm']}) );

module.exports = router;
