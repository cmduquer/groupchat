'use strict';


var usernames = {};
var nickname;
var requirejs = require('requirejs');

requirejs.config({ "baseUrl": "resource" });



const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const css = path.join(__dirname, '/public');

// var app = express();  
// // var server = require('http').createServer(app);  

// app.use(express.static(__dirname + '/node_modules')); 
// app.use(express.static(__dirname + '/resource'));
// app.get('/', function(req, res,next) {  
//     res.sendFile(__dirname + '/index.html');
// });

// // server.listen(4200);  

const server = express()
  .use(express.static(__dirname+'/backbone-min.js'))
  .use(express.static(__dirname + '/node_modules'))
  .use(express.static(css))
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('adduser', (username) =>{
		socket.username = username;
		console.log(usernames[username]);
		if(usernames[username] !== undefined){
			io.sockets.emit('updatechat', 'Error', 'NickName already exits');
		} else {
			usernames[username] = username;
			// io.sockets.emit('updatechat', usernames[username], 'you have connected');
		}
	});
  socket.on('disconnect', () =>{
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		// socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
  socket.on('message', (msg) => {
  		console.log(msg.sender);
  		console.log(msg.message);
  	io.sockets.emit('updatechat', '{"sender":"'+msg.sender+'","message": "'+msg.message+'", "received" : "'+new Date()+'"}')
			});
    socket.on('close', () =>{
    	console.log('close');
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		// socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

