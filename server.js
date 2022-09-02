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

//
//
//
// Nu ligger rooms array:en här istället ////////////

let rooms = [];

app.get("/", (req, res) => {
  res.json(picturesArray);
});

app.get("/rooms", async (req, res) => {
  const filter = {};
  room = await Room.find(filter);
  res.json(room);
});

io.on("connection", (socket) => {
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

    socket.join(name);

    rooms.push(newRoom);
  });

  // Joina rummet

  // Vi behöver lägga till så att vi kör socket.leave() när man joinar ett nytt rum!!!

  socket.on("join", (roomToJoin) => {
    let roomsFromServer = [];

    Room.findOne({ name: roomToJoin.name }, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("res. ", res.name);
        roomsFromServer = res.name;
      }
    });

    const { name, id, nickname } = roomToJoin;
    socket.join(name);
    console.log("joined: ", roomToJoin);
    const roomIndex = rooms.findIndex((r) => {
      return r.name === name;
    });
    if (rooms >= 0 && roomsFromServer != name) {
      const { name, id, nickname } = roomToJoin;
      const newRoom = new Room({
        id: id,
        name: name,
        members: [nickname],
      });
      rooms.push(newRoom);
    } else {
      console.log("det finns minst ett rum i rooms array");
    }

    if (roomIndex >= 0) {
      const room = rooms[roomIndex];
      room.members.push(nickname);
      console.log(`${nickname} joined room ${name}`);
    } else {
      console.log("Room not found", name);
    }

    console.log("rooms array", rooms);
  });

  // Här raderar man ett rum!

  socket.on("deleteRoom", (room) => {
    Room.findByIdAndDelete(room, (error, response) => {
      if (error) {
        console.log("error: ", error);
      } else {
        console.log("result: ", response);
      }
    });
  });

  // Här lämnar man rummet när man går tillbaka till rumslobbyn

  socket.on("leaveRoom", (room) => {
    console.log(`User left room: ${room.room}`);
    socket.leave(room.room);
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

  socket.on("disconnect", () => {
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
