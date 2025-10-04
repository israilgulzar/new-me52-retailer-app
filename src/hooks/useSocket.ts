import { useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

export default function useSocket(token?: string) {

    const [connected, setConnected] = useState(socket.connected);
    const { users } = useAuth();

    useEffect(() => {

        console.log("useSocket");

        // connect when token (or on mount)
        if (token) connectSocket(token);
        else connectSocket();

        const onConnect = () => {
            console.log(`[socket] Connected: ======> ${users.id}`);
            if (users?.id) {
                socket.emit("joinRoom", users.id);
            }
            setConnected(true);
        };

        const onDisconnect = () => {
            console.log(`[socket] Disconnected: ======> ${socket.id}`);
            setConnected(false);
        };

        const onError = (err: any) => console.warn("socket error:", err);

        socket.on("userJoined", () => {
            console.log("userJoined");
        });
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onError);
            disconnectSocket();
        };

    }, []);

    return { socket, connected };

}
