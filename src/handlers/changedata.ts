import * as socket from "socket.io";
import * as db from "./../services/db";
import {Input} from "./../entities/input";

export default async function(io: socket.Server, socket: socket.Socket, data: JSON) {
    const website: string = socket.request.headers.host;
    if (!website) {
        socket.disconnect(true);
        return;
    };

    const category = Object.keys(data)[0]
    socket.broadcast.to(website).emit("receivedChanges", JSON.stringify(data));

    let repository = db.Connection.getRepository(Input);
    let input = await repository.findOneBy({website: website, name: category});
    input.value = JSON.stringify(data[category]);
    await repository.save(input);
};