import * as socket from "socket.io";
import * as db from "./../services/db";
import {Input} from "./../entities/input";

export default async function(io: socket.Server, socket: socket.Socket, data: JSON) {
    const website: string = socket.request.headers.host;
    if (!website) {
        socket.disconnect(true);
        return;
    };
    
    let repository = db.Connection.getRepository(Input);
    for (let elementName in data) {
        const element = data[elementName];

        let missingElement = new Input();
        missingElement.website = website;
        missingElement.name = elementName;
        missingElement.value = JSON.stringify(element);
        await repository.save(missingElement);
    };
};