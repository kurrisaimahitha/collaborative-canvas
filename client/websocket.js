class WebSocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentUserId = null;
        this.users = {};
        this.onCanvasStateUpdate = null;
        this.onDraw = null;
        this.onCursor = null;
        this.onUserJoined = null;
        this.onUserLeft = null;
        this.onClear = null;
    }

    connect() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.currentUserId = this.socket.id;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
        });

        this.socket.on('canvasState', (data) => {
            this.users = data.users;
            if (this.onCanvasStateUpdate) {
                this.onCanvasStateUpdate(data.canvasState);
            }
        });

        this.socket.on('draw', (data) => {
            if (this.onDraw) {
                this.onDraw(data);
            }
        });

        this.socket.on('cursor', (data) => {
            if (this.onCursor) {
                this.onCursor(data);
            }
        });

        this.socket.on('userJoined', (data) => {
            this.users[data.id] = { id: data.id, color: data.color };
            if (this.onUserJoined) {
                this.onUserJoined(data);
            }
        });

        this.socket.on('userLeft', (userId) => {
            delete this.users[userId];
            if (this.onUserLeft) {
                this.onUserLeft(userId);
            }
        });

        this.socket.on('clear', () => {
            if (this.onClear) {
                this.onClear();
            }
        });
    }

    sendDraw(data) {
        if (this.isConnected) {
            this.socket.emit('draw', data);
        }
    }

    sendCursor(x, y) {
        if (this.isConnected) {
            this.socket.emit('cursor', { x, y });
        }
    }

    sendUndo() {
        if (this.isConnected) {
            this.socket.emit('undo');
        }
    }

    sendRedo() {
        if (this.isConnected) {
            this.socket.emit('redo');
        }
    }

    sendClear() {
        if (this.isConnected) {
            this.socket.emit('clear');
        }
    }

    getCurrentUserId() {
        return this.currentUserId;
    }

    getUsers() {
        return this.users;
    }
}
