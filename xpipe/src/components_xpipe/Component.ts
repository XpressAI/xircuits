import { ServiceManager } from '@jupyterlab/services';

import * as filbert_loose from "./javascript_python_parser/filbert_loose.js";

const HEAD_TYPE_ADV = 'ADVANCED';

const HEAD_TYPE_GENERAL = 'GENERAL';

let displayArr: any[] = [];

function getComponentClass(ast: any, ast2: any, _arr: string[], path: string, content: any) {
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
                                    let count = l + 1;

                                    let ins = "";
                                    let outs = "";

                                    while (ast.body[i].body[k].body.body[count] != undefined) {
                                        if (ast.body[i].body[k].body.body[count].type == "ExpressionStatement"
                                            && ast.body[i].body[k].body.body[count].expression != null
                                            && ast.body[i].body[k].body.body[count].expression.type == "MemberExpression"
                                            && ast.body[i].body[k].body.body[count].expression.object != null
                                            && ast.body[i].body[k].body.body[count].expression.object.name == "InArg") {

                                            if (ast.body[i].body[k].body.body[count - 1] != undefined) {
                                                if (ast.body[i].body[k].body.body[count - 1].type == "ExpressionStatement"
                                                    && ast.body[i].body[k].body.body[count - 1].expression != null
                                                    && ast.body[i].body[k].body.body[count - 1].expression.type == "Identifier") {

                                                    if (ast2.body[i].body[k].body.body[count].loc != undefined) {
                                                        if (content.split("\n").length > ast2.body[i].body[k].body.body[count].loc.start.line - 1) {
                                                            ins += " , " + content.split("\n")[ast2.body[i].body[k].body.body[count].loc.start.line - 1].trim();
                                                        }
                                                    }
                                                }
                                            }
                                        } else if (ast.body[i].body[k].body.body[count].type == "ExpressionStatement"
                                            && ast.body[i].body[k].body.body[count].expression != null
                                            && ast.body[i].body[k].body.body[count].expression.type == "MemberExpression"
                                            && ast.body[i].body[k].body.body[count].expression.object != null
                                            && ast.body[i].body[k].body.body[count].expression.object.name == "OutArg") {
                                            if (ast.body[i].body[k].body.body[count - 1] != undefined) {
                                                if (ast.body[i].body[k].body.body[count - 1].type == "ExpressionStatement"
                                                    && ast.body[i].body[k].body.body[count - 1].expression != null
                                                    && ast.body[i].body[k].body.body[count - 1].expression.type == "Identifier") {

                                                    if (ast2.body[i].body[k].body.body[count].loc != undefined) {
                                                        if (content.split("\n").length > ast2.body[i].body[k].body.body[count].loc.start.line - 1) {
                                                            outs += " , " + content.split("\n")[ast2.body[i].body[k].body.body[count].loc.start.line - 1].trim();
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        count = count + 1
                                    }

                                    let temp_inArg = "";
                                    let temp_outArg = "";

                                    if (ins.substring(0, 3) == " , ") {
                                        ins = ins.substring(3);
                                        temp_inArg = ins;
                                    }

                                    if (outs.substring(0, 3) == " , ") {
                                        outs = outs.substring(3);
                                        temp_outArg = outs;
                                    }

                                    let _info = "";
                                    _info += ast.body[i].body[k].id.name;
                                    if (temp_inArg != "") {
                                        _info += " - " + temp_inArg;
                                    }
                                    if (temp_outArg != "") {
                                        _info += " - " + temp_outArg;
                                    }

                                    _arr.push(_info + " - " + path);
                                    getComponentClass(ast.body[i].body[k].body.body[l], ast2.body[i].body[k].body.body[l], _arr, path, content);
                                } else if (ast.body[i].body[k].body.body[l].type == "BlockStatement") {
                                    getComponentClass(ast.body[i].body[k].body.body[l], ast2.body[i].body[k].body.body[l], _arr, path, content);
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
                            let count = l + 1;
                            let ins = "";
                            let outs = "";

                            while (ast.body[i].body.body[count] != undefined) {
                                if (ast.body[i].body.body[count].type == "ExpressionStatement"
                                    && ast.body[i].body.body[count].expression != null
                                    && ast.body[i].body.body[count].expression.type == "MemberExpression"
                                    && ast.body[i].body.body[count].expression.object != null
                                    && ast.body[i].body.body[count].expression.object.name == "InArg") {

                                    if (ast.body[i].body.body[count - 1] != undefined) {
                                        if (ast.body[i].body.body[count - 1].type == "ExpressionStatement"
                                            && ast.body[i].body.body[count - 1].expression != null
                                            && ast.body[i].body.body[count - 1].expression.type == "Identifier") {

                                            if (ast2.body[i].body.body[count].loc != undefined) {
                                                if (content.split("\n").length > ast2.body[i].body.body[count].loc.start.line - 1) {
                                                    ins += " , " + content.split("\n")[ast2.body[i].body.body[count].loc.start.line - 1].trim();
                                                }
                                            }
                                        }
                                    }
                                } else if (ast.body[i].body.body[count].type == "ExpressionStatement"
                                    && ast.body[i].body.body[count].expression != null
                                    && ast.body[i].body.body[count].expression.type == "MemberExpression"
                                    && ast.body[i].body.body[count].expression.object != null
                                    && ast.body[i].body.body[count].expression.object.name == "OutArg") {
                                    if (ast.body[i].body.body[count - 1] != undefined) {
                                        if (ast.body[i].body.body[count - 1].type == "ExpressionStatement"
                                            && ast.body[i].body.body[count - 1].expression != null
                                            && ast.body[i].body.body[count - 1].expression.type == "Identifier") {

                                            if (ast2.body[i].body.body[count].loc != undefined) {
                                                if (content.split("\n").length > ast2.body[i].body.body[count].loc.start.line - 1) {
                                                    outs += " , " + content.split("\n")[ast2.body[i].body.body[count].loc.start.line - 1].trim();
                                                }

                                            }
                                        }
                                    }
                                }

                                count = count + 1
                            }

                            let temp_inArg = "";
                            let temp_outArg = "";

                            if (ins.substring(0, 3) == " , ") {
                                ins = ins.substring(3);
                                temp_inArg = ins;
                            }

                            if (outs.substring(0, 3) == " , ") {
                                outs = outs.substring(3);
                                temp_outArg = outs;
                            }

                            let _info = "";
                            _info += ast.body[i].id.name;
                            if (temp_inArg != "") {
                                _info += " - " + temp_inArg;
                            }
                            if (temp_outArg != "") {
                                _info += " - " + temp_outArg;
                            }

                            _arr.push(_info + " - " + path);
                            getComponentClass(ast.body[i].body.body[l], ast2.body[i].body.body[l], _arr, path, content);

                        } else if (ast.body[i].body.body[l].type == "BlockStatement") {
                            getComponentClass(ast.body[i].body.body[l], ast2.body[i].body.body[l], _arr, path, content);

                        } else if (ast.body[i].body.body[l].type == "IfStatement") {
                            if (ast.body[i].body.body[l].consequent != null) {
                                getComponentClass(ast.body[i].body.body[l].consequent, ast2.body[i].body.body[l].consequent, _arr, path, content);

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

async function get_all_components_method(serviceManager: ServiceManager, basePath: string) {
    let arr: any[] = [];

    let tempArr: string[] = [];

    let res_1 = await serviceManager.contents.get(basePath);
    for (let i = 0; i < res_1.content.length; i++) {
        if (res_1.content[i].type == "file" && res_1.content[i].mimetype == "text/x-python") {
            let res_2 = await serviceManager.contents.get(res_1.content[i].path);
            var j = filbert_loose.parse_dammit(res_2.content);
            var j3 = filbert_loose.parse_dammit(res_2.content, { locations: true, ranges: false });
            arr = [];
            let arr2 = getComponentClass(j, j3, arr, res_1.content[i].path, res_2.content);
            for (let i = 0; i < arr2.length; i++) {
                tempArr.push(arr2[i].toString());
            }
        } else if (res_1.content[i].type == "directory") {
            let res_3 = await serviceManager.contents.get(res_1.content[i].path);
            for (let i = 0; i < res_3.content.length; i++) {
                if (res_3.content[i].type == "file" && res_3.content[i].mimetype == "text/x-python") {
                    let res_4 = await serviceManager.contents.get(res_3.content[i].path);
                    if (res_4.content != "") {
                        var j2 = filbert_loose.parse_dammit(res_4.content);
                        var j4 = filbert_loose.parse_dammit(res_4.content, { locations: true, ranges: false });
                        arr = [];
                        let arr2 = getComponentClass(j2, j4, arr, res_3.content[i].path, res_4.content);
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

    const colorList_adv = [
        { task: "rgb(192,255,0)", id: 1 },
        { task: "rgb(0,102,204)", id: 2 },
        { task: "rgb(255,153,102)", id: 3 },
        { task: "rgb(255,102,102)", id: 4 },
        { task: "rgb(15,255,255)", id: 5 },
        { task: "rgb(255,204,204)", id: 6 },
        { task: "rgb(153,204,51)", id: 7 },
        { task: "rgb(255,153,0)", id: 8 },
        { task: "rgb(255,204,0)", id: 9 },
        { task: "rgb(204,204,204)", id: 10 },
        { task: "rgb(153,204,204)", id: 11 },
        { task: "rgb(153,0,102)", id: 12 },
        { task: "rgb(102,51,102)", id: 13 },
        { task: "rgb(153,51,204)", id: 14 },
        { task: "rgb(102,102,102)", id: 15 },
        { task: "rgb(255,102,0)", id: 16 },
        { task: "rgb(51,51,51)", id: 17 },
    ];

    const colorList_general = [
        { task: "rgb(21,21,51)", id: 1 }
    ];

    displayArr = [];

    for (let i = 0; i < tempArr.length; i++) {

        let colorCode: any = colorList_adv[0]["task"];

        if (i < colorList_adv.length) {
            colorCode = colorList_adv[i]["task"];
        } else {
            let index = i % colorList_adv.length;
            colorCode = colorList_adv[index]["task"]
        }

        displayArr.push({
            task: tempArr[i].split(" - ")[0],
            id: i + 1,
            header: HEAD_TYPE_ADV,
            path: tempArr[i].split(" - ")[tempArr[i].split(" - ").length - 1],
            variable: tempArr[i].split(" - ").slice(1, tempArr[i].split(" - ").length - 1).join(" - "),
            type: getComponentType(tempArr[i].split(" - ")[0].toLowerCase(), HEAD_TYPE_ADV),
            color: colorCode
        });
    }

    for (let i = 0; i < componentList.length; i++) {
        let colorCode: any = colorList_adv[0]["task"];

        if (i < colorList_adv.length) {
            colorCode = colorList_adv[i]["task"];
        } else {
            let index = i % colorList_adv.length;
            colorCode = colorList_adv[index]["task"]
        }

        if (componentList[i]["task"] != null) {
            displayArr.push({
                task: componentList[i]["task"],
                id: i + displayArr.length,
                header: HEAD_TYPE_GENERAL,
                path: "",
                variable: "",
                type: getComponentType(componentList[i]["task"].toLowerCase(), HEAD_TYPE_GENERAL),
                color: colorCode
            });
        }
    }

    return displayArr;
}

export default async function ComponentList(serviceManager: ServiceManager, basePath: string) {
    let component_list_result: string[] = await get_all_components_method(serviceManager, basePath);

    return component_list_result;
}
