function checkInput(input: any, dataType: string): boolean {

    const normalizedDataType = dataType.toLowerCase();
    let processedInput = "";
    let errorDetails = "";
    let exampleInput = "";
    let inputAsNumber;

    // Allow empty input for specific data types
    const allowedEmptyTypes = ["string", "secret", "chat", "list", "tuple", "dict"];
    if(input === "" && !allowedEmptyTypes.includes(normalizedDataType)){
        alert("Input cannot be empty.");
        return false;
    }

    const formatError = (detail: string, example: string) => `Invalid ${dataType} input: ${detail} \nExample of a correct ${dataType} format: ${example}`;

    switch (normalizedDataType) {
        case "int":
        case "integer":
            inputAsNumber = Number(input); // Parse the input as a number which can handle scientific notation
            
                // Check if the parsed number is an integer and not NaN
                if(!Number.isInteger(inputAsNumber)){
                    errorDetails = `${input} is not an integer.`;
                    exampleInput = "e.g. 3, -4, or 5e2 (which is 500 in scientific notation)";
                    alert(formatError(errorDetails, exampleInput));
                    return false;
                }
                processedInput = `${input}`;
                break;
            
        case "float":
            const floatVal = parseFloat(input);
            inputAsNumber = Number(input);
        
            // Check if the parsed float is a number and if it equals the input when also parsed as a number
            if(isNaN(floatVal) || floatVal !== inputAsNumber){
                errorDetails = `${input} is not a float.`;
                exampleInput = "e.g. 3.14, 3.14e2, or 314e-2";
                alert(formatError(errorDetails, exampleInput));
                return false;
            }
            processedInput = `${input}`;
            break;

        case "string":
        case "secret":
        case "chat":
            processedInput = JSON.stringify(input);
            break;
        case "list":
        case "tuple": // Validate tuple as list, as JS doesn't have native tuples
            processedInput = input === "" ? "[]" : `[${input}]`;
            break;
        case "dict":
            processedInput = input === "" ? "{}" : `{${input}}`;
            break;
        case "true":
        case "false":
        case "boolean":
            return true;
        case "libraryname":
            const validLibNameRegex = /^[a-zA-Z][_a-zA-Z0-9]*$/;
        
            if (!validLibNameRegex.test(input)) {
                errorDetails = `${input} is not a valid library name. It must start with a letter and can only contain letters, numbers, and underscores.`;
                exampleInput = "e.g., 'My_Library', 'dataCollection', 'Project1'";
                alert(formatError(errorDetails, exampleInput));
                return false;
            }
        
            processedInput = JSON.stringify(input);
            break;

        case "undefined_any":
            // Handler if called from any inputDialogue
            alert(`Type is undefined or not provided. Please insert the first character as shown in example.`);
            return false;
        default:
            alert("Invalid datatype: Please provide a valid datatype.");
            return false;
    }

    try {
        JSON.parse(processedInput);
    } catch (e) {
        if (processedInput.includes("'")) {
            errorDetails = "Please use double quotes instead of single quotes.";
        } else if (/(?:\{|\[|\()(?:\w+)/.test(processedInput)) {
            errorDetails = "Please ensure to use double quotes for your variables.";
        } else {
            errorDetails = "Please check the console log for details.";
            console.error("Parsing error:", e.message);
        }

        switch (normalizedDataType) {
            case "string":
            case "secret":
                exampleInput = '"example_string"';
                break;
            case "tuple":
            case "list":
                exampleInput = '"item1", "item2", 123';
                break;
            case "dict":
                exampleInput = '"key1": "value1", "key2": 123';
                break;
        }

        if (normalizedDataType !== "secret") {
            errorDetails += "\n\nYour input: " + input;
        }

        alert(formatError(errorDetails, exampleInput));
        return false;
    }

    return true;
}

export { checkInput };
