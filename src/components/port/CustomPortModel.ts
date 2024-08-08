import { DefaultPortModel, DefaultPortModelOptions } from "@projectstorm/react-diagrams";
import { DeserializeEvent} from '@projectstorm/react-canvas-core';
import {PortModel} from "@projectstorm/react-diagrams-core";
import { CustomLinkModel } from "../link/CustomLinkModel";

/**
 * @author wenfeng xu
 * custom port model enable it can execute some rule
 * before it can link to another
 */

export const PARAMETER_NODE_TYPES = [
    'boolean', 'int', 'float', 'string', 'list', 'tuple', 
    'dict', 'secret', 'chat', 'any'
];

export interface CustomPortModelOptions extends DefaultPortModelOptions {
    name: string;
    varName?: string;
    portType?: string;
    dataType?: string;
    extras?: object;
}

export  class CustomPortModel extends DefaultPortModel  {
    name: string;
    varName: string;
    portType: string;
    dataType: string;
    extras: object;

    constructor(options: CustomPortModelOptions) {
        super({
            ...options,
        });

        this.varName = options.varName || options.label;
        this.portType = options.portType || "";
        this.dataType = options.dataType || "";
        this.extras = options.extras || {};
    }

    serialize() {
        return {
            ...super.serialize(),
            varName: this.varName,
            portType: this.portType,
            dataType: this.dataType,
            extras: this.extras
        };
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
        this.varName = event.data.varName;
        this.portType = event.data.portType;
        this.dataType = event.data.dataType;
        this.extras=event.data.extras;
    }

    canLinkToPort(port: CustomPortModel): boolean {
        // No self connections allowed
        if(port === this) return false;

        if (port instanceof DefaultPortModel) {
            if(this.options.in === port.getOptions().in){
                port.getNode().getOptions().extras["borderColor"]="red";
                port.getNode().getOptions().extras["tip"]="in not connected to in";
                port.getNode().setSelected(true);
                console.log("in not connected to in");
                return false;
            }
        }

        // Multiple link check
        if (!port.canLinkToLinkedPort()) {
            return false;
        }
    
        // Check if it's a triangle-to-triangle link
        if (this.options.label.includes('▶') || port.getOptions().label.includes('▶')) {
            if (!this.canTriangleLinkToTriangle(this, port)) {
                port.getNode().getOptions().extras["borderColor"]="red";
                port.getNode().getOptions().extras["tip"]="Triangle must be linked to triangle.";
                port.getNode().setSelected(true);
                console.log("triangle to triangle failed.");
                return false;
            }
        } else {
            // Then check if it's a parameter link
            if (!this.canParameterLinkToPort(this, port)) {
                return false;
            }
        }

        let checkLinkDirection = this.checkLinkDirection(this, port);

        if (checkLinkDirection == false){
            port.getNode().getOptions().extras["borderColor"]="red";
            port.getNode().getOptions().extras["tip"]="Port should be created from outPort [right] to inPort [left].";
            port.getNode().setSelected(true);
            console.log("Port should be created from outPort [right] to inPort [left]");
            return false;
        }

        let checkExecutionLoop = this.checkExecutionLoop(this, port);

        if (checkExecutionLoop == false){
            //console.log("Loop detected.");
            return false;
        }
        this.removeErrorTooltip(this, port);
        return true;
    }

    /**
     * the qty of ports of parameter node link to the same port in other node can
     * not be more than one
     * @param thisPort
     * @param port
     */
    canParameterLinkToPort = (thisPort, targetPort) => {

        const thisNode = this.getNode();
        const thisNodeModelType = thisNode.getOptions()["extras"]["type"];
        const thisName: string = targetPort.getName();
        const thisLabel: string = "**" + targetPort.getOptions()["label"] + "**";

        if (this.isParameterNode(thisNodeModelType) == true){

            if (!thisName.startsWith("parameter")){
                targetPort.getNode().getOptions().extras["borderColor"] = "red";
                targetPort.getNode().getOptions().extras["tip"] = `Port ${thisLabel} linked is not a parameter, please link a ${thisLabel} node to it.`;
                targetPort.getNode().setSelected(true);
                return false;
            }
        }
        
        // Use thisNodeModelType if sourceDataType is an empty string due to old workflow
        let sourceDataType = thisPort.dataType || thisNodeModelType;
        let targetDataType = targetPort.dataType;

        if(!targetPort.isTypeCompatible(sourceDataType, targetDataType)) {
            // if a list of types is provided for the port, parse it a bit to display it nicer
            if (targetDataType.includes('Union')) {
                targetDataType = this.parseUnionPortType(targetDataType);
            }
            targetPort.getNode().getOptions().extras["borderColor"] = "red";
            targetPort.getNode().getOptions().extras["tip"] = `Incorrect data type. Port ${thisLabel} is of type *\`${targetDataType}\`*. You have provided type *\`${sourceDataType}\`*.`;
            targetPort.getNode().setSelected(true);
            return false;
        }
        
        this.removeErrorTooltip(this, targetPort);
        return true;
    }

