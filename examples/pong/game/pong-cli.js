'use strict';

var socket = {};

function connect() {
  console.log('connecting');
  if (!socket.connected) socket = io(document.location.href);

  socket.on('news', function (data) {
    console.log(data);
    socket.emit('usrCmd', { cmd: 'hi' });
  });

  socket.on('disconnect', function (data) {
    console.log('disconnected', data);
    openDialog(
      'Disconnected', 'Do you want to reconnect?',
      'Reconnect', function() {
        document.location.reload();
        dialog.style.display = 'none';
    });
  });
}

function openDialog(title, content, btLabel, btFunc) {
  console.log('open dialog', title, dialog);
  dialog.style.display = 'block';
  dialogTitle.innerHTML = title;
  dialogContent.innerHTML = content;
  dialogBtFunc.innerHTML = btLabel;
  dialogBtFunc.onclick = btFunc;
  console.log('open dialog done');
}
