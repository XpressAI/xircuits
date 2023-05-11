function checkInput(input: any, datatype: string): boolean {
    let wrappedInput = "";
    let lowercaseDatatype = datatype.toLowerCase();

    switch (lowercaseDatatype) {
        case "string":
        case "secret":
            wrappedInput = `"${input}"`;
            break;
        case "tuple":
            wrappedInput = `(${input})`;
            break;
        case "list":
            wrappedInput = `[${input}]`;
            break;
        case "dict":
            wrappedInput = `{${input}}`;
            break;
        default:
            alert("Invalid datatype: Please provide a valid datatype.");
            return false;
    }

    try {
        JSON.parse(wrappedInput);
    } catch (e) {
        let errorMessage = "Invalid " + datatype + " input: ";
        let exampleMessage = "\nExample of a correct " + datatype + " format: ";
        let example = "";

        if (wrappedInput.includes("'")) {
            errorMessage += "Please use double quotes instead of single quotes.";
        } else if (/(?:\{|\[|\()(?:\w+)/.test(wrappedInput)) {
            errorMessage += "Please make sure to use double quotes for your variables.";
        } else {
            // Other JSON parsing errors
            errorMessage += "Please check the console log for details.";
            console.error("Parsing error:", e.message);
        }

        // Add example message
        switch (lowercaseDatatype) {
            case "string":
            case "secret":
                example = '"example_string"';
                break;
            case "tuple":
                example = '"item1", "item2", "item3"';
                break;
            case "list":
                example = '"item1", "item2", 123';
                break;
            case "dict":
                example = '"key1": "value1", "key2": 123';
                break;
        }

        if (lowercaseDatatype !== "secret") {
            errorMessage += "\n\nYour input: " + input;
        }

        alert(errorMessage + "\n" + exampleMessage + example);
        return false;
    }

    return true;
}

export { checkInput };
