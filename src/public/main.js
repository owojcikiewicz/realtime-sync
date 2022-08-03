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

// Add event listener to element. 
const listenForChanges = (elements) => {
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];

        element.addEventListener("change", (event) => {
            const elements = document.getElementsByName(event.target.name);
            const parsedGroup = parseElements(Array.from(elements), {})
            
            if (socket.connected === true) {
                console.log(JSON.stringify({parsedGroup}));
                socket.emit("changeData", JSON.stringify(parsedGroup));
            }
            else {
                socket.emit("changeDataOffline", JSON.stringify({
                    payload: parsedGroup,
                    dataset: element._oldValues
                }));
            };

            console.log(element._oldValues);
            element._oldValues = parsedGroup;
        });
    };
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

    if (type == "radio") {
        toReturn = {
            name: element.name,
            value: element.checked,
            type: "radio"
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

        if (type == "radio") {
            element.checked = data[i].value; 
        };

        element._oldValues = parseElements(Array.from(document.getElementsByName(name)), {});
    };
};

socket.on("connect", () => {
    console.log("connected");
});

// Receive initial elements data from the server. 
socket.on("getInitialData", (data) => {
    console.log("received!");

    const payload = JSON.parse(data);
    if (!payload) return;

    let elementsGiven = {};
    for (let i = 0; i < payload.length; ++i) {
        const categoryName = payload[i].name;
        const categoryValue = payload[i].value;

        setElementData(categoryName, JSON.parse(categoryValue));
        elementsGiven[categoryName] = true;
    };

    const inputs = checkInputElements();
    let elementsToSend = {};
    for (let x in inputs) {
        const inputsArray = Array.from(inputs[x]);

        // If an element's state was not given, let the server know. 
        if (elementsGiven[x] !== true) {
            parseElements(inputsArray, elementsToSend);
        };

        // Add event listeners. 
        listenForChanges(inputsArray);
    };

    // Send any missing elements to the server. 
    if (Object.keys(elementsToSend).length > 0) {
        socket.emit("sendMissingElements", JSON.stringify(elementsToSend));
    };
});

// Receive changes from server. 
socket.on("receivedChanges", (data) => {
    const payload = JSON.parse(data);
    const category = Object.keys(payload)[0];
    const value = payload[category];

    setElementData(category, value);
});
