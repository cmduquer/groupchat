'use strict';


// usernames which are currently connected to the chat
var usernames = {};

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('message', (socket) => io.sockets.emit('updatechat', socket, socket));
  socket.on('adduser', (username) =>{
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		console.log(usernames[username]);
		if(usernames[username] !== undefined){
			io.sockets.emit('updatechat', 'Error', 'NickName already exits');
		} else {
		// echo to client they've connected
			usernames[username] = username;
			io.sockets.emit('updatechat', usernames[username], 'you have connected');
		}
	});
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

