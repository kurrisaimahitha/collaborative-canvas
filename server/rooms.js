class RoomManager {
  constructor() {
    this.rooms = {};
  }

  createRoom(roomId) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {
        users: {},
        operations: [],
        canvasState: { paths: [], undoStack: [], redoStack: [] }
      };
    }
    return this.rooms[roomId];
  }

  joinRoom(roomId, userId, color) {
    const room = this.createRoom(roomId);
    room.users[userId] = { id: userId, color, cursor: { x: 0, y: 0 } };
    return room;
  }

  leaveRoom(roomId, userId) {
    const room = this.rooms[roomId];
    if (room) {
      delete room.users[userId];
      if (Object.keys(room.users).length === 0) {
        delete this.rooms[roomId];
      }
    }
  }

  getUsers(roomId) {
    const room = this.rooms[roomId];
    return room ? room.users : {};
  }

  updateCursor(roomId, userId, x, y) {
    const room = this.rooms[roomId];
    if (room && room.users[userId]) {
      room.users[userId].cursor = { x, y };
    }
  }

  addOperation(roomId, operation) {
    const room = this.rooms[roomId];
    if (room) {
      room.operations.push(operation);
      if (operation.type === 'draw') {
        room.canvasState.paths.push({ ...operation.data, userId: operation.userId });
      }
    }
  }

  undo(roomId, userId) {
    const room = this.rooms[roomId];
    if (!room || room.canvasState.paths.length === 0) return null;

    for (let i = room.canvasState.paths.length - 1; i >= 0; i--) {
      if (room.canvasState.paths[i].userId === userId) {
        const removedPath = room.canvasState.paths.splice(i, 1)[0];
        room.canvasState.undoStack.push(removedPath);
        return { path: removedPath };
      }
    }
    return null;
  }

  redo(roomId, userId) {
    const room = this.rooms[roomId];
    if (!room || room.canvasState.undoStack.length === 0) return null;

    for (let i = room.canvasState.undoStack.length - 1; i >= 0; i--) {
      if (room.canvasState.undoStack[i].userId === userId) {
        const restoredPath = room.canvasState.undoStack.splice(i, 1)[0];
        room.canvasState.paths.push(restoredPath);
        return { path: restoredPath };
      }
    }
    return null;
  }

  getCanvasState(roomId) {
    const room = this.rooms[roomId];
    return room ? room.canvasState : { paths: [], undoStack: [], redoStack: [] };
  }

  getRoom(roomId) {
    return this.rooms[roomId];
  }

  getOperations(roomId) {
    const room = this.rooms[roomId];
    return room ? room.operations : [];
  }
}

module.exports = RoomManager;
