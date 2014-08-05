'use strict';

var socket = io(document.location.href);

socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});
