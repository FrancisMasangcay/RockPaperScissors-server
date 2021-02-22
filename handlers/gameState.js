const {rooms} = require('../handlers/users')

const updateState = (io, _room) => {
  console.log("in update state: room = ", rooms[_room])
  io.in(`${_room}`).emit('updateState', rooms[_room])
}

module.exports = { updateState }