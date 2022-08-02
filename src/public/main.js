const socket = io("ws://localhost:3000");

const setElementData = (id, type, data) => {
    let element = document.getElementById(id);
    if (!element) return null; 

    if (type == "text") {
        element.value = data;
    };

    if (type == "checkbox") {
        element.checked = data == "true" ? true : false;
    };
};

socket.on("connect", () => {
    console.log("connected (client)");
});

socket.on("getInitialData", (data) => {
    console.log("received!");

    const payload = JSON.parse(data);
    if (!payload || payload.length == 0) return; 
    
    for (let i = 0; i < payload.length; i++) {
        const element = payload[i];
        console.log(element);
        setElementData(element.id, element.type, element.value);
    };

    socket.emit("test", "I'm testing this shit");
})