const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname));
let players = new Map();

const isUnique = (username) => {
  let isUniq = true;
  for (let player in players) {
    console.log(player)
    if (players[player].name === username) return (isUniq = false);
  }
  return isUniq;
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  let username = `User${Math.random().toFixed(7).toString().slice(2, 7)}`;
  if (!isUnique(username))
    username = `User${Math.random().toFixed(9).toString().slice(4, 9)}`;
  players[socket.id] = {
    name: username,
    x: 0,
    y: 0,
    active: false
  };
  // all players location refresh on every 10ms
  setInterval(() => {
    io.emit("players", players);
  }, 10);

  socket.on("setUsername", (details) => {
    let username;
    if (details.name !== null) {
      username = details.name;
      if (!isUnique(username))
        username = `User${Math.random().toFixed(9).toString().slice(4, 9)}`;
      players[socket.id].name = username;
    }
    socket.emit("noUsername", { name: players[socket.id].name });

    players[socket.id].active = true;
  });

  socket.on("right", (playerName) => {
    for(let player in players){
      player = players[player];
      if(player.name === playerName) return player.x += 1;
    }
  });
  socket.on("left", (playerName) => {
    for(let player in players){
      player = players[player];
      if(player.name === playerName) return player.x -= 1;
    }
  });
  socket.on("top", (playerName) => {
    for(let player in players){
      player = players[player];
      if(player.name === playerName) return player.y -= 1;
    }
  });
  socket.on("down", (playerName) => {
    for(let player in players){
      player = players[player];
      if(player.name === playerName) return player.y += 1;
    }
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
