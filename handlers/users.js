/**
 * schema 
 * room
 * {
 *  roomCode: {
 *      users: [p1, p2]
 *      pointsToWin: 
 *      roomCode:
 *      gameState: {
 *        p1: Rock | paper | scissor,
 *        p2: Rock | paper | scissor,
 *        p1_points: 2,
 *        p2_points: 1,
 *        p1_confirmed: true | false
 *        p2_confirmed: true | false
 *      }
 *    }
 * }
 * user
 * {
 *   username: {
 *    roomCode: 1234
 *    player: p1
 *    username: JohnDoe
 *    }
 * }
 */

const rooms = {}
const users = {};

const addRoom = () => {
  let newCode = Math.floor(Math.random() * 999 + 1);
  
  //generate a unique room code
  while(rooms[newCode]){
    newCode++;
    if(newCode > 1000){
      newCode = Math.floor(Math.random() * 999 + 1);
    }
  }

  rooms[newCode] = {
    users: [],
    pointsToWin: 3,
    roomCode: newCode,
    gameState: {
      p1: '',
      p2: '',
      p1_points: 0,
      p2_points: 0,
      p1_confirmed: false,
      p2_confirmed: false,
    }
  }
  console.log("Rooms: ", rooms);
  return newCode;
}

const getRoom = (_room) => {
  return rooms[_room];
}

const addUser = (_name, _room) => {
  if(!_name || !_room) return { error: "These field cannot be empty"}
  _name = _name.trim().toLowerCase();
  _room = _room.trim().toLowerCase();

  userExhists = rooms[_room].users.find((user) => user.name == _name)

  if(userExhists) return {error: "Username is already taken"};

  if(!userExhists){
    rooms[_room].users.push(_name); //add to room
    //create the new user and add to users
    users[_name] = {
      roomCode: _room,
      player: rooms[_room].users.length,
      username: _name
    }; 
  }
  console.log(`Current room state = `, rooms)
  console.log(`Current user state = `, users)
  return { success: `added a user to room ${_room}`};
}

const removeUser = (_name) =>{
  delete users[_name];
}

const getUsers = (_room) => {
  const players = rooms[_room].users;
  let result = {};
  players.forEach(player => {
    result[player] = users[player];
  });
  return result;
}
const getUser = (_name) => {
  return users[_name];
}

module.exports = { rooms, addRoom, getRoom, users, addUser, removeUser, getUsers, getUser};