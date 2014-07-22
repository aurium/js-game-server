"use strict";

module.exports = function socketWraper(socket) {
  return {
    id: function(){ socket.id },
    rooms: function(){ socket.rooms },
    emit:  function(){ return socketWraper(socket.emit.apply( socket, arguments)) },
    join:  function(){ return socketWraper(socket.join.apply( socket, arguments)) },
    leave: function(){ return socketWraper(socket.leave.apply(socket, arguments)) },
    to:    function(){ return socketWraper(socket.to.apply(   socket, arguments)) },
    on:    function(event, fn){ socket.on(event, fn) }
  };
};
