const express = require('express');
const cors = require('cors');
//const http = require('http');
const socketio = require('socket.io');
const { rooms, users, addRoom, getRoom, addUser, removeUser, getUsers, getUser } = require('./handlers/users');

const {updateState} = require('./handlers/gameState')

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

/**
 * takes nothing as req,
 * returns a new roomCode
 */
app.post('/create-lobby', (req, res) => {
  let code = addRoom();
  return res.send({ roomCode: code})
});

//pp.post('/join')

//const server = http.createServer(app);
const server = app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

const io = socketio(server, {
  cors: {
    origin: '*',
  }
});

io.on("connection", (socket) => {
  // const updateState = (socket, _room) => {
  //   socket.in(_room).emit('updateState', rooms[_room])
  // }
  console.log("In join, New connection added");

  socket.on('lobby', ({_name, _room}, callback) => {
    //populate the lobby with any users already there
    const {error, success} = addUser(_name, _room); //add the new user to the lobby
    if(error && !success){
      return callback(error);
    }
    socket.join(`${_room}`); //add the new user to the room
    let users = getUsers(_room);
    io.in(`${_room}`).emit('init', users, rooms[_room].pointsToWin) //send the clients the users in their lobby
  });

  socket.on('getUser', ({_name}, callback) => {
    let result = getUser(_name);
    callback(result)
  })

  socket.on('initializeGame', (lobbyCode, username, callback) => {
    let player = getUser(username);
    console.log("lobbyCode = ", lobbyCode);
    //let room = rooms[lobbyCode];
    //console.log("room = ", room)
    let op_user =  rooms[lobbyCode].users.find(name => name != username);
    let opponent = getUser(op_user);
    console.log("initializing the game");
    callback( rooms[lobbyCode], player, opponent)
  })

  socket.on('changePoints', (newPtsToWin, _room) => {
    rooms[_room].pointsToWin = newPtsToWin;
    updateState(io, _room);
  })

  socket.on('startGame', (room) => {
    io.in(`${room}`).emit('play');
  })

  socket.on("disconnect", (reason) => {
    console.log(`A client disconnected due to ${reason}`);
    //console.log(`reconnecting`);
    //socket.open();
  })
});