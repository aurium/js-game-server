log(this,1+2,'abc');

require('somemodule');

onConn(function(socket){
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
});

thisFunctionWillCrash(123);
