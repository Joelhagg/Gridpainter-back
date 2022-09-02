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

//all data sparas
let rooms = [];

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
  console.log(socket.adapter.rooms);
  console.log("a user connected");
  io.emit("history", picturesArray);
  io.emit("colors", colorsArray);

  // Skapar ett nytt rum

  socket.on("createRoom", (room) => {
    const { name, id, nickname } = room;
    const newRoom = new Room({
      id: id,
      name: name,
      members: [nickname],
    });
    newRoom.save();

    console.log("room", room);

    socket.join(name);

    rooms.push(newRoom);
    console.log(rooms);
  });

  // Joina rummet

  socket.on("join", (roomToJoin) => {
    const { name, id, nickname } = roomToJoin;
    socket.join(name);
    console.log("joined: ", roomToJoin);
    const roomIndex = rooms.findIndex((r) => {
      return r.name === name;
    });
    if (roomIndex >= 0) {
      const room = rooms[roomIndex];
      room.members.push(nickname);
      console.log(`${nickname} joined room ${name}`);
      console.log("All the rooms", rooms);
    } else {
      console.log("Room not found", name);
    }
  });

  // Här ska det så småning om gå att radera ett rum

  socket.on("deleteRoom", (room) => {
    console.log("room to delete: ", room);
    Room.findByIdAndDelete(room);
  });

  // Här lämnar man rummet när man går tillbaka till rumslobbyn

  socket.on("leaveRoom", (room) => {
    console.log(`User left room: ${room.room}`);
    socket.leave(room.room);
    // console.log(socket.adapter.rooms);
  });

  // Chatta i det valda rummet

  socket.on("sendMessage", (data) => {
    let room = data.room;
    console.log(room);

    io.to(room).emit("receiveMessage", {
      text: data.text,
      user: data.user,
      userId: socket.id,
    });
    console.log("message: ", data.message);
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
    for (let i = 0; i < picturesArray.length; i++) {
      const pixel = picturesArray[i];

      if (pixel.position == msg.position) {
        pixel.color = msg.color;
      }

      io.emit("drawing", msg);
    }
  });
});

server.listen(port, () => {
  console.log("listens to port " + port);
});

module.exports = { app, io };
