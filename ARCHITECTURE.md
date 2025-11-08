# Architecture Overview

## System Diagram

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   Client App    │◄───────────────►│   Server App    │
│                 │   (Socket.io)   │                 │
│ - HTML Canvas   │                 │ - Room Manager  │
│ - Drawing UI    │                 │ - Drawing State │
│ - WebSocket     │                 │ - User Sessions │
│ - Event Handlers│                 │ - Operation Log │
└─────────────────┘                 └─────────────────┘
```

The application follows a client-server architecture where the client handles user interface and canvas rendering, while the server manages real-time communication, state synchronization, and user coordination.

## Component Responsibilities and Data Flow

**Client Components:**
- **Canvas Manager**: Handles HTML5 canvas operations, drawing paths, and user input events
- **WebSocket Manager**: Manages Socket.io connections, event handling, and message sending
- **UI Components**: Toolbar controls, user list display, and cursor indicators
- **App Controller**: Coordinates between components and manages application state

**Server Components:**
- **HTTP Server**: Serves static client files and handles initial connections
- **WebSocket Server**: Manages real-time bidirectional communication
- **Room Manager**: Tracks users, rooms, and shared state
- **Drawing State**: Maintains canvas operations, undo/redo history, and conflict resolution

**Data Flow:**
1. User performs drawing action on client
2. Client sends operation data to server via WebSocket
3. Server validates and stores operation in room state
4. Server broadcasts operation to all other clients in the room
5. Clients receive and render the operation on their canvases

## Key Design Decisions and Trade-offs

- **In-memory state management**: Chose not to use external databases for simplicity, accepting that data is lost on server restart (justification: for a demonstration project, this reduces complexity and external dependencies while keeping focus on real-time mechanics).
- **Per-user undo/redo with global impact**: Implemented undo operations that affect the shared canvas rather than just the user's local changes, ensuring consistency across all users (justification: collaborative tools require shared history to maintain a coherent experience, even if it feels less intuitive than local undo).
- **Client-side canvas rendering**: All drawing operations are rendered in the browser using HTML5 Canvas, minimizing server load (justification: modern browsers handle canvas operations efficiently, and this approach keeps the server focused on communication rather than graphics processing).
- **Single shared room**: All users collaborate in one global space instead of separate rooms, simplifying the architecture (justification: for a prototype, this eliminates room management complexity while still demonstrating core collaborative features).
- **Vanilla JavaScript implementation**: No frontend frameworks or build tools to keep the project lightweight and focused (justification: the application is small enough that framework overhead would exceed the benefits, and vanilla JS ensures broad browser compatibility).

## Deployment Considerations, Scaling, and Monitoring

**Deployment:**
- Single Node.js process serving static files and WebSocket connections
- Can be deployed to any platform supporting Node.js (Heroku, DigitalOcean, AWS, etc.)
- Requires environment variable configuration for production ports

**Scaling:**
- Horizontal scaling possible with load balancer, but requires shared state solution (Redis/MongoDB)
- Current implementation limited to single server instance due to in-memory state
- Canvas operations are lightweight, but large user counts may require connection limits

**Monitoring:**
- Basic health checks via HTTP endpoints
- Socket.io connection monitoring for active user counts
- Memory usage tracking for canvas state size
- Error logging for connection failures and operation conflicts

## Security and Data-Privacy Considerations

**Security:**
- No authentication required for basic usage (suitable for public demos)
- WebSocket connections should use HTTPS in production to encrypt drawing data
- Input validation on drawing operations to prevent malicious data
- Rate limiting could be added to prevent abuse in high-traffic scenarios

**Data Privacy:**
- No personal data collection or storage
- Drawing data consists only of coordinates, colors, and tool selections
- User identifiers are temporary Socket.io session IDs
- No cookies or tracking mechanisms implemented

## Why I Chose This Approach

I selected Socket.io for real-time communication because it provides reliable WebSocket connections with automatic fallback to HTTP polling, and chose vanilla JavaScript for the frontend to keep the project simple and focused on core real-time drawing functionality without framework complexity.