    isParameterNode = (nodeModelType: string) => {
        return PARAMETER_NODE_TYPES.includes(nodeModelType);
    }

    static typeCompatibilityMap = {
        "chat": ["list"],
        "secret": ["string", "int", "float"],
    };
    
    // Helper function to parse Union types
    parseUnionType = (type: string): string[] => {
        const unionMatch = type.match(/^Union\[(.*)\]$/);
        if (unionMatch) {
            return unionMatch[1].split(/[\|,]/).map(t => t.trim());
        }
        return [type];
    }
    
    // Helper function to map common types
    mapCommonTypes = (type: string): string => {
        const typeMapping = {
            "str": "string",
            "bool": "boolean",
            "int": "integer",
        };
        return typeMapping[type] || type;
    }
    isTypeCompatible(sourceDataType, targetDataType) {
        // Helper function to check type compatibility including Union types
        const checkTypeCompatibility = (sourceDataTypes, targetDataTypes) => {
            for (const sourceDataType of sourceDataTypes) {
                for (const targetDataType of targetDataTypes) {
                    if (sourceDataType === targetDataType || sourceDataType === 'any' || targetDataType === 'any') {
                        return true;
                    }

                    // Check if the sourceDataType exists in the compatibility map
                    if (CustomPortModel.typeCompatibilityMap.hasOwnProperty(sourceDataType)) {
                        // Get the array of compatible data types for sourceDataType
                        const compatibleDataTypes = CustomPortModel.typeCompatibilityMap[sourceDataType];
                        // Check if targetDataType is in the array of compatible types
                        if (compatibleDataTypes.includes(targetDataType)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
    
        // Parse and map Union types
        const sourceDataTypes = this.parseUnionType(sourceDataType).map(this.mapCommonTypes);
        const targetDataTypes = this.parseUnionType(targetDataType).map(this.mapCommonTypes);
    
        // Check for direct compatibility or 'any' type
        if (checkTypeCompatibility(sourceDataTypes, targetDataTypes)) {
            return true;
        }

        // If none of the above checks pass, the types are incompatible
        return false;
    }

    canTriangleLinkToTriangle = (thisPort, port) => {
        let portLabel = port.getOptions()["label"];
        let thisPortLabel = this.options["label"];
        let thisNode = this.getNode();
        let node = port.getNode();

        let thisNodeModelType = thisNode.getOptions()["extras"]["type"];

        if (this.isParameterNode(thisNodeModelType)){
            this.removeErrorTooltip(this, port);
            return true;
        }

        if (!(thisPortLabel.endsWith('▶')) && portLabel != '▶'){
            this.removeErrorTooltip(this, port);
            return true;
        }else if (thisPortLabel.includes('▶')){
            this.removeErrorTooltip(this, port);
            return (portLabel === '▶' && thisPortLabel.includes('▶') && !(Object.keys(thisPort.getLinks()).length > 1));
        }else{
            return (portLabel === '▶' && thisPortLabel.endsWith('▶') && !(Object.keys(thisPort.getLinks()).length > 1));
        }
    }

    canLinkToLinkedPort(): boolean {
        let port = this as CustomPortModel
        if (Object.keys(port.getLinks()).length > 0) {
            port.getNode().getOptions().extras["borderColor"] = "red";
            port.getNode().getOptions().extras["tip"] = "Xircuits only allows 1 link per InPort! Please delete the current link to proceed.";
            port.getNode().setSelected(true);
            return false;
        }
        return true;
    }

    removeErrorTooltip = (thisPort, port) => {
        port.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
        delete port.getNode().getOptions().extras["tip"];
        thisPort.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
        delete thisPort.getNode().getOptions().extras["tip"];
    }

    getCircularReplacer = ()=> {
        var seen = [];
        return (key,value) =>{
            if (typeof value === "object" && value !== null) {
                if (seen.indexOf(value) >= 0) {
                    return;
                }
                seen.push(value);
            }
            return value;
        };
    };

    checkLinkDirection = (thisPort, port) => {
        // currently only checking if it is an in or out port from its alignment
        return ( (thisPort.getOptions()["alignment"]==="right") && 
                 (port.getOptions()["alignment"]==="left") );
    }

    checkExecutionLoop = (thisPort, port) => {
        let nodeIDList = [];
        
        let sourceNode = thisPort.getParent();
        let targetNode =  port.getParent();
        let nodeType = sourceNode.getOptions()["extras"]["type"];

        nodeIDList.push(sourceNode.getID(), targetNode.getID());

        //console.log("sourceNode is:", sourceNode.getOptions()["name"], "\ntargetNode is:", targetNode.getOptions()["name"]);

        while (sourceNode != null && nodeType != 'Start' && !PARAMETER_NODE_TYPES.includes(nodeType)) {
            //console.log("Curent sourceNode:", sourceNode.getOptions()["name"]);
            let inPorts = sourceNode.getInPorts();
            
            // a node may have multiple ports. Iterate and find "▶"
            for (let i = 0; i <= inPorts.length; i++) {
                
                let portLabel = inPorts[i].getOptions()["label"];

                if (portLabel === "▶"){
                    let portLink = inPorts[i].getLinks();
                    //check if port has any links
                    if (Object.keys(portLink).length !== 1){
                        
                        if (Object.keys(portLink).length > 1){
                            console.log("zombie link detected");
                        }
                        //console.log("sourceNode:", sourceNode.getOptions()["name"], "has no in-links!");
                        sourceNode = null;
                        break;
                    }
                    else{
                        let portLinkKey = Object.keys(portLink).toString();
                        sourceNode = portLink[portLinkKey].getSourcePort().getParent();
                        nodeType = sourceNode.getOptions()["extras"]["type"];
                        if(nodeIDList.includes(sourceNode.getID())){
                            console.log("Loop detected at", sourceNode.getOptions()["name"]);
                            return false;
                        }

                        nodeIDList.push(sourceNode.getID());
                        break;

                    }
                }     
            }
        }

        while ((targetNode != null) && targetNode.getOptions()["name"]!="Finish"){
            //console.log("Curent targetNode:", targetNode.getOptions()["name"]);
            let outPorts = targetNode.getOutPorts();
            
            // a node may have multiple ports. Iterate and find "▶"
            for (let i = 0; i <= outPorts.length; i++) {
                
                let portLabel = outPorts[i].getOptions()["label"];

                if (portLabel === "▶"){
                    let portLink = outPorts[i].getLinks();
                    //check if port has any links
                    if (Object.keys(portLink).length !== 1){

                        if (Object.keys(portLink).length > 1){
                            console.log("zombie link detected");
                        }

                        //console.log("targetNode:", targetNode.getOptions()["name"], "has no out-links!");
                        targetNode = null;
                        break;
                    }

                    
                    else{
                        let portLinkKey = Object.keys(portLink).toString();
                        targetNode = portLink[portLinkKey].getTargetPort().getParent();
                        if(nodeIDList.includes(targetNode.getID())){
                            console.log("Loop detected at", targetNode.getOptions()["name"]);
                            return false;
                        }

                        nodeIDList.push(targetNode.getID());
                        break;

                    }
                }     
            }
        }

        return true;
    }

    /**
     * When a port supports multiple types, parse them to display them nicer
     * Parsed type looks like: type1 or type2
     * @param portType - unparsed port type (looks like: "Union[type1, type2]")
     */
    parseUnionPortType = (portType: string) => {
        // port type is of form: Union[type1, type2]
        portType = portType.replace('Union', '');    // remove Union word
        portType = portType.replace(/[\[\]]/g, '');  // remove square brackets
        portType = portType.replace(/[,|]/g, ' or ');   // replace all commas and pipes with ' or '
        return portType;
    }

    getPortOrder = () => {

        let port: any = this; // CustomPortModel
        const inPorts = port.parent.getInPorts();
        const portId = this.getID();
        return inPorts.findIndex(p => p.options.id === portId);

    }

    getTargetPorts = () => {
        let port: any = this;
        return Object.values(port.getLinks()).map((link:CustomLinkModel) => link.getTargetPort());
    }

    getTargetNodes = () => {
        let port: any = this;
        return Object.values(port.getLinks()).map((link:CustomLinkModel) => link.getTargetPort().getNode());
    }

    getSourcePorts = () => {
        let port: any = this;
        return Object.values(port.getLinks()).map((link:CustomLinkModel) => link.getSourcePort());
    }

    getSourceNodes = () => {
        let port: any = this;
        return Object.values(port.getLinks()).map((link:CustomLinkModel) => link.getSourcePort().getNode());
    }

    getCustomProps() {
        const { name, varName, portType, dataType } = this;
        const id = this.getID();
        const label = this.getOptions()['label']
        const props = { name, varName, label, id, dataType, portType };
        return props;
    }
}
