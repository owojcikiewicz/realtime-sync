import * as socket from "socket.io";
import * as db from "./../services/db";
import {Input} from "./../entities/input";

export default async function(io: socket.Server, socket: socket.Socket, data: JSON) {
    const website: string = socket.request.headers.host;
    if (!website) {
        socket.disconnect(true);
        return;
    };
    
    const payload = data["payload"];
    const category = Object.keys(payload)[0];
    const dataset = data["dataset"][category];

    let repository = db.Connection.getRepository(Input);
    let input = await repository.findOneBy({website: website, name: category});
    if (input) {
        const currentDataset = JSON.parse(input.value);

        // If edits were made on an outdated dataset, discard them. 
        if (JSON.stringify(dataset) === JSON.stringify(currentDataset)) {
            socket.broadcast.to(website).emit("receivedChanges", JSON.stringify(payload));
            input.value = JSON.stringify(payload[category]);
            await repository.save(input);
        };
    };
};