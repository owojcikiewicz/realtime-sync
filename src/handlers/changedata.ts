import * as socket from "socket.io";
import * as db from "./../services/db";
import {Input} from "./../entities/input";

export default async function(io: socket.Server, socket: socket.Socket, data: JSON) {
    const website: string = socket.request.headers.host;
    if (!website) {
        socket.disconnect(true);
        return;
    };

    const changes = data["changes"];
    const payload = changes[Object.keys(changes)[0]];
    socket.broadcast.to(website).emit("receivedChanges", JSON.stringify(payload));

    let repository = db.Connection.getRepository(Input);
    let input = await repository.findOneBy({website: website, name: Object.keys(changes)[0]});
    input.value = JSON.stringify(payload);
    await repository.save(input);
};