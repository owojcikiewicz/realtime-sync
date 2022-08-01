const socket = io("ws://localhost:3000");

socket.on("connect", () => {
    console.log("connected (client)");
});

socket.on("test", (data) => {
    console.log("received!");
});