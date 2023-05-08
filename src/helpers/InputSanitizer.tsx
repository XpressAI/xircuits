function checkInput(input: any, datatype: string): boolean {
    let wrappedInput = "";
    let lowercaseDatatype = datatype.toLowerCase();

    switch (lowercaseDatatype) {
        case "string":
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
        if (wrappedInput.includes("'")) {
            alert(errorMessage + "Please use double quotes instead of single quotes for " + wrappedInput);
        } else if (/(?:\{|\[|\()(?:\w+)/.test(wrappedInput)) {
            alert(errorMessage + "Please make sure to quote your variables in " + wrappedInput);
        } else {
            // Other JSON parsing errors
            alert(errorMessage + e.message + " for " + wrappedInput);
        }
        return false;
    }

    return true;
}

export { checkInput };
