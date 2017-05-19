var http = require('http');
var path = require('path');
var express = require('express');
var app = express();

var server = http.Server(app);
var io = require('socket.io')(server);

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
})

server.listen(3000, () => {
	console.log('Server listening on port 3000');
});

io.on('connect', socket => {
	socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
	socket.on('clear', () => io.emit('clear'));
});
