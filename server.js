const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const port = process.env.PORT || 3001;
const socketIo = require("socket.io");
const picturesArray = require("./assets/fields.json");
let colorsArray = require("./assets/colorPicker.json");
const dotenv = require("dotenv").config();

//Database
const mongoose = require("mongoose");
//mongoose.connect(process.env.DB_URI, { useUnifiedTopology: true, dbName: process.env.DB_NAME });
mongoose.connect(
  "mongodb+srv://admin:adminadmin@grupp6.kwb5meg.mongodb.net/?retryWrites=true&w=majority",
  { useUnifiedTopology: true, dbName: process.env.DB_NAME }
);

const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to database"));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const fieldsRouter = require("./routes/fields");
const colorsRouter = require("./routes/colors");
const indexRouter = require("./routes/index");
const Room = require("./models/Room");

app.use(cors());
app.use(bodyParser.json());

app.use("/", indexRouter);
app.use("/fields", fieldsRouter);
app.use("/colors", colorsRouter);

app.get("/", (req, res) => {
  res.json(picturesArray);
});

app.get("/rooms", async (req, res) => {
  const filter = {};
  let rooms = await Room.find(filter);

  res.json(rooms);
});

io.on("connection", function (socket) {
  console.log("a user connected");
  io.emit("history", picturesArray);
  io.emit("colors", colorsArray);

  // Skapar ett nytt rum

  socket.on("createRoom", (room) => {
    const newRoom = new Room({ id: room.id, name: room.name });
    newRoom.save();
    console.log("room", room);

    socket.join(room);
  });

  // Joina rummet

  socket.on("join", (roomToJoin) => {
    socket.join(roomToJoin);
    console.log("joined: ", roomToJoin);
  });

  // Chatta i det valda rummet

  socket.on("sendMessage", (data) => {
    console.log("data.room: ", data);
    let room = data.room;
    console.log("room: ", room);
    console.log("message: ", data.message);
    io.to(room).emit("receiveMessage", data.message);
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  //
  //
  // Hanterar allt målande ///////////////////////

  socket.on("color", function (msg) {
    for (let i = 0; i < colorsArray.length; i++) {
      const color = colorsArray[i];

      if (color.color === msg) {
        colorsArray.splice(i, 1);

        io.emit("updateColors", colorsArray);
        return;
      }
    }
  });

  socket.on("colorChange", function (msg) {
    console.log(msg);
    colorsArray.push({ color: msg });
    io.emit("updateColors", colorsArray);
    console.log(colorsArray);

    return;
  });

  socket.on("drawing", function (msg) {
    let room = msg.room;
    console.log("room: ", room);

    console.log("drawing msg: ", {
      postition: msg.field.position,
      color: msg.field.color,
      room: msg.room,
    });
    for (let i = 0; i < picturesArray.length; i++) {
      const pixel = picturesArray[i];

      if (pixel.position == msg.field.position) {
        pixel.color = msg.field.color;
      }

      io.emit("drawing", {
        postition: msg.field.position,
        color: msg.field.color,
      });
    }
  });
});

server.listen(port, () => {
  console.log("listens to port " + port);
});

module.exports = { app, io };
