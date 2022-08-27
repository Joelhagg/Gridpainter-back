const express = require('express')
const app = express()
const cors = require('cors')
const server = require('http').createServer(app)
const port = process.env.PORT || 3001
const socketIo = require('socket.io')
let picturesArray = require('./assets/fields.json')
let colorsArray = require('./assets/colorPicker.json')

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

const fieldsRouter = require('./routes/fields')
const colorsRouter = require('./routes/colors')
const indexRouter = require('./routes/index')

app.use(cors());
app.use('/', indexRouter)
app.use('/fields', fieldsRouter)
app.use('/colors', colorsRouter)

io.on("connection", function (socket) {
  console.log("a user connected");
  io.emit("history", picturesArray);
  io.emit("colors", colorsArray);

  socket.on("disconnect", function () {
      console.log("user disconnected");
  });

  socket.on("chat message", function (msg) {
      console.log(msg);
      io.emit("chat message", msg);
  });

  socket.on("color", function (msg){
    
    for (let i = 0; i < colorsArray.length; i++) {
      const color = colorsArray[i];

      if (color.color === msg) {
       // console.log(colorsArray);
        colorsArray.splice(i,1)
       // console.log(colorsArray);
        io.emit("updateColors", colorsArray);
        return
      }
    }
  })

  socket.on("drawing", function (msg) {
     // console.log(msg);

      for (let i = 0; i < picturesArray.length; i++) {
          const pixel = picturesArray[i];

          if (pixel.position == msg.position) {
              pixel.color = msg.color
          }
      }
     // console.log(picturesArray);
     
      io.emit("drawing", msg);
  });
})

server.listen(port, () => {
  console.log("listens to port " + port);
})

module.exports = app;