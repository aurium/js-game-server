log('Hi! This is pong.');

var socketio = require('sandbox-io');

socketio.on('connection', function(socket){
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
});

