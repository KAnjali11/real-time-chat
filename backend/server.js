const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (name) => {
    socket.broadcast.emit("chat message", { user: "System", text: `${name} joined the chat` });
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("stop typing", (name) => {
    socket.broadcast.emit("stop typing", name);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
