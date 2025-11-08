class App {
    constructor() {
        this.wsManager = new WebSocketManager();
        this.canvasManager = new CanvasManager('canvas');
        this.currentUserId = null;

        this.init();
        this.bindEvents();
    }

    init() {
        this.wsManager.connect();

        this.wsManager.onCanvasStateUpdate = (canvasState) => {
            this.canvasManager.updateCanvasState(canvasState);
            // Update the user list whenever canvas state is received
            this.updateUserList(this.wsManager.getUsers());
            // Update cursor positions for all users
            this.updateAllCursors(this.wsManager.getUsers());
        };

        this.wsManager.onDraw = (data) => {
            this.canvasManager.addRemoteDraw(data);
        };

        this.wsManager.onCursor = (data) => {
            this.canvasManager.updateCursor(data.userId, data.x, data.y);
        };

        this.wsManager.onUserJoined = (data) => {
            this.addUserToList(data.id, data.color);
            this.canvasManager.addCursor(data.id, 0, 0, data.color);
            // Also update the full user list to ensure consistency
            this.updateUserList(this.wsManager.getUsers());
        };

        this.wsManager.onUserLeft = (userId) => {
            this.removeUserFromList(userId);
            this.canvasManager.removeCursor(userId);
            // Also update the full user list to ensure consistency
            this.updateUserList(this.wsManager.getUsers());
        };

        this.wsManager.onClear = () => {
            this.canvasManager.clearCanvas();
        };

        this.canvasManager.onDraw = (data) => {
            this.wsManager.sendDraw(data);
        };

        this.canvasManager.onCursorMove = (x, y) => {
            this.wsManager.sendCursor(x, y);
        };
    }

    bindEvents() {
        // Tool buttons
        document.getElementById('brush-btn').addEventListener('click', () => {
            this.setActiveTool('brush');
            this.canvasManager.setTool('brush');
        });

        document.getElementById('eraser-btn').addEventListener('click', () => {
            this.setActiveTool('eraser');
            this.canvasManager.setTool('eraser');
        });

        // Color picker
        document.getElementById('color-picker').addEventListener('change', (e) => {
            this.canvasManager.setColor(e.target.value);
        });

        // Size slider
        const sizeSlider = document.getElementById('size-slider');
        const sizeValue = document.getElementById('size-value');

        sizeSlider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            sizeValue.textContent = size;
            this.canvasManager.setBrushSize(size);
        });

        // Action buttons
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.wsManager.sendUndo();
        });

        document.getElementById('redo-btn').addEventListener('click', () => {
            this.wsManager.sendRedo();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the entire canvas? This will affect all users.')) {
                this.wsManager.sendClear();
            }
        });
    }

    setActiveTool(tool) {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${tool}-btn`).classList.add('active');
    }

    addUserToList(userId, color) {
        const userList = document.getElementById('user-list');
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.id = `user-${userId}`;

        const colorDiv = document.createElement('div');
        colorDiv.className = 'user-color';
        colorDiv.style.backgroundColor = color;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'user-name';
        nameDiv.textContent = `User ${userId.slice(0, 4)}`;

        userItem.appendChild(colorDiv);
        userItem.appendChild(nameDiv);
        userList.appendChild(userItem);
    }

    removeUserFromList(userId) {
        const userItem = document.getElementById(`user-${userId}`);
        if (userItem) {
            userItem.remove();
        }
    }

    updateUserList(users) {
        const userList = document.getElementById('user-list');
        // Clear existing list
        userList.innerHTML = '';

        // Add all current users
        Object.values(users).forEach(user => {
            this.addUserToList(user.id, user.color);
        });
    }

    updateAllCursors(users) {
        // Update cursor positions for all users based on their stored cursor data
        Object.values(users).forEach(user => {
            if (user.cursor) {
                this.canvasManager.updateCursor(user.id, user.cursor.x, user.cursor.y);
            }
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
