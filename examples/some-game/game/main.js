log('Hi! This is some game.');

var socketio = require('sandbox-io');
log('Loaded sandbox-io', socketio);

socketio.on('connection', function(socket){
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
});

