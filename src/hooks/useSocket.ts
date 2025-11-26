'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.tenantId) {
      return;
    }

    const socket = io('/api/socket/io', {
      auth: {
        tenantId: user.tenantId,
      },
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user?.tenantId]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}