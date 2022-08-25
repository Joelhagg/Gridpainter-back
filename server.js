const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const port = process.env.PORT || 3001;
const socketIo = require("socket.io");
const picturesArray = require("./assets/fields.json");

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const fieldsRouter = require("./routes/fields");
const indexRouter = require("./routes/index");

app.use(cors());
// app.use("/", indexRouter);
app.use("/fields", fieldsRouter);

const rooms = [];

app.get("/", (req, res) => {
  res.json(picturesArray);
});

app.post("/rooms", (req, res) => {
  // skriv hantering för rum som inte finns

  // Här tas det nyskapade rummet emot
  rooms.push(req.body.room)
  res.send(req.body.room)

  // Nytt rum
  io.emit("roomCreated", req.body.room);
});

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
        pixel.color = msg.color;
      }
    }
    console.log(picturesArray);

    io.emit("drawing", msg);
  });

  socket.on("new room", function(roomName) {
    let newRoom = {"roomName": roomName}
    rooms.push(newRoom)
    io.emit("new room", roomName)
  })
});

server.listen(port, () => {
  console.log("listens to port " + port);
});

module.exports = app;
