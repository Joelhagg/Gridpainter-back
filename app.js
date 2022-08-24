var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


let picturesArray = [
    {
        position: "1-1",
        color: "white"
    },
    {
        position: "1-2",
        color: "white"
    },
    {
        position: "1-3",
        color: "white"
    },
    {
        position: "1-4",
        color: "white"
    },
    {
        position: "1-5",
        color: "white"
    },
    {
        position: "1-6",
        color: "white"
    },
    {
        position: "1-7",
        color: "white"
    },
    {
        position: "1-8",
        color: "white"
    },
    {
        position: "1-9",
        color: "white"
    },
    {
        position: "1-10",
        color: "white"
    },
    {
        position: "1-11",
        color: "white"
    },
    {
        position: "1-12",
        color: "white"
    },
    {
        position: "1-13",
        color: "white"
    },
    {
        position: "1-14",
        color: "white"
    },
    {
        position: "1-15",
        color: "white"
    },

    ////////////////////////////

    {
        position: "2-1",
        color: "white"
    },
    {
        position: "2-2",
        color: "white"
    },
    {
        position: "2-3",
        color: "white"
    },
    {
        position: "2-4",
        color: "white"
    },
    {
        position: "2-5",
        color: "white"
    },
    {
        position: "2-6",
        color: "white"
    },
    {
        position: "2-7",
        color: "white"
    },
    {
        position: "2-8",
        color: "white"
    },
    {
        position: "2-9",
        color: "white"
    },
    {
        position: "2-10",
        color: "white"
    },
    {
        position: "2-11",
        color: "white"
    },
    {
        position: "2-12",
        color: "white"
    },
    {
        position: "2-13",
        color: "white"
    },
    {
        position: "2-14",
        color: "white"
    },
    {
        position: "2-15",
        color: "white"
    },


    ////////////////////////////

    {
        position: "3-1",
        color: "white"
    },
    {
        position: "3-2",
        color: "white"
    },
    {
        position: "3-3",
        color: "white"
    },
    {
        position: "3-4",
        color: "white"
    },
    {
        position: "3-5",
        color: "white"
    },
    {
        position: "3-6",
        color: "white"
    },
    {
        position: "3-7",
        color: "white"
    },
    {
        position: "3-8",
        color: "white"
    },
    {
        position: "3-9",
        color: "white"
    },
    {
        position: "3-10",
        color: "white"
    },
    {
        position: "3-11",
        color: "white"
    },
    {
        position: "3-12",
        color: "white"
    },
    {
        position: "3-13",
        color: "white"
    },
    {
        position: "3-14",
        color: "white"
    },
    {
        position: "3-15",
        color: "white"
    },



    ////////////////////////////


    {
        position: "4-1",
        color: "white"
    },
    {
        position: "4-2",
        color: "white"
    },
    {
        position: "4-3",
        color: "white"
    },
    {
        position: "4-4",
        color: "white"
    },
    {
        position: "4-5",
        color: "white"
    },
    {
        position: "4-6",
        color: "white"
    },
    {
        position: "4-7",
        color: "white"
    },
    {
        position: "4-8",
        color: "white"
    },
    {
        position: "4-9",
        color: "white"
    },
    {
        position: "4-10",
        color: "white"
    },
    {
        position: "4-11",
        color: "white"
    },
    {
        position: "4-12",
        color: "white"
    },
    {
        position: "4-13",
        color: "white"
    },
    {
        position: "4-14",
        color: "white"
    },
    {
        position: "4-15",
        color: "white"
    },

    ////////////////////////////

    {
        position: "5-1",
        color: "white"
    },
    {
        position: "5-2",
        color: "white"
    },
    {
        position: "5-3",
        color: "white"
    },
    {
        position: "5-4",
        color: "white"
    },
    {
        position: "5-5",
        color: "white"
    },
    {
        position: "5-6",
        color: "white"
    },
    {
        position: "5-7",
        color: "white"
    },
    {
        position: "5-8",
        color: "white"
    },
    {
        position: "5-9",
        color: "white"
    },
    {
        position: "5-10",
        color: "white"
    },
    {
        position: "5-11",
        color: "white"
    },
    {
        position: "5-12",
        color: "white"
    },
    {
        position: "5-13",
        color: "white"
    },
    {
        position: "5-14",
        color: "white"
    },
    {
        position: "5-15",
        color: "white"
    },


    ////////////////////////////

    {
        position: "6-1",
        color: "white"
    },
    {
        position: "6-2",
        color: "white"
    },
    {
        position: "6-3",
        color: "white"
    },
    {
        position: "6-4",
        color: "white"
    },
    {
        position: "6-5",
        color: "white"
    },
    {
        position: "6-6",
        color: "white"
    },
    {
        position: "6-7",
        color: "white"
    },
    {
        position: "6-8",
        color: "white"
    },
    {
        position: "6-9",
        color: "white"
    },
    {
        position: "6-10",
        color: "white"
    },
    {
        position: "6-11",
        color: "white"
    },
    {
        position: "6-12",
        color: "white"
    },
    {
        position: "6-13",
        color: "white"
    },
    {
        position: "6-14",
        color: "white"
    },
    {
        position: "6-15",
        color: "white"
    },


    ////////////////////////////

    {
        position: "7-1",
        color: "white"
    },
    {
        position: "7-2",
        color: "white"
    },
    {
        position: "7-3",
        color: "white"
    },
    {
        position: "7-4",
        color: "white"
    },
    {
        position: "7-5",
        color: "white"
    },
    {
        position: "7-6",
        color: "white"
    },
    {
        position: "7-7",
        color: "white"
    },
    {
        position: "7-8",
        color: "white"
    },
    {
        position: "7-9",
        color: "white"
    },
    {
        position: "7-10",
        color: "white"
    },
    {
        position: "7-11",
        color: "white"
    },
    {
        position: "7-12",
        color: "white"
    },
    {
        position: "7-13",
        color: "white"
    },
    {
        position: "7-14",
        color: "white"
    },
    {
        position: "7-15",
        color: "white"
    },


    ////////////////////////////

    {
        position: "8-1",
        color: "white"
    },
    {
        position: "8-2",
        color: "white"
    },
    {
        position: "8-3",
        color: "white"
    },
    {
        position: "8-4",
        color: "white"
    },
    {
        position: "8-5",
        color: "white"
    },
    {
        position: "8-6",
        color: "white"
    },
    {
        position: "8-7",
        color: "white"
    },
    {
        position: "8-8",
        color: "white"
    },
    {
        position: "8-9",
        color: "white"
    },
    {
        position: "8-10",
        color: "white"
    },
    {
        position: "8-11",
        color: "white"
    },
    {
        position: "8-12",
        color: "white"
    },
    {
        position: "8-13",
        color: "white"
    },
    {
        position: "8-14",
        color: "white"
    },
    {
        position: "8-15",
        color: "white"
    },



    ////////////////////////////


    {
        position: "9-1",
        color: "white"
    },
    {
        position: "9-2",
        color: "white"
    },
    {
        position: "9-3",
        color: "white"
    },
    {
        position: "9-4",
        color: "white"
    },
    {
        position: "9-5",
        color: "white"
    },
    {
        position: "9-6",
        color: "white"
    },
    {
        position: "9-7",
        color: "white"
    },
    {
        position: "9-8",
        color: "white"
    },
    {
        position: "9-9",
        color: "white"
    },
    {
        position: "9-10",
        color: "white"
    },
    {
        position: "9-11",
        color: "white"
    },
    {
        position: "9-12",
        color: "white"
    },
    {
        position: "9-13",
        color: "white"
    },
    {
        position: "9-14",
        color: "white"
    },
    {
        position: "9-15",
        color: "white"
    },

    ////////////////////////////

    {
        position: "10-1",
        color: "white"
    },
    {
        position: "10-2",
        color: "white"
    },
    {
        position: "10-3",
        color: "white"
    },
    {
        position: "10-4",
        color: "white"
    },
    {
        position: "10-5",
        color: "white"
    },
    {
        position: "10-6",
        color: "white"
    },
    {
        position: "10-7",
        color: "white"
    },
    {
        position: "10-8",
        color: "white"
    },
    {
        position: "10-9",
        color: "white"
    },
    {
        position: "10-10",
        color: "white"
    },
    {
        position: "10-11",
        color: "white"
    },
    {
        position: "10-12",
        color: "white"
    },
    {
        position: "10-13",
        color: "white"
    },
    {
        position: "10-14",
        color: "white"
    },
    {
        position: "10-15",
        color: "white"
    },


    ////////////////////////////

    {
        position: "11-1",
        color: "white"
    },
    {
        position: "11-2",
        color: "white"
    },
    {
        position: "11-3",
        color: "white"
    },
    {
        position: "11-4",
        color: "white"
    },
    {
        position: "11-5",
        color: "white"
    },
    {
        position: "11-6",
        color: "white"
    },
    {
        position: "11-7",
        color: "white"
    },
    {
        position: "11-8",
        color: "white"
    },
    {
        position: "11-9",
        color: "white"
    },
    {
        position: "11-10",
        color: "white"
    },
    {
        position: "11-11",
        color: "white"
    },
    {
        position: "11-12",
        color: "white"
    },
    {
        position: "11-13",
        color: "white"
    },
    {
        position: "11-14",
        color: "white"
    },
    {
        position: "11-15",
        color: "white"
    },



    ////////////////////////////


    {
        position: "12-1",
        color: "white"
    },
    {
        position: "12-2",
        color: "white"
    },
    {
        position: "12-3",
        color: "white"
    },
    {
        position: "12-4",
        color: "white"
    },
    {
        position: "12-5",
        color: "white"
    },
    {
        position: "12-6",
        color: "white"
    },
    {
        position: "12-7",
        color: "white"
    },
    {
        position: "12-8",
        color: "white"
    },
    {
        position: "12-9",
        color: "white"
    },
    {
        position: "12-10",
        color: "white"
    },
    {
        position: "12-11",
        color: "white"
    },
    {
        position: "12-12",
        color: "white"
    },
    {
        position: "12-13",
        color: "white"
    },
    {
        position: "12-14",
        color: "white"
    },
    {
        position: "12-15",
        color: "white"
    },

    ////////////////////////////

    {
        position: "13-1",
        color: "white"
    },
    {
        position: "13-2",
        color: "white"
    },
    {
        position: "13-3",
        color: "white"
    },
    {
        position: "13-4",
        color: "white"
    },
    {
        position: "13-5",
        color: "white"
    },
    {
        position: "13-6",
        color: "white"
    },
    {
        position: "13-7",
        color: "white"
    },
    {
        position: "13-8",
        color: "white"
    },
    {
        position: "13-9",
        color: "white"
    },
    {
        position: "13-10",
        color: "white"
    },
    {
        position: "13-11",
        color: "white"
    },
    {
        position: "13-12",
        color: "white"
    },
    {
        position: "13-13",
        color: "white"
    },
    {
        position: "13-14",
        color: "white"
    },
    {
        position: "13-15",
        color: "white"
    },


    ////////////////////////////

    {
        position: "14-1",
        color: "white"
    },
    {
        position: "14-2",
        color: "white"
    },
    {
        position: "14-3",
        color: "white"
    },
    {
        position: "14-4",
        color: "white"
    },
    {
        position: "14-5",
        color: "white"
    },
    {
        position: "14-6",
        color: "white"
    },
    {
        position: "14-7",
        color: "white"
    },
    {
        position: "14-8",
        color: "white"
    },
    {
        position: "14-9",
        color: "white"
    },
    {
        position: "14-10",
        color: "white"
    },
    {
        position: "14-11",
        color: "white"
    },
    {
        position: "14-12",
        color: "white"
    },
    {
        position: "14-13",
        color: "white"
    },
    {
        position: "14-14",
        color: "white"
    },
    {
        position: "14-15",
        color: "white"
    },

    ////////////////////////////

    {
        position: "15-1",
        color: "white"
    },
    {
        position: "15-2",
        color: "white"
    },
    {
        position: "15-3",
        color: "white"
    },
    {
        position: "15-4",
        color: "white"
    },
    {
        position: "15-5",
        color: "white"
    },
    {
        position: "15-6",
        color: "white"
    },
    {
        position: "15-7",
        color: "white"
    },
    {
        position: "15-8",
        color: "white"
    },
    {
        position: "15-9",
        color: "white"
    },
    {
        position: "15-10",
        color: "white"
    },
    {
        position: "15-11",
        color: "white"
    },
    {
        position: "15-12",
        color: "white"
    },
    {
        position: "15-13",
        color: "white"
    },
    {
        position: "15-14",
        color: "white"
    },
    {
        position: "15-15",
        color: "white"
    },


];

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

module.exports = { app: app, server: server };
