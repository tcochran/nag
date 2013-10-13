var io = require('socket.io').listen(4444);

io.sockets.on('connection', function (socket) {

  function flashText() { socket.emit('new', 'hello') };

  setInterval(flashText, 00);

  socket.emit('message', { hello: 'world' });
});