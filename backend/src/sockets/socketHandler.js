import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (httpServer, clientUrls) => {
  const origins = clientUrls
    ? clientUrls.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : ['https://lokeshlrs.github.io', 'http://localhost:5173', 'http://localhost:8443', 'http://localhost:3000'];

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const cleanOrigin = origin ? origin.replace(/\/$/, '') : '';
        if (
          !origin ||
          origins.includes(cleanOrigin) ||
          cleanOrigin.endsWith('.github.io') ||
          cleanOrigin.includes('localhost') ||
          cleanOrigin.includes('127.0.0.1')
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Allow clients to join role-specific or facility-specific rooms
    socket.on('join:room', (room) => {
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

/**
 * Emit an event across connected clients or specific rooms
 */
export const emitEvent = (event, data, room = null) => {
  if (!ioInstance) {
    return;
  }
  if (room) {
    ioInstance.to(room).emit(event, data);
  } else {
    ioInstance.emit(event, data);
  }
  console.log(`[Socket.IO Broadcast] Emitted event '${event}' with payload:`, typeof data === 'object' ? data.id || data.entityId || data.message || '(object)' : data);
};
