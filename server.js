const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const fs = require("fs");
var async = require('async');
const multer=require('multer')
const upload=multer()
const bodyParser = require("body-parser");
const cors = require("cors");

// const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var publicDir = require("path").join(__dirname, "/uploads");
app.use(express.static(__dirname + "/"));

var cache = {};
var put = function (key, value, expire) {
  var exp = expire * 1000 + Date.now();
  var record = { value: value, expire: exp };
  cache[key] = record;
};

var del = function (key) {
  delete cache[key];
};

app.get("/", (req, res, next) => {
  res.send("Server is up and running");
});

app.post("/upload", upload.single("file"), function (req, res) {
  console.log(req.file);
  console.log(req.body);
  console.log("_________________________________");
  fs.readFile(req.file.path, function (err, data) {
    if (err) {
      console.log("Cannot readFile");
      res.send(500, "file Cannot be found");
    } else {
      fs.writeFile(
        __dirname + "/uploads/" + req.file.originalName,
        data,
        function (err, result) {
          if (err) {
            console.log(err);
            res.send(500, "Error in upload");
          } else {
            put(req.file.originalName, 6);
            res.send("File Uploaded");
          }
        }
      );
    }
  });
});

var Sockets = [];
io.sockets.on("connection", function (socket) {
  Sockets.push(socket);
});

var Sockets = [];
io.sockets.on("connection", function (socket) {
  Sockets.push(socket);
});

var async = require("async");
function cacheListener() {
  if (Object.keys(cache).length != 0) {
    async.each(
      Object.keys(cache),
      function (item, iterate) {
        if (cache[item].expire < Date.now()) del(item);
        else iterate();
      },
      function (err) {
        console.log(err);
      }
    );
    setTimeout(function () {
      for (var i = Sockets.length - 1; i >= 0; i--) {
        Sockets[i].send(cache);
      }
      cacheListener();
      //console.log('listener working');
    }, 1000);
  } else {
    setTimeout(function () {
      for (var i = Sockets.length - 1; i >= 0; i--) {
        Sockets[i].send(cache);
      }
      cacheListener();
      //console.log('listener working');
    }, 1000);
  }
}
cacheListener();

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
