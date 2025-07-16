import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: { token },
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
