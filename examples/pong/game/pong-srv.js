'use strict';

log('Hi! This is pong.');

var io = require('sandbox-io');

var alonePlayer = null;
var games = {};
var pCounter = 1;

function Game(player1, player2) {
  this.id = 'game' + Math.random();
  games[this.id] = this;
  this.players = [player1, player2];
  player1.joinGame(this);
  player2.joinGame(this);
  io.to(this.id).emit('news', { hello: 'world',
    player1: player1.name,
    player2: player2.name
  });
}

Game.prototype.end = function() {
  this.players[0].exit();
  this.players[1].exit();
  delete games[this.id];
};

function Player(socket) {
  this.socket = socket;
  this.name = 'player' + pCounter++;
  socket.on('disconnect', this.onExit.bind(this));
}

Player.prototype.joinGame = function(game) {
  this.game = game;
  this.socket.join(game.id);
  this.socket.on('usrCmd', function(data){ log.debug('usrCmd',data) });
  this.socket.emit('news', { message: 'My key', key:this.whoInTheGame().me.key });
};

Player.prototype.whoInTheGame = function() {
  if (!this.game) return {};
  var players = this.game.players;
  if ( players[0] == this ) {
    return {
      me: {obj:players[0], key:'player1'},
      other: {obj:players[1], key:'player2'}
    };
  } else {
    return {
      me: {obj:players[1], key:'player2'},
      other: {obj:players[0], key:'player1'}
    };
  }
};

Player.prototype.onExit = function() {
  if (!this.game) return;
  var otherPlayer = this.whoInTheGame().other.obj;
  otherPlayer.socket.emit('news', {
    message: 'Your pair leaves the game.',
    kickerId: this.socket.id
  });
  this.game.end();
};

Player.prototype.exit = function() {
  if (!this.game) return;
  this.socket.disconnect();
  this.game = null;
};

io.on('connection', function(socket) {
  if ( alonePlayer && alonePlayer.id != socket.id ) {
    socket.emit('news', { message: 'Entering a game...', id:socket.id });
    new Game(alonePlayer, new Player(socket));
    alonePlayer = null;
  } else {
    alonePlayer = new Player(socket);
    socket.emit('news', { message: 'Waiting for a pair...', id:socket.id });
  }
});

