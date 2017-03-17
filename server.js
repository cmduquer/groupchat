'use strict';


// usernames which are currently connected to the chat
var usernames = {};
var nickname;

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
  socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
  socket.on('message', (socket) => {
  		nickname = socket.username;
  		console.log(nickname);
  	io.sockets.emit('updatechat', {
  		
  		"NickName":nickname,"message": socket, "received" : new Date()})
							});
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

