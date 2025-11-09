# Real-Time Collaborative Drawing Canvas

This is a web-based drawing application that enables multiple users to collaborate on a shared canvas in real-time, featuring smooth drawing tools, user awareness indicators, and operation history management.

## Motivation

I built this project to explore real-time web technologies and understand the challenges of synchronizing user interactions across multiple clients. As someone learning about multiplayer applications, I wanted to create a practical example of WebSocket communication and canvas state management that demonstrates how collaborative tools can work without lag or data conflicts.

## Key Features

- **Real-time collaboration**: Multiple users can draw simultaneously with instant synchronization across all connected clients
- **Drawing tools**: Brush and eraser tools with adjustable size and color options
- **User awareness**: Live cursor tracking shows where each user is positioned on the canvas
- **Operation history**: Per-user undo/redo functionality that maintains global canvas consistency
- **Responsive design**: Works seamlessly on both desktop and mobile devices
- **Room-based system**: All users share a single collaborative drawing space

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/kurrisaimahitha/collaborative-canvas.git
   cd collaborative-canvas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in multiple browser tabs to test collaborative drawing.

## Demo

A live demo is available at: [https://collaborative-canvas-kurri.herokuapp.com](https://collaborative-canvas-kurri.herokuapp.com)

## Basic Usage

- **Drawing**: Click and drag on the canvas to draw with the currently selected tool
- **Tool selection**: Click the brush or eraser buttons to switch drawing modes
- **Customization**: Use the color picker to change brush color and the size slider to adjust brush thickness
- **History management**: Use undo/redo buttons to manage your drawing operations
- **Collaboration**: Open the application in multiple browser windows to see real-time collaboration in action

## Architecture

For detailed technical information about the system design and implementation decisions, see [ARCHITECTURE.md](ARCHITECTURE.md). The application uses a client-server architecture with WebSocket connections for real-time communication.

## Testing and Limitations

I tested the application by opening multiple browser tabs and performing simultaneous drawing operations to verify real-time synchronization. The app performs well for small to medium groups (up to 10 concurrent users) but may experience performance degradation with very large canvases or high user counts. Current limitations include lack of persistent storage (drawings are lost when the server restarts) and basic conflict resolution that works for simple drawing scenarios but could be enhanced for more complex collaborative workflows.

## Notes from the Author

Building this project helped me understand the complexities of maintaining shared state in real-time applications and the importance of efficient client-server communication patterns.
