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
db.once("open", async () => {
  let roomsInDB = await Room.find({});
  rooms = [...roomsInDB];
  const roomNames = rooms.map((r) => r.name);
  console.log("connected to database", roomNames);
});

app.get("/", (req, res) => {
  res.json(picturesArray);
});

app.get("/rooms", async (req, res) => {
  const filter = {};
  rooms = await Room.find(filter);
  res.json(rooms);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("username", (username) => {
    socket.username = username;
    io.emit("username", socket.username);
  });

  socket.on("renderGame", (data) => {
    const { room: roomName } = data;
    const room = rooms.find((roomInRoomsArray) => {
      return roomInRoomsArray.name === roomName;
    });
    console.log("rendergame for room " + roomName);
    if (room) {
      console.log("rendergam 2e");
      io.to(roomName).emit("history", room.gridState);
      io.to(roomName).emit("colors", room.colorPalette);
    } else {
      console.warn("on renderGame, cant find room ", roomName);
    }
  });

  // Skapar ett nytt rum

  socket.on("createRoom", (room) => {
    const { name, id, nickname } = room;
    const newRoom = new Room({
      id: id,
      name: name,
      members: [nickname],
      colorPalette: [...colorsArray],
      gridState: [...picturesArray],
    });
    newRoom.save();
    socket.join(name);

    rooms.push(newRoom);
  });

  // Joina rummet

  // Vi behöver lägga till så att vi kör socket.leave() när man joinar ett nytt rum!!!

  socket.on("join", (roomToJoin) => {
    console.log("trying to join room ", roomToJoin);
    const room = getRoomInRooms(rooms, roomToJoin.name);
    socket.join(roomToJoin.name);
    if (room) {
      room.members.push(roomToJoin.nickname);
      io.to(roomToJoin.name).emit("history", room.gridState);
      io.to(roomToJoin.name).emit("updateColors", room.colorPalette);
      console.log(`${roomToJoin.nickname} joined room ${roomToJoin.name}`);
    } else {
      console.log("Room not found", roomToJoin.name);
    }
    console.log("rooms array", rooms);
    console.log(socket.adapter.rooms);
  });

  // Här raderar man ett rum!

  socket.on("deleteRoom", (data) => {
    const { _id, name } = data;
    Room.findByIdAndDelete(_id, (error, response) => {
      if (error) {
        console.log("error: ", error);
      } else {
        console.log("result: ", response);
      }
    });
    const roomIndex = rooms.findIndex((r) => r.name === name);
    if (roomIndex > -1) rooms.splice(roomIndex, 1);
  });

  // Här lämnar man rummet när man går tillbaka till rumslobbyn

  socket.on("leaveRoom", (data) => {
    const { room: roomName, nickname } = data;
    // Lämna tillbaka färgen
    console.log(`User ${nickname}left room: ${roomName}`);
    socket.leave(roomName);
    const room = getRoomInRooms(rooms, roomName);
    if (room) {
      room.members = room.members.filter((member) => member !== nickname);
      const memberColor = room.colorPalette.find((colorInPalette) => {
        return colorInPalette.color === nickname;
      });
      memberColor.takenBy = "";
      io.to(roomToJoin.name).emit("updateColors", room.colorPalette);
      room.save();
    }
  });

  // Här lämnar man rummet om man redan fanns i det för att kunna joina igen

  socket.on("leaveBeforeJoining", (data) => {
    socket.leave(data);
  });

  // Chatta i det valda rummet

  socket.on("sendMessage", (data) => {
    let room = data.room;
    io.to(room).emit("receiveMessage", {
      text: data.text,
      user: socket.username,
      userId: socket.id,
    });
  });

  socket.on("disconnect", () => {
    rooms.forEach((room) => {
      room.save();
    });
    console.log("user disconnected");
  });

  //
  //
  // Hanterar allt målande ///////////////////////

  socket.on("pickedColor", (data) => {
    console.log("pickedColor", data);
    const { color: pickedColor, room: roomName, nickname } = data;

    const room = getRoomInRooms(rooms, roomName);
    if (room) {
      const color = room.colorPalette.find((colorInPalette) => {
        return colorInPalette.color === pickedColor;
      });

      if (color && color.takenBy === "") {
        color.takenBy = nickname;
        io.to(roomName).emit("updateColors", room.colorPalette);
      }
    }
  });

  socket.on("colorChange", (data) => {
    const {
      newColor: newPickedColor,
      oldColor: oldPickedColor,
      room: roomName,
      nickname,
    } = data;
    console.log("colorChange", data);
    const room = getRoomInRooms(rooms, roomName);
    if (room) {
      const newColor = room.colorPalette.find((colorInPalette) => {
        return colorInPalette.color === newPickedColor;
      });
      const oldColor = room.colorPalette.find((colorInPalette) => {
        return colorInPalette.color === oldPickedColor;
      });
      if (newColor && newColor.takenBy === "" && oldColor) {
        console.log(
          `changed color from ${oldColor.color} to ${newColor.color}`
        );
        newColor.takenBy = nickname;
        oldColor.takenBy = "";
        console.log("roomcolor pakette", room.colorPalette);
        io.to(roomName).emit("updateColors", room.colorPalette);
      }
    }
  });

  socket.on("drawing", (data) => {
    const { field, room: roomName, nickname } = data;
    const { position, color } = field;
    console.log("drawing", data);
    const room = getRoomInRooms(rooms, roomName);
    if (room) {
      const nicknameFoundInRoom = room.members.includes(nickname);
      if (nicknameFoundInRoom) {
        const nicknamesChosenColor = room.colorPalette.find(
          (colorInPalette) => {
            return colorInPalette.takenBy === nickname;
          }
        );
        if (nicknamesChosenColor && nicknamesChosenColor.color === color) {
          const pixel = room.gridState.find((g) => {
            return g.position === position;
          });
          if (pixel) {
            console.log("found pixel");
            pixel.color = color;
            io.to(roomName).emit("drawing", room.gridState);
          }
        }
      }
    }
  });
});

server.listen(port, () => {
  console.log("listens to port " + port);
});

function getRoomInRooms(rooms, roomName) {
  return rooms.find((roomInRoomsArray) => {
    return roomInRoomsArray.name === roomName;
  });
}
module.exports = { app, io };
