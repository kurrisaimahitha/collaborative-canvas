class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentPath = [];
        this.paths = [];
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.eraserSize = 20;
        this.cursors = {};
        this.onDraw = null;
        this.onCursorMove = null;

        this.setupCanvas();
        this.bindEvents();
    }

    setupCanvas() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        this.canvas.addEventListener('mousemove', this.handleCursorMove.bind(this));
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.currentPath = [{ x, y }];
        this.drawPoint(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.currentPath.push({ x, y });
        this.drawLine(this.currentPath[this.currentPath.length - 2], { x, y });
    }

    stopDrawing() {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.currentPath.length > 1 && this.onDraw) {
            this.onDraw({
                path: this.currentPath,
                color: this.currentColor,
                size: this.currentTool === 'eraser' ? this.eraserSize : this.brushSize,
                tool: this.currentTool
            });
        }

        this.currentPath = [];
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleCursorMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.onCursorMove) {
            this.onCursorMove(x, y);
        }
    }

    drawPoint(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, (this.currentTool === 'eraser' ? this.eraserSize : this.brushSize) / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.currentTool === 'eraser' ? '#FFFFFF' : this.currentColor;
        this.ctx.fill();
    }

    drawLine(from, to) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#FFFFFF' : this.currentColor;
        this.ctx.lineWidth = this.currentTool === 'eraser' ? this.eraserSize : this.brushSize;
        this.ctx.stroke();
    }

    drawPathFromData(pathData) {
        if (!pathData.path || pathData.path.length < 2) return;

        this.ctx.strokeStyle = pathData.tool === 'eraser' ? '#FFFFFF' : pathData.color;
        this.ctx.lineWidth = pathData.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(pathData.path[0].x, pathData.path[0].y);

        for (let i = 1; i < pathData.path.length; i++) {
            this.ctx.lineTo(pathData.path[i].x, pathData.path[i].y);
        }

        this.ctx.stroke();
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.paths.forEach(pathData => {
            this.drawPathFromData(pathData);
        });
    }

    updateCanvasState(canvasState) {
        this.paths = canvasState.paths || [];
        this.redrawCanvas();
    }

    addRemoteDraw(data) {
        this.drawPathFromData(data);
        this.paths.push(data);
    }

    setTool(tool) {
        this.currentTool = tool;
        this.canvas.style.cursor = tool === 'eraser' ? 'grab' : 'crosshair';
    }

    setColor(color) {
        this.currentColor = color;
    }

    setBrushSize(size) {
        this.brushSize = size;
    }

    setEraserSize(size) {
        this.eraserSize = size;
    }

    addCursor(userId, x, y, color) {
        this.removeCursor(userId);

        const cursorDiv = document.createElement('div');
        cursorDiv.className = 'cursor-indicator';
        cursorDiv.id = `cursor-${userId}`;
        cursorDiv.style.left = `${x}px`;
        cursorDiv.style.top = `${y}px`;

        const pointer = document.createElement('div');
        pointer.className = 'cursor-pointer';
        pointer.style.borderBottomColor = color;

        const label = document.createElement('div');
        label.className = 'cursor-label';
        label.textContent = `User ${userId.slice(0, 4)}`;
        label.style.backgroundColor = color;

        cursorDiv.appendChild(pointer);
        cursorDiv.appendChild(label);

        document.body.appendChild(cursorDiv);
        this.cursors[userId] = cursorDiv;
    }

    updateCursor(userId, x, y) {
        const cursor = this.cursors[userId];
        if (cursor) {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        }
    }

    removeCursor(userId) {
        const cursor = this.cursors[userId];
        if (cursor) {
            cursor.remove();
            delete this.cursors[userId];
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.paths = [];
        Object.keys(this.cursors).forEach(userId => {
            this.removeCursor(userId);
        });
    }
}
