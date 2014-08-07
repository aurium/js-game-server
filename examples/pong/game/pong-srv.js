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
    .emit('config', { playing:true, player1:player1.name, player2:player2.name });
  setTimeout(this.tic.bind(this), 1000);
  this.ball = { x:0.5, y:0.5, inc:{ x:0.005, y:0.008 } };
}

Game.prototype.testBallTouchMyPad = function(player, range, dirX, incY) {
  if (this.ball.y <= player.padY+range && this.ball.y >= player.padY-range) {
    this.ball.inc.x = Math.abs(this.ball.inc.x) * dirX;
    this.ball.inc.y += this.ball.y<player.padY ? -incY : incY;
    return true;
  }
  return false;
};

Game.prototype.playerLostBall = function(pIndex) {
  var player = this.players[pIndex];
  //TODO: register points.
  io.to(this.id).emit('news', { message: player.name+' lost the ball.' });
  this.ball = { x:0.5, y:0.5, inc:{ x:0.005, y:0.001 } };
};

Game.prototype.tic = function() {
  if (!games[this.id]) return;
  var p1 = this.players[0];
  var p2 = this.players[1];
  p1.padY = (p1.padY*2 + p1.gotoY) / 3;
  p2.padY = (p2.padY*2 + p2.gotoY) / 3;
  var inc = this.ball.inc;
  this.ball.x += inc.x;
  this.ball.y += inc.y;
  if (this.ball.y <= 0.05) inc.y = Math.abs(this.ball.inc.y);
  if (this.ball.y >= 0.95) inc.y = Math.abs(this.ball.inc.y) * -1;
  if (this.ball.x <= 0.02 && this.ball.x >= 0.01) {
    if      (this.testBallTouchMyPad(p1, 0.03, 1, 0));
    else if (this.testBallTouchMyPad(p1, 0.04, 1, 0.001));
    else if (this.testBallTouchMyPad(p1, 0.05, 1, 0.002));
  }
  if (this.ball.x >= 0.98 && this.ball.x <= 0.99) {
    if      (this.testBallTouchMyPad(p2, 0.03, -1, 0));
    else if (this.testBallTouchMyPad(p2, 0.04, -1, 0.001));
    else if (this.testBallTouchMyPad(p2, 0.05, -1, 0.002));
  }
  if (this.ball.x < 0) this.playerLostBall(0);
  if (this.ball.x > 1) this.playerLostBall(1);
  io.to(this.id).emit('config', {
    pad1: p1.padY,
    pad2: p2.padY,
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
  if (data.cmd=='move') this.onMove(data);
};

Player.prototype.onMove = function(data){
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
  this.socket.emit('config', { playing:false });
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

