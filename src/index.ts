import dotenv from "dotenv";
import express from "express";
import path from "path";
import * as db from "./services/db";
import * as http from "http";
import * as socket from "socket.io";
import {RateLimiterMemory} from "rate-limiter-flexible";
import ConnectionHandler from "./handlers/connection";
import MissingElementsHandler from "./handlers/missingelements";
import ChangeDataHandler from "./handlers/changedata";
import ChangeDataOfflineHandler from "./handlers/changedataoffline";
import RateLimitHandler from "./handlers/ratelimit";

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

    // Setup Rate Limiter.
    const rateLimiter: RateLimiterMemory = new RateLimiterMemory({
        points: parseInt(process.env.RATE_LIMIT_PERMINUTE),
        duration: 60,
    });

    // Setup Socket handlers.
    io.on("connection", async (socket: socket.Socket) => {
        ConnectionHandler(io, socket);

        socket.on("sendMissingElements", async (data: string) => {
            try {
                await rateLimiter.consume(socket.handshake.address);
                MissingElementsHandler(io, socket, JSON.parse(data));
            }
            catch(ex) {
                RateLimitHandler(io, socket, JSON.parse(ex));
            };
        });

        socket.on("changeData", async (data: string) => {
            try {
                await rateLimiter.consume(socket.handshake.address);
                ChangeDataHandler(io, socket, JSON.parse(data));
            }
            catch(ex) {
                RateLimitHandler(io, socket, JSON.parse(ex));
            };
        });

        socket.on("changeDataOffline", async (data: string) => {
            try {
                await rateLimiter.consume(socket.handshake.address);
                ChangeDataOfflineHandler(io, socket, JSON.parse(data));
            }
            catch(ex) {
                RateLimitHandler(io, socket, JSON.parse(ex));
            };
        });
    });

    // Listen on port. 
    server.listen(process.env.APP_PORT, () => {
        console.log(`Server is running on port ${process.env.APP_PORT}`);
    });
})();