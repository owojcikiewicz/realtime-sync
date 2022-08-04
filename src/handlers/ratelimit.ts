import * as socket from "socket.io";
import * as db from "./../services/db";
import {Input} from "./../entities/input";

export default async function(io: socket.Server, socket: socket.Socket, data: JSON) {
    const website: string = socket.request.headers.host;
    if (!website) {
        socket.disconnect(true);
        return;
    };
     
    const nextMessage: number = Math.round(data["msBeforeNext"] / 1000); 
    socket.emit("rateLimited", nextMessage);
};