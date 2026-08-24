import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    return url.replace(/\/api$/, '');
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

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
