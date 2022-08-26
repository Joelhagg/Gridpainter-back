const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const port = process.env.PORT || 3001;
const socketIo = require("socket.io");
const picturesArray = require("./assets/fields.json");
const { readFileSync, writeFileSync } = require("fs");
let colorsArray = require("./assets/colorPicker.json");

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

app.use(cors());
app.use(bodyParser.json());

app.use("/", indexRouter);
app.use("/fields", fieldsRouter);
app.use("/colors", colorsRouter);

// Sparar chatrummen vilket inte gör något om det försvinner tänker jag
//  [  user: "user",
//     chatRoom: "room1",
// ]

const chatRooms = [];

app.get("/", (req, res) => {
  res.json(picturesArray);
});

app.get("/rooms", (req, res) => {
  let allRooms = readFileSync("./assets/rooms.json");
  allRooms = JSON.parse(allRooms);
  res.json(allRooms);
});

app.post("/rooms", (req, res) => {
  let allRooms = readFileSync("./assets/rooms.json");

  if (allRooms) {
    allRooms = JSON.parse(allRooms);
    allRooms.push({ room: req.body.room, savedImgs: [] });
    writeFileSync("./assets/rooms.json", JSON.stringify(allRooms));
  }

  // Behöver vi ha dom här? Eller kan vi hantera rummen på front?

  io.emit("roomCreated", req.body.room);

  return res.json({ message: "room added", room: req.body.room });
});

io.on("connection", function (socket) {
  console.log("a user connected");
  io.emit("history", picturesArray);
  io.emit("colors", colorsArray);

  // Kanske skicka med vem som connectade här? ID eller nickName

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // Här bored vi kunna skicka med typ användar ID eller vilket rum tänker jag

    socket.emit("userDisconnected", { message: "user disconnected" });
  });

  socket.on("chat message", function (msg) {
    console.log(msg);
    io.emit("chat message", msg);
  });

  socket.on("color", function (msg) {
    for (let i = 0; i < colorsArray.length; i++) {
      const color = colorsArray[i];

      if (color.color === msg) {
        console.log(colorsArray);
        colorsArray.splice(i, 1);
        console.log(colorsArray);
        return;
      }
    }
    io.emit("updateColors", colorsArray);
  });

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

  /*socket.on("new room", function (roomName) {
    let newRoom = { roomName: roomName };
    rooms.push(newRoom);
    io.emit("new room", roomName);
  });*/
});

server.listen(port, () => {
  console.log("listens to port " + port);
});

module.exports = { app, io };
