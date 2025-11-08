// -----------------------------
// 🎨 Drawing State Management Module
// -----------------------------
class DrawingState {
  constructor(roomManager) {
    this.roomManager = roomManager;
  }

  // Process drawing operation
  processDraw(roomId, userId, data) {
    const operation = {
      type: 'draw',
      userId,
      data: {
        path: data.path || [[data.fromX, data.fromY], [data.toX, data.toY]],
        color: data.color,
        size: data.size,
        tool: data.tool
      },
      timestamp: Date.now()
    };
    this.roomManager.addOperation(roomId, operation);
    return operation;
  }

  // Process undo operation
  processUndo(roomId, userId) {
    const result = this.roomManager.undo(roomId, userId);
    if (result) {
      return {
        type: 'undo',
        userId,
        data: result,
        timestamp: Date.now()
      };
    }
    return null;
  }

  // Process redo operation
  processRedo(roomId, userId) {
    const result = this.roomManager.redo(roomId, userId);
    if (result) {
      return {
        type: 'redo',
        userId,
        data: result,
        timestamp: Date.now()
      };
    }
    return null;
  }

  // Get current state for new user
  getStateForNewUser(roomId) {
    const canvasState = this.roomManager.getCanvasState(roomId);
    const operations = this.roomManager.getOperations(roomId);
    const users = this.roomManager.getUsers(roomId);

    return {
      canvasState,
      operations,
      users
    };
  }

  // Validate operation (basic conflict resolution)
  validateOperation(roomId, operation) {
    // For now, accept all operations since they're timestamped
    // In a more complex system, we might check for conflicts
    return true;
  }

  // Get operation history for debugging
  getOperationHistory(roomId) {
    return this.roomManager.getOperations(roomId);
  }
}

module.exports = DrawingState;
