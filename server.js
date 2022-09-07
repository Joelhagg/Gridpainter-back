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
  socket.on("username", (username) => {
    socket.username = username;
    io.emit("username", socket.username);
  });

  socket.on("renderGame", (data) => {
    const { room: roomName } = data;
    const room = rooms.find((roomInRoomsArray) => {
      return roomInRoomsArray.name === roomName;
    });

    if (room) {
      io.to(roomName).emit("history", room.gridState);
      io.to(roomName).emit("colors", room.colorPalette);
    } else {
      console.warn("on renderGame, cant find room ", roomName);
    }
  }); 

  // Skapar ett nytt rum
  socket.on("createRoom", (room) => {
    const { name, id } = room;
    const nickname = socket.username;

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
    io.emit("newRoomsList", rooms);
  });
  
  socket.on("getRooms", () => {
    io.emit("newRoomsList", rooms)
  })

  // Joina rummet

  // Vi behöver lägga till så att vi kör socket.leave() när man joinar ett nytt rum!!!

  socket.on("join", (data) => {
    const { name } = data;
    const nickname = socket.username;
    const room = getRoomInRooms(rooms, name);
    socket.userRoom = room

    socket.join(name);
      if (room) {
        room.members.push(nickname);
        io.to(name).emit("history", room.gridState);
        io.to(name).emit("updateColors", room.colorPalette);
        console.log(`${nickname} joined room ${name}`);
      } else {
        console.log("Room not found", name);
      }
  });

  // Här raderar man ett rum!

  socket.on("deleteRoom", (data) => {
    const { _id, name } = data;
    Room.findByIdAndDelete(_id, (error, response) => {
      if (error) {
        console.log("error: ", error);
      } 
    });
    const roomIndex = rooms.findIndex((r) => r.name === name);
    if (roomIndex > -1) rooms.splice(roomIndex, 1);

    io.emit("newRoomsList", rooms);
  });

  // Här lämnar man rummet när man går tillbaka till rumslobbyn

  socket.on("leaveRoom", (data) => {
    const { room: roomName } = data;
    const nickname = socket.username;
    // Lämna tillbaka färgen
    socket.leave(roomName);

    const room = getRoomInRooms(rooms, roomName);
    if (room) {
      room.members = room.members.filter((member) => member !== nickname);
      const memberColor = room.colorPalette.find((colorInPalette) => {
        return colorInPalette.takenBy === nickname;
      });
      if (memberColor) memberColor.takenBy = "";
      io.to(roomName).emit("updateColors", room.colorPalette);
      room.save();
    }
  });

  // Här lämnar man rummet om man redan fanns i det för att kunna joina igen

  socket.on("leaveBeforeJoining", (socketId) => {
    socket.leave(socketId);
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
      room.members.find((member, i) => {
        if(member === socket.username){
          room.members.splice(i, 1)
        }
      })

      room.colorPalette.find(color => {
        if(color.takenBy === socket.username){
          color.takenBy = ""
          io.to(room).emit("updateColors", room.colorPalette);
        }
      })
      socket.emit('disconnected', socket)
      room.save();
    });

    // Här kan man kolla hur många sockets som är uppkopplade
    console.log(io.engine.clientsCount);

    // Om man disconnectar så skickas man till förstasidan

    // socket.emti("userDisconnected");
  });

  //
  //
  // Hanterar allt målande ///////////////////////

  socket.on("pickedColor", (data) => {
    const { color: pickedColor, room: roomName } = data;
    const nickname = socket.username;

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
    const { newColor: newPickedColor, room: roomName } = data;
    const nickname = socket.username;
    const room = getRoomInRooms(rooms, roomName);

    if (room) {
      const newColor = room.colorPalette.find((colorInPalette) => {
        return colorInPalette.color === newPickedColor;
      });
      const oldColor = room.colorPalette.find((colorInPalette) => {
        return colorInPalette.takenBy === nickname;
      });
      if (newColor && newColor.takenBy === "") {
        console.log(
          `${nickname} changed color from ${oldColor?.color} to ${newColor.color}`
        );
        newColor.takenBy = nickname;
        if (oldColor) {
          oldColor.takenBy = "";
        }

        io.to(roomName).emit("updateColors", room.colorPalette);
      }
      room.save()
    }
  });

  socket.on("drawing", (data) => {
    const { field, room: roomName } = data;
    const { position, color } = field;
    const nickname = socket.username;

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
