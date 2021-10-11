import { JupyterFrontEnd } from "@jupyterlab/application";

import * as filbert_loose from "./javascript_python_parser/filbert_loose.js";

const HEAD_TYPE_ADV = 'ADVANCED';

const HEAD_TYPE_GENERAL = 'GENERAL';

let displayArr: any[] = [];

function getComponentClass(ast: any, _arr: string[], path: string) {
    if (ast.body != null
        && ast.body.length > 0) {
        for (let i = 0; i < ast.body.length; i++) {
            if (ast.body[i].type == "BlockStatement"
                && ast.body[i].body != null
                && ast.body[i].body.length > 0) {
                for (let k = 0; k < ast.body[i].body.length; k++) {
                    if (ast.body[i].body[k].type == "FunctionDeclaration"
                        && ast.body[i].body[k].id.type == "Identifier") {
                        if (ast.body[i].body[k].body != null
                            && ast.body[i].body[k].body.type == "BlockStatement"
                            && ast.body[i].body[k].body.body != null
                            && ast.body[i].body[k].body.body.length > 0) {
                            for (let l = 0; l < ast.body[i].body[k].body.body.length; l++) {
                                if (ast.body[i].body[k].body.body[l].type == "ExpressionStatement"
                                    && ast.body[i].body[k].body.body[l].expression != null
                                    && ast.body[i].body[k].body.body[l].expression.type == "CallExpression"
                                    && ast.body[i].body[k].body.body[l].expression.callee != null
                                    && ast.body[i].body[k].body.body[l].expression.callee.type == "MemberExpression"
                                    && ast.body[i].body[k].body.body[l].expression.callee.object != null
                                    && ast.body[i].body[k].body.body[l].expression.callee.object.name == "Component") {
                                    _arr.push(ast.body[i].body[k].id.name + " - " + path);
                                    getComponentClass(ast.body[i].body[k].body.body[l], _arr, path);
                                } else if (
                                    ast.body[i].body[k].body.body[l].type == "BlockStatement"
                                ) {
                                    getComponentClass(ast.body[i].body[k].body.body[l], _arr, path);
                                }
                            }
                        }
                    }
                }
            } else if (ast.body[i].type == "FunctionDeclaration"
                && ast.body[i].id.type == "Identifier") {
                if (ast.body[i].body != null
                    && ast.body[i].body.type == "BlockStatement"
                    && ast.body[i].body.body != null
                    && ast.body[i].body.body.length > 0) {
                    for (let l = 0; l < ast.body[i].body.body.length; l++) {
                        if (ast.body[i].body.body[l].type == "ExpressionStatement"
                            && ast.body[i].body.body[l].expression != null
                            && ast.body[i].body.body[l].expression.type == "CallExpression"
                            && ast.body[i].body.body[l].expression.callee != null
                            && ast.body[i].body.body[l].expression.callee.type == "MemberExpression"
                            && ast.body[i].body.body[l].expression.callee.object != null
                            && ast.body[i].body.body[l].expression.callee.object.name == "Component") {
                            _arr.push(ast.body[i].id.name + " - " + path);
                            getComponentClass(ast.body[i].body.body[l], _arr, path);
                        } else if (ast.body[i].body.body[l].type == "BlockStatement") {
                            getComponentClass(ast.body[i].body.body[l], _arr, path);
                        } else if (ast.body[i].body.body[l].type == "IfStatement") {
                            if (ast.body[i].body.body[l].consequent != null) {
                                getComponentClass(ast.body[i].body.body[l].consequent, _arr, path);
                            }
                        }
                    }
                }
            }
        }
    }

    return _arr;
}

function getVariableType(input: string) {
    input = input.toLowerCase();

    if (input.includes("integer")) {
        return 'int'
    } else if (input.includes("int name")) {
        return 'int'
    } else if (input.includes("float")) {
        return 'float'
    } else if (input.includes("false")) {
        return 'boolean'
    } else if (input.includes("true")) {
        return 'boolean'
    } else if (input.includes("boolean")) {
        return 'boolean'
    } else if (input.includes("string")) {
        return 'string'
    }
}

function getComponentType(input: string, header: string) {
    input = input.toLowerCase();

    let returnType: string;
    if (header == "ADVANCED") {
        if (input == "TrainTestSplit".toLowerCase()) {
            returnType = "split";
        } else if (input == "RotateCounterClockWiseComponent".toLowerCase()) {
            returnType = "out";
        } else if (input == "LoopComponent".toLowerCase()) {
            returnType = "if";
        } else if (input == "ReadDataSet".toLowerCase()) {
            returnType = "in";
        } else if (input == "ResizeImageData".toLowerCase()) {
            returnType = "out";
        } else if (input == "ShouldStop".toLowerCase()) {
            returnType = "enough";
        } else if (input == "SaveKerasModelInModelStash".toLowerCase()) {
            returnType = "convert";
        } else if (input == "EvaluateAccuracy".toLowerCase()) {
            returnType = "eval";
        } else if (input == "TrainImageClassifier".toLowerCase()) {
            returnType = "train";
        } else if (input == "CreateModel".toLowerCase()) {
            returnType = "model";
        } else if (input == "ResizeImageData".toLowerCase()) {
            returnType = "model";
        } else {
            returnType = "debug";
        }
    } else {
        if (input.includes("literal")) {
            returnType = getVariableType(input);
        } else if (input == "reached target accuracy") {
            returnType = "enough"
        } else if (input == "debug image") {
            returnType = "debug";
        } else if (input == "convert to aurora") {
            returnType = "convert";
        } else if (input == "math operation") {
            returnType = "math";
        } else if (input == "if") {
            returnType = "if";
        } else if (input == "run notebook") {
            returnType = "runnb";
        } else {
            returnType = getVariableType(input);
        }
    }
    return returnType;
}

