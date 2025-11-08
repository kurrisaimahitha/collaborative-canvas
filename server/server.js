const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./rooms');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 4000;
const DEFAULT_ROOM = 'main-room';

app.use(express.static(path.join(__dirname, '../client')));

const roomManager = new RoomManager();

const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  const color = userColors[Object.keys(roomManager.getUsers(DEFAULT_ROOM)).length % userColors.length];
  roomManager.joinRoom(DEFAULT_ROOM, socket.id, color);

  const state = roomManager.getCanvasState(DEFAULT_ROOM);
  const users = roomManager.getUsers(DEFAULT_ROOM);
  socket.emit('canvasState', { canvasState: state, users });

  io.to(DEFAULT_ROOM).emit('userJoined', { id: socket.id, color });

  socket.join(DEFAULT_ROOM);

  socket.on('draw', (data) => {
    const operation = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type: 'draw',
      data: data,
      userId: socket.id,
      timestamp: Date.now()
    };

    roomManager.addOperation(DEFAULT_ROOM, operation);

    socket.to(DEFAULT_ROOM).emit('draw', { ...data, userId: socket.id });

    const updatedState = roomManager.getCanvasState(DEFAULT_ROOM);
    io.to(DEFAULT_ROOM).emit('canvasState', { canvasState: updatedState, users: roomManager.getUsers(DEFAULT_ROOM) });
  });

  socket.on('cursor', (data) => {
    roomManager.updateCursor(DEFAULT_ROOM, socket.id, data.x, data.y);
    // Broadcast cursor position to ALL users in the room, including the sender
    io.to(DEFAULT_ROOM).emit('cursor', { userId: socket.id, x: data.x, y: data.y, color });
  });

  socket.on('undo', () => {
    const result = roomManager.undo(DEFAULT_ROOM, socket.id);
    if (result) {
      console.log(`Undo performed by ${socket.id}`);
      const updatedState = roomManager.getCanvasState(DEFAULT_ROOM);
      io.to(DEFAULT_ROOM).emit('canvasState', { canvasState: updatedState, users: roomManager.getUsers(DEFAULT_ROOM) });
    }
  });

  socket.on('redo', () => {
    const result = roomManager.redo(DEFAULT_ROOM, socket.id);
    if (result) {
      console.log(`Redo performed by ${socket.id}`);
      const updatedState = roomManager.getCanvasState(DEFAULT_ROOM);
      io.to(DEFAULT_ROOM).emit('canvasState', { canvasState: updatedState, users: roomManager.getUsers(DEFAULT_ROOM) });
    }
  });

  socket.on('clear', () => {
    roomManager.getRoom(DEFAULT_ROOM).canvasState = { paths: [], undoStack: [], redoStack: [] };
    roomManager.getRoom(DEFAULT_ROOM).operations = [];
    io.to(DEFAULT_ROOM).emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    roomManager.leaveRoom(DEFAULT_ROOM, socket.id);
    io.to(DEFAULT_ROOM).emit('userLeft', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
