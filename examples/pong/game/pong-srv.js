'use strict';

log('Hi! This is pong.');

var io = require('sandbox-io');

var alonePlayer = null;
var games = {};
var pCounter = 1;

function Player(socket) {
  this.socket = socket;
  this.name = 'player' + pCounter++;
  socket.on('disconnect', this.onExit.bind(this));
}

Player.prototype.joinGame = function(gameID) {
  this.gameID = gameID;
  this.socket.join(gameID);
  this.socket.on('event', function(data){ log(data) });
  this.socket.emit('news', { message: 'My key', key:this.whoInTheGame().me.key });
};

Player.prototype.whoInTheGame = function() {
  var players = games[this.gameID].players;
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
  var otherPlayer = this.whoInTheGame().other.obj;
  otherPlayer.socket.emit('news', {
    message: 'Your pair exits',
    kickerId: this.socket.id
  });
  otherPlayer.exit();
};

Player.prototype.exit = function() {
  var otherPlayer = this.whoInTheGame().other.obj;
  this.socket.disconnect();
  games[this.gameID] = this.gameID = null;
  if (otherPlayer.gameID) {
    otherPlayer.exit();
  }
};

io.on('connection', function(socket) {
  if ( alonePlayer && alonePlayer.id != socket.id ) {
    socket.emit('news', { message: 'Entering a game...', id:socket.id });
    startGame(alonePlayer, new Player(socket));
    alonePlayer = null;
  } else {
    alonePlayer = new Player(socket);
    socket.emit('news', { message: 'Waiting for a pair...', id:socket.id });
  }
});

function startGame(player1, player2) {
  var gameID = 'game' + Math.random();
  games[gameID] = {
    players: [player1, player2]
  };
  player1.joinGame(gameID);
  player2.joinGame(gameID);
  io.to(gameID).emit('news', { hello: 'world',
    player1: player1.name,
    player2: player2.name
  });
}
