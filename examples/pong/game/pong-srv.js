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
  io.to(this.id)
    .emit('news', { message: 'You found a pair to play' })
    .emit('config', { player1: player1.name, player2: player2.name });
  setTimeout(this.tic.bind(this), 1000);
  this.ball = { x:0.5, y:0.5 };
}

Game.prototype.tic = function() {
  if (!games[this.id]) return;
  this.ball.x += 0.01;
  this.ball.y += 0.01;
  this.players[0].padY = (this.players[0].padY + this.players[0].gotoY) / 2;
  this.players[1].padY = (this.players[1].padY + this.players[1].gotoY) / 2;
  io.to(this.id).emit('config', {
    pad1: this.players[0].padY,
    pad2: this.players[1].padY,
    ballX: this.ball.x,
    ballY: this.ball.y
  });
  setTimeout(this.tic.bind(this), 33);
};

Game.prototype.end = function() {
  this.players[0].exit();
  this.players[1].exit();
  delete games[this.id];
};

function Player(socket) {
  this.socket = socket;
  this.name = 'player' + pCounter++;
  socket.on('disconnect', this.onExit.bind(this));
  this.padY = this.gotoY = 0.5;
}

Player.prototype.joinGame = function(game) {
  this.game = game;
  this.socket.join(game.id);
  this.socket.on('usrCmd', this.onCmd.bind(this));
  this.socket.emit('news', { message: 'My key', key:this.whoInTheGame().me.key });
};

Player.prototype.onCmd = function(data){
  log.debug('usrCmd', data);
  if (data.cmd=='click') this.onClick(data);
};

Player.prototype.onClick = function(data){
  this.gotoY = data.y;
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
  if (this==alonePlayer) alonePlayer = null;
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
    socket.emit('news', { message: 'Entering in a game...', id:socket.id });
    new Game(alonePlayer, new Player(socket));
    alonePlayer = null;
  } else {
    alonePlayer = new Player(socket);
    socket.emit('news', { message: 'Waiting for a pair...', id:socket.id });
  }
});

