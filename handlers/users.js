const users = [];

const addUser = (_name, _room) => {
  _name = _name.trim().toLowerCase();
  _room = _room.trim().toLowerCase();

  if(!_name || !_room) return { error: "These field cannot be empty"}
  userExhists = users.find((user) => user.name == _name && user.room == _room);
  roomExhists = users.find((user) => user.room == _room);

  if(userExhists) return {error: "User name is already taken"};

  if(!userExhists && roomExhists){
    let newUser = {
      name: _name,
      room: _room
    }
    users.push(newUser);
  }
}

module.exports = { users, addUser, removeUser, getUser, getUsers };