import * as db from "./../services/db";
import {Input} from "./../entities/input";
import * as socket from "socket.io";

export default async function(io: socket.Server, socket: socket.Socket) {
    const website: string = socket.request.headers.host;
    if (!website) {
        socket.disconnect(true);
        return;
    };
    
    let repository = db.Connection.getRepository(Input);
    let data = await repository.find({where: {website: website}});
    if (data && data.length > 0) {
        socket.emit("getInitialData", JSON.stringify(data));
    };

    socket.join(website);
};