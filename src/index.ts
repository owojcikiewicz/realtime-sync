import dotenv from "dotenv";
import express from "express";
import path from "path";
import * as db from "./services/db";
import * as http from "http";
import * as socket from "socket.io";
import ConnectionHandler from "./handlers/connection";
import MissingElementsHandler from "./handlers/missingelements";
import ChangeDataHandler from "./handlers/changedata";
import ChangeDataOfflineHandler from "./handlers/changedataoffline";

(async () => {
    dotenv.config();

    // Setup Database. 
    await db.setup();

    // Initialize Express app. 
    const app: express.Application = express();
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "../public")));

    // Setup Socket and HTTP server. 
    const server: http.Server = http.createServer(app); 
    const io: socket.Server = new socket.Server(server, {});

    // Setup Socket handlers.
    io.on("connection", async (socket: socket.Socket) => {
        ConnectionHandler(io, socket);

        socket.on("sendMissingElements", (data: string) => {
            MissingElementsHandler(io, socket, JSON.parse(data));
        });

        socket.on("changeData", (data: string) => {
            ChangeDataHandler(io, socket, JSON.parse(data));
        });

        socket.on("changeDataOffline", (data: string) => {
            ChangeDataOfflineHandler(io, socket, JSON.parse(data));
        });
    });

    // Listen on port. 
    server.listen(process.env.APP_PORT, () => {
        console.log(`Server is running on port ${process.env.APP_PORT}`);
    });
})();