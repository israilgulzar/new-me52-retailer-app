// src/services/socket.ts
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { SOCKET_URL } from "../environment"

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,           // control when to connect
    transports: ["websocket"],    // try websocket directly (optional)
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
});

// helpers
export const connectSocket = (token?: string) => {
    console.log(`[socket] MAKE CONNECTION: ======> ${SOCKET_URL}`);
    if (token) socket.auth = { token };
    if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
    if (socket.connected)
        socket.disconnect();
};