async function get_all_components_method(lab: JupyterFrontEnd, basePath: string) {
    let arr: any[] = [];

    let tempArr: string[] = [];

    let res_1 = await lab.serviceManager.contents.get(basePath);
    for (let i = 0; i < res_1.content.length; i++) {
        if (res_1.content[i].type == "file" && res_1.content[i].mimetype == "text/x-python") {
            let res_2 = await lab.serviceManager.contents.get(res_1.content[i].path);
            var j = filbert_loose.parse_dammit(res_2.content);
            arr = [];
            let arr2 = getComponentClass(j, arr, res_1.content[i].path);
            for (let i = 0; i < arr2.length; i++) {
                tempArr.push(arr2[i].toString());
            }
        } else if (res_1.content[i].type == "directory") {
            let res_3 = await lab.serviceManager.contents.get(res_1.content[i].path);
            for (let i = 0; i < res_3.content.length; i++) {
                if (res_3.content[i].type == "file" && res_3.content[i].mimetype == "text/x-python") {
                    let res4 = await lab.serviceManager.contents.get(res_3.content[i].path);
                    if (res4.content != "") {
                        var j2 = filbert_loose.parse_dammit(res4.content);
                        arr = [];
                        let arr2 = getComponentClass(j2, arr, res_3.content[i].path);
                        for (let i = 0; i < arr2.length; i++) {
                            tempArr.push(arr2[i].toString());
                        }
                    }
                }
            }
        }
    }

    const componentList = [
        { task: "Math Operation", id: 1 },
        { task: "Convert to Aurora", id: 2 },
        { task: "Get Hyper-parameter String Name", id: 3 },
        { task: "Get Hyper-parameter Int Name", id: 4 },
        { task: "Get Hyper-parameter Float Name", id: 5 },
        { task: "Get Hyper-parameter Boolean Name", id: 6 },
        { task: "Debug Image", id: 7 },
        { task: "Reached Target Accuracy", id: 8 },
        { task: "Literal String", id: 9 },
        { task: "Literal Integer", id: 10 },
        { task: "Literal Float", id: 11 },
        { task: "Literal True", id: 12 },
        { task: "Literal False", id: 13 },
    ];

    for (let i = 0; i < tempArr.length; i++) {
        displayArr.push({
            task: tempArr[i].split(" - ")[0],
            id: i + 1,
            header: HEAD_TYPE_ADV,
            path: tempArr[i].split(" - ")[1],
            type: getComponentType(tempArr[i].split(" - ")[0].toLowerCase(), HEAD_TYPE_ADV)
        });
    }

    for (let i = 0; i < componentList.length; i++) {
        if (componentList[i]["task"] != null) {
            displayArr.push({
                task: componentList[i]["task"],
                id: i + displayArr.length,
                header: HEAD_TYPE_GENERAL,
                path: "",
                type: getComponentType(componentList[i]["task"].toLowerCase(), HEAD_TYPE_GENERAL)
            });
        }
    }

    return displayArr;
}

export default async function ComponentList(lab: JupyterFrontEnd, basePath: string) {
    let component_list_result: string[] = await get_all_components_method(lab, basePath);

    const componentList_sample = [
        { task: "Read Data Set", id: 1, header: "general", path: "xai_learning/inference.py", type: 'in' },
        { task: "Augment Image Data", id: 2, header: "general", path: "components.py", type: 'out' },
        { task: "Train/Test Split", id: 3, header: "general", path: "components2.py", type: 'split' },
        { task: "Train Face Detector", id: 4, header: "general", path: "components.py", type: 'train' },
        { task: "Train Object Detector", id: 52, header: "general", path: "components.py", type: 'train' },
        { task: "Evaluate mAP", id: 63, header: "general", path: "components2.py", type: 'eval' },
        { task: "Run Notebook", id: 73, header: "general", path: "components2.py", type: 'runnb' },
        { task: "If", id: 84, header: "general", path: "components.py", type: 'if' },
        { task: "Math Operation", id: 9, header: "general", path: "components.py", type: 'math' },
        { task: "Convert to Aurora", id: 10, header: "general", path: "components.py", type: 'convert' },
        { task: "Get Hyper-parameter String Name", id: 11, header: "advanced", path: "components2.py", type: 'string' },
        { task: "Get Hyper-parameter Int Name", id: 15, header: "advanced", path: "components.py", type: 'int' },
        { task: "Get Hyper-parameter Float Name", id: 13, header: "advanced", path: "components.py", type: 'float' },
        { task: "Get Hyper-parameter Boolean Name", id: 14, header: "advanced", path: "components.py", type: 'boolean' },
        { task: "Create Object Detector Model", id: 15, header: "advanced", path: "components.py", type: 'model' },
        { task: "Debug Image", id: 16, header: "advanced", path: "components.py", type: 'debug' },
        { task: "Reached Target Accuracy", id: 17, header: "advanced", path: "components.py", type: 'enough' },
        { task: "Literal String", id: 18, header: "advanced", path: "", type: 'string' },
        { task: "Literal Integer", id: 19, header: "advanced", path: "", type: 'int' },
        { task: "Literal Float", id: 20, header: "advanced", path: "", type: 'float' },
        { task: "Literal True", id: 21, header: "advanced", path: "", type: 'boolean' },
        { task: "Literal False", id: 22, header: "advanced", path: "", type: 'boolean' },
    ];

    return component_list_result;
}
