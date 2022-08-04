const socket = io("ws://192.248.188.133:2001");

// Initialize oldValues object.  
let oldValues = {};

// Get all input elements. 
const getInputElements = () => {
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

// Parse multiple elements.  
const parseElements = (elements, toReturn) => {
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
    
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        const parsedElement = parseElement(element);

        if (!toReturn[parsedElement.name]) {
            toReturn[parsedElement.name] = [];
        }; 

        toReturn[parsedElement.name].push({
            type: parsedElement.type,
            value: parsedElement.value
        });
    };

    return toReturn;
};

// Add event listener to element. 
const listenForChanges = (elements) => {
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];

        element.addEventListener("change", (event) => {
            const elements = document.getElementsByName(event.target.name);
            let parsedGroup = {};
            parseElements(Array.from(elements), parsedGroup);
            
            if (socket.connected) {
                socket.emit("changeData", JSON.stringify(parsedGroup));
            }
            else {
                // Send the state of the elements on disconnect.  
                socket.emit("changeDataOffline", JSON.stringify({
                    payload: parsedGroup,
                    dataset: oldValues[event.target.name]
                }));

                // Track edited categories while offline. 
                if (socket._editedCategories) {
                    socket._editedCategories.push(Object.keys(parsedGroup)[0]);
                };
            };
        });
    };
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
    };
};

socket.on("connect", () => {
    // We restored connection, therefore empty oldValues.
    oldValues = {};
});

socket.on("disconnect", () => {
    socket._editedCategories = [];

    // Save the state of all inputs on disconnect. 
    const inputs = getInputElements();
    for (let category in inputs) {
        if (!oldValues[category]) {
            let parsedGroup = {};
            parseElements(Array.from(inputs[category]), parsedGroup);
            oldValues[category] = parsedGroup;
        };
    }; 
});

// Receive initial elements data from the server. 
socket.on("getInitialData", (data) => {
    const payload = JSON.parse(data);
    const inputs = getInputElements();    
    if (!payload) return;
    if (!inputs) return; 

    // Setup event listeners. 
    for (let x in inputs) {
        listenForChanges(Array.from(inputs[x]));
    };

    let elementsGiven = {};
    for (let i = 0; i < payload.length; ++i) {
        const categoryName = payload[i].name;
        const categoryValue = payload[i].value;

        // If the category was edited while offline, don't set the values. 
        if (!socket._editedCategories || !socket._editedCategories.includes(categoryName)) {
            setElementData(categoryName, JSON.parse(categoryValue));
        };
        
        elementsGiven[categoryName] = true;
    };

    // Clear the edited offline array. 
    if (socket._editedCategories) {
        socket._editedCategories = [];
    };

    let elementsToSend = {};
    for (let x in inputs) {
        const inputsArray = Array.from(inputs[x]);

        // If an element's state was not given, let the server know. 
        if (elementsGiven[x] !== true) {
            parseElements(inputsArray, elementsToSend);
        };
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

// Notify about rate limit. 
socket.on("rateLimited", (data) => {
    alert(`You are being rate limited!\nNext change will be available in ${data} seconds.`);
});
