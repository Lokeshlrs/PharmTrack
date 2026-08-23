import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to PharmTrack Backend:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected from server');
    });
  }
  return socket;
};

export const subscribeToEvent = (event: string, callback: (data: any) => void) => {
  const s = getSocket();
  s.on(event, callback);
  return () => {
    s.off(event, callback);
  };
};
