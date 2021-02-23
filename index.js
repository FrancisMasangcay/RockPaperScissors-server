const express = require('express');
const cors = require('cors');
//const http = require('http');
const socketio = require('socket.io');
const { rooms, users, addRoom, getRoom, addUser, removeUser, getUsers, getUser } = require('./handlers/users');

const { ROCK, PAPER, SCISSORS, NONE } = require('./handlers/cardTypes');

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

app.get('/', (req, res) => {
  res.send({response: "Server is running"}).status(200);
})

//const server = http.createServer(app);
const server = app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

const io = socketio(server, {
  cors: {
    origin: '*',
  }
});

io.on("connection", (socket) => {
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
    console.log("Lobby code = ", lobbyCode)
    let op_user =  rooms[lobbyCode].users.find(name => name != username);
    let opponent = getUser(op_user);
    console.log("opponent = ", opponent)
    console.log("initializing the game");
    callback( rooms[lobbyCode], player, opponent)
  })

  socket.on('changePoints', (newPtsToWin, _room) => {
    rooms[_room].pointsToWin = newPtsToWin;
    updateState(io, _room);
  })

  socket.on('selectCard', (room, user, card) => {
    console.log("in select card, card = ", card);
    if(users[user].player === 1){
      rooms[room].gameState.p1 = card;
    }
    else{
      rooms[room].gameState.p2 = card;
    }

     //execute round
    if(rooms[room].gameState.p1 != NONE && rooms[room].gameState.p2 != NONE){
      let state = rooms[room].gameState;

      if(state.p1 === ROCK){
        if(state.p2 === PAPER){
          rooms[room].gameState.roundWinner = 2;
          rooms[room].gameState.p2_points = rooms[room].gameState.p2_points + 1;
        }
        else if(state.p2 === SCISSORS){
          rooms[room].gameState.roundWinner = 1;
          rooms[room].gameState.p1_points = rooms[room].gameState.p1_points + 1;
        }
        else{
          rooms[room].gameState.roundWinner = -1;
        }
      }
      else if(state.p1 === PAPER){
        if(state.p2 === SCISSORS){
          rooms[room].gameState.roundWinner = 2;
          rooms[room].gameState.p2_points = rooms[room].gameState.p2_points + 1;
        }
        else if(state.p2 === ROCK){
          rooms[room].gameState.roundWinner = 1;
          rooms[room].gameState.p1_points = rooms[room].gameState.p1_points + 1;

        }
        else{
          rooms[room].gameState.roundWinner = -1;
        }
      }
      else if(state.p1 === SCISSORS){
        if(state.p2 === ROCK){
          rooms[room].gameState.roundWinner = 2;
          rooms[room].gameState.p2_points = rooms[room].gameState.p2_points + 1;
        }
        else if(state.p2 === PAPER){
          rooms[room].gameState.roundWinner = 1;
          rooms[room].gameState.p1_points = rooms[room].gameState.p1_points + 1;

        }
        else{
          rooms[room].gameState.roundWinner = -1;
        }
      }

      //check if a player has enough points to win
      let ptw = rooms[room].pointsToWin;
      if(rooms[room].gameState.p1_points === ptw){
        rooms[room].gameState.gameWinner = 1;
      }
      else if(rooms[room].gameState.p2_points === ptw){
        rooms[room].gameState.gameWinner = 2;
      }
      else{
        rooms[room].gameState.gameWinner = -1;
      }
      updateState(io, room); //emit the new room state to everyone in the room
    }
  })

  socket.on('startGame', (room) => {
    io.in(`${room}`).emit('play');
  })

  //players in a room wish to play again
  socket.on("playAgain", (room) => {
    //reset gameState
    let newGameState = { 
      p1: NONE,
      p2: NONE,
      p1_points: 0,
      p2_points: 0,
      gameWinner: -1,
      roundWinner: -1
    }
    rooms[room].gameState = newGameState;
    //clear users from user array, and delete from users object
    let usersLength = rooms[room].users.length;
    for(let i = 0; i < usersLength; i++){
      let poppedUser = rooms[room].users.pop();
      Object.values(users).forEach((user) => {
        if(user.username === poppedUser && user.roomCode === room){
          delete(users[user]);
        }
      })
    }
    io.in(`${room}`).emit('playAgainCalled', room)
  })

  socket.on('removeFromRoom', (room) => {
    socket.leave(`${room}`)
  })

  socket.on("disconnect", (reason) => {
    console.log(`A client disconnected due to ${reason}`);
    //console.log(`reconnecting`);
    //socket.open();
  })
});