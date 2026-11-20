import { io } from "socket.io-client";
import api from "./api"

export const NEW_MESSAGE_EVENTS = [
    "message:new",
    "new_message",
    "newMessage",
    "receive_message",
    "message",
];

export const NEW_NOTIFICATION_EVENTS = ["notification:new", "new_notification", "notification"];
export const TYPING_START_EVENTS = ["typing:start", "typing_start", "typing:start"];
export const TYPING_STOP_EVENTS = ["typing:stop", "typing_stop", "typing:stop"];

export const emitConversationJoin = (conversationId) => {
  const s = connectSocket();
  s.emit("conversation:join", conversationId);
};

export const emitConversationLeave = (conversationId) => {
  const s = connectSocket();
  s.emit("conversation:leave", conversationId);
};

export const emitNotificationRead = (notificationId) => {
  const s = connectSocket();
  s.emit("notification:read", notificationId);
};

export const emitTyping = (conversationId, isTyping) => {
  const s = connectSocket();
  s.emit(isTyping ? "typing:start" : "typing:stop", conversationId);
};
const getToken = () =>  
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    "";
let socket = null;

export const getSocket = () => {
  if (socket) return socket;
  const url =
    import.meta.env.VITE_SOCKET_URL ||
    api.defaults.baseURL ||
    window.location.origin;
  socket = io(url, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
  });
  return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    s.auth = { token: getToken()};
    if(!s.connected) s.connect();
    return s;
};

export const disconnectSocket = () => {
    if(socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};