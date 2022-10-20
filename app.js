const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname));
let players = {};

const checkUsernameExists = (username) => {
  let isUniq = true;
  Array.from(players).forEach((player) => {
    if (player.name === username) return (isUniq = false);
  });
  isUniq
    ? console.log("Username is unique")
    : console.log("Username was not unique");
  return isUniq;
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  let username = `User${Math.random().toFixed(7).toString().slice(2, 7)}`;
  if (checkUsernameExists(username))
    username = `User${Math.random().toFixed(9).toString().slice(4, 9)}`;
  players[socket.id] = {
    name: username,
  };

  socket.on("setUsername", (details) => {
    if (details.name !== null) {
      players[socket.id].name = details.name;
      return io.emit("players", players)
    }
    socket.emit("noUsername", { name: players[socket.id].name });
  });

  io.emit("players", players);
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
