import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api';

export function useSocket(onEvent: (event: string, payload: unknown) => void, events: string[]) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('mediflow:token');
    if (!token) return;

    const socket = io(API_BASE_URL || '/', {
      path: '/socket.io',
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.error('Socket connection failed', err.message);
    });

    events.forEach((event) => {
      socket.on(event, (payload) => onEvent(event, payload));
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}