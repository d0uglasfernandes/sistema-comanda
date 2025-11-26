import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectWebSocket(tenantId: string) {
  if (socket) {
    socket.disconnect();
  }

  socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
    auth: {
      tenantId,
    },
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}