import express from "express";
import path from "path";
import * as http from "http";
import * as socket from "socket.io";

const app: express.Application = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const server: http.Server = http.createServer(app); 
const io: socket.Server = new socket.Server(server, {});

io.on("connection", socket => {
    socket.emit("test", "this is an example!");
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});