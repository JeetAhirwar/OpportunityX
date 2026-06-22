import { io, type Socket } from "socket.io-client";
let socket: Socket | null = null;

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/api\/?$/, "") ||
  window.location.origin;

export const getChatSocket = () => {
  const token = localStorage.getItem("ox_token");
  if (!socket) {
    socket = io(socketUrl, { autoConnect: false, auth: { token } });
  }
  socket.auth = { token };
  return socket;
};

export const disconnectChatSocket = () => {
  socket?.disconnect();
  socket = null;
};
