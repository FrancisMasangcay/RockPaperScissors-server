const express = require('express');
const cors = require('cors');
//const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

//const server = http.createServer(app);
const server = app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

const io = socketio(server, {
  cors: {
    origin: '*',
  }
});

io.on("connection", (socket) => {
  socket.on('join', () => {
    console.log("New connection added");
    
  })
  socket.on("disconnect", () => {
    console.log("A client disconnected");
  })
});