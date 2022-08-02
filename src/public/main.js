const socket = io("ws://localhost:3000");

// Get all input elements. 
const checkInputElements = () => {
    const inputElements = document.getElementsByTagName("input");
    let inputs = {}; 

    for (let i = 0; i < inputElements.length; ++i) {
        const elementName = inputElements[i].name;
        if (!inputs[elementName]) {
            inputs[elementName] = document.getElementsByName(inputElements[i].name);
        };
    };

    return inputs;
};

// Parse a particular element to a format for the server.
const parseElement = (element) => {
    const type = element.type;
    let toReturn = {};

    if (type == "checkbox") {
        toReturn = {
            name: element.name,
            value: element.checked,
            type: "checkbox"
        };
    };

    if (type == "text") {
        toReturn = {
            name: element.name,
            value: element.value,
            type: "text"
        };
    }; 

    return toReturn;
};

// Parse multiple elements.  
const parseElements = (elements, toReturn) => {
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        const parsedElement = parseElement(element);

        if (toReturn[parsedElement.name]) {
            toReturn[parsedElement.name].push({
                type: parsedElement.type,
                value: parsedElement.value
            });
        } 
        else {
            toReturn[parsedElement.name] = [{
                type: parsedElement.type,
                value: parsedElement.value
            }];
        };
    };

    return toReturn;
};

// Set the value of a particular element.
const setElementData = (name, data) => {
    for (let i = 0; i < data.length; ++i) {
        const element = document.getElementsByName(name)[i];
        const type = element.type; 

        if (type == "checkbox") {
            element.checked = data[i].value; 
        };

        if (type == "text") {
            element.value = data[i].value;
        };
    };
};

socket.on("connect", () => {
    console.log("connected (client)");
});

// Receive initial elements data from the server. 
socket.on("getInitialData", (data) => {
    console.log("received!");

    const payload = JSON.parse(data);
    if (!payload) return;

    let elementsGiven = {};
    for (let i = 0; i < payload.length; ++i) {
        console.log(payload[i]);

        const categoryName = payload[i].name;
        const categoryValue = payload[i].value;

        setElementData(categoryName, JSON.parse(categoryValue));
        elementsGiven[categoryName] = true;
    };

    let elementsToSend = {};
    const inputs = checkInputElements();
    for (let x in inputs) {
        // If an element's state was not given, let the server know. 
        if (elementsGiven[x] !== true) {
            parseElements(Array.from(inputs[x]), elementsToSend);
        };
    };

    // Send any missing elements to the server. 
    if (Object.keys(elementsToSend).length > 0) {
        socket.emit("sendMissingElements", JSON.stringify(elementsToSend));
    };
});
