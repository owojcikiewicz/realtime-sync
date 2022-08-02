const socket = io("ws://localhost:3000");

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

const parseElement = (element) => {
    const type = element.type;
    let toReturn = {};

    if (type == "checkbox") {
        toReturn = {
            name: element.name,
            value: element.checked
        };
    };

    if (type == "text") {
        toReturn = {
            name: element.name,
            value: element.value
        };
    }; 

    return toReturn;
};

const parseElements = (elements, toReturn) => {
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        const parsedElement = parseElement(element);

        if (toReturn[parsedElement.name]) {
            toReturn[parsedElement.name].push(parsedElement.value);
        } 
        else {
            toReturn[parsedElement.name] = [parsedElement.value];
        };
    };

    return toReturn;
};

const setElementData = (name, data) => {
    for (let i = 1; i < data.length; ++i) {
        const element = document.getElementByName(name)[i];
        const type = element.type; 

        if (type == "checkbox") {
            element.checked = data[i]; 
        };

        if (type == "text") {
            element.value = data[i];
        };
    };
};

socket.on("connect", () => {
    console.log("connected (client)");
});

socket.on("getInitialData", (data) => {
    console.log("received!");

    const payload = JSON.parse(data);
    if (!payload) return; 
    
    let elementsGiven = {};
    for (let key in payload) {
        const elementData = payload[key];
        setElementData(key, elementData)

        elementsGiven[key] = true;
    };

    let elementsToSend = {};
    const inputs = checkInputElements();
    for (let x in inputs) {
        if (elementsGiven[x] !== true) {
            parseElements(Array.from(inputs[x]), elementsToSend);
        };
    };

    socket.emit("sendMissingElements", JSON.stringify(elementsToSend));
});
