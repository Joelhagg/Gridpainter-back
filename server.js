const express = require('express')
const app = express()
const cors = require('cors')
const server = require('http').createServer(app)
const port = process.env.PORT || 3001
const socketIo = require('socket.io')
const picturesArray = require('./assets/fields.json')
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

const fieldsRouter = require('./routes/fields')
const indexRouter = require('./routes/index')
const RoomsRouter = require('./routes/RoomsArray')



app.use(cors());
app.use('/', indexRouter)
app.use('/fields', fieldsRouter)
app.use('/RoomsArray', RoomsRouter);


io.on("connection", function (socket) {
  console.log("a user connected");
  io.emit("history", picturesArray);

  socket.on("disconnect", function () {
      console.log("user disconnected");
  });

  socket.on("chat message", function (msg) {
      console.log(msg);
      io.emit("chat message", msg);
  });

  socket.on("drawing", function (msg) {
      console.log(msg);

      for (let i = 0; i < picturesArray.length; i++) {
          const pixel = picturesArray[i];

          if (pixel.position == msg.position) {
              pixel.color = msg.color
          }
      }
      console.log(picturesArray);
     
      io.emit("drawing", msg);
  });
})

server.listen(port, () => {
  console.log("listens to port " + port);
})

module.exports = app;