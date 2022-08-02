import * as socket from "socket.io";
import * as db from "./../services/db";
import {Input} from "./../entities/input";

export default async function(io: socket.Server, socket: socket.Socket) {
    const website: string = socket.request.headers.host;
    if (!website) {
        socket.disconnect(true);
        return;
    };
    
    let repository = db.Connection.getRepository(Input);
    let data = await repository.find({where: {website: website}});
    if (data) {
        socket.emit("getInitialData", JSON.stringify(data));
    };

    socket.join(website);
};