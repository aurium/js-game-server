'use strict';

function socketWraper(socket) {
  return {
    get id() {
      return socket.id;
    },
    get rooms() {
      return socket.rooms;
    },
    emit: function() {
      return socketWraper(socket.emit.apply(socket, arguments));
    },
    join: function() {
      return socketWraper(socket.join.apply(socket, arguments));
    },
    leave: function() {
      return socketWraper(socket.leave.apply(socket, arguments));
    },
    to: function() {
      return socketWraper(socket.to.apply(socket, arguments));
    },
    disconnect: function() {
      return socketWraper(socket.disconnect.apply(socket, arguments));
    },
    on: function() {
      return socketWraper(socket.on.apply(socket, arguments));
    }
  };
}

module.exports = function(io) {
  return socketWraper(io);
};
