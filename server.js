const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const port = process.env.PORT || 3001;
const socketIo = require("socket.io");
const picturesArray = require("./assets/fields.json");
let colorsArray = require('./assets/colorPicker.json')
const dotenv = require('dotenv').config()


//Database 
const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, {useUnifiedTopology: true, dbName: "db-gridpainter"});
const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => console.log('connected to database'));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const fieldsRouter = require('./routes/fields')
const colorsRouter = require('./routes/colors')
const indexRouter = require('./routes/index');
const Room = require("./models/Room");

app.use(cors());
app.use(bodyParser.json());

app.use('/', indexRouter)
app.use('/fields', fieldsRouter)
app.use('/colors', colorsRouter)

app.get("/", (req, res) => {
  res.json(picturesArray);
});

app.get('/rooms', async (req, res) => {
  const filter = {}
  let rooms = await Room.find(filter)

  res.json(rooms)
})

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
        console.log(colorsArray);
        colorsArray.splice(i,1)
        console.log(colorsArray);
        io.emit("updateColors", colorsArray);
        return
      }
    }
  })

  socket.on("drawing", function (msg) {
    console.log(msg);

    for (let i = 0; i < picturesArray.length; i++) {
      const pixel = picturesArray[i];

      if (pixel.position == msg.position) {
        pixel.color = msg.color;
      }
    }
    console.log(picturesArray);

    io.emit("drawing", msg);
  });

  socket.on("createRoom", (room) => {
    const newRoom = new Room({id: room.id, name: room.name})
    newRoom.save()

    socket.join(room)   
  })

});


server.listen(port, () => {
  console.log("listens to port " + port);
});

module.exports = {app, io};
