import { DefaultPortModel } from "@projectstorm/react-diagrams";
import {PortModel} from "@projectstorm/react-diagrams-core";

/**
 * @author wenfeng xu
 * custom port model enable it can execute some rule
 * before it can link to another
 */
export  class CustomPortModel extends DefaultPortModel  {


    canLinkToPort(port: PortModel): boolean {
        if (port instanceof DefaultPortModel) {
            if(this.options.in === port.getOptions().in){
                port.getNode().getOptions().extras["borderColor"]="red";
                port.getNode().getOptions().extras["tip"]="in not connected to in";
                port.getNode().setSelected(true);
                console.log("in not connected to in");
                // tested
                return false;
            }
        }

        let canParameterLinkToPort = this.canParameterLinkToPort(this, port);

        if(canParameterLinkToPort == false){
            console.log("Parameter Link To Port failed.");
            return false;
        }

        let canTriangleLinkToTriangle = this.canTriangleLinkToTriangle(this, port);

        if (canTriangleLinkToTriangle == false){
            port.getNode().getOptions().extras["borderColor"]="red";
            port.getNode().getOptions().extras["tip"]="Triangle must be linked to triangle.";
            port.getNode().setSelected(true);
            console.log("triangle to triangle failed.");
            //tested
            return false;
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
    canParameterLinkToPort = (thisPort, port) => {

        const thisNode = this.getNode();
        const thisNodeModelType = thisNode.getOptions()["extras"]["type"];
        const thisName: string = port.getName();
        const thisLabel: string = "**" + port.getOptions()["label"] + "**";
        const sourcePortName: string = thisPort.getName();
        const thisPortType: string = thisName.split('-')[1];
        const sourcePortType: string = sourcePortName.split('-')[2];
        let thisPortTypeText: string = "*`" + thisPortType + "`*";

        if (this.isParameterNode(thisNodeModelType) == true){
            // if the port you are trying to link ready has other links
            console.log("port name: ", thisName);
            console.log("parameter port: ", port.getNode().getInPorts());
            if (Object.keys(port.getLinks()).length > 0){
		        port.getNode().getOptions().extras["borderColor"]="red";
                // if port supports multiple types
                if (thisPortTypeText.includes(',')) {
                    thisPortTypeText = this.parsePortType(thisPortTypeText);
                }
		        port.getNode().getOptions().extras["tip"]=`Port ${thisLabel} doesn't allow multi-links of ${thisPortTypeText} type.`;
                port.getNode().setSelected(true);
                return false;
            }

            if (!thisName.startsWith("parameter")){
		        port.getNode().getOptions().extras["borderColor"]="red";
		        port.getNode().getOptions().extras["tip"]= `Port ${thisLabel} linked is not a parameter, please link a non parameter node to it.`;
                port.getNode().setSelected(true);
                return false;
            }

            for (let i = 0; i < port.getNode().getInPorts().length; i++){

                let thisLinkedID = port.getNode().getInPorts()[i].getOptions()["id"];
                if (port.getID() == thisLinkedID)
                    var index = i;

            }

            let thisLinkedName = port.getNode().getInPorts()[index].getOptions()["name"];
            let regEx = /\-([^-]+)\-/;
            let result = thisLinkedName.match(regEx);
            let thisLinkedPortType = result[1];

            if(thisNodeModelType != thisLinkedPortType){
                // Skip 'any' type check
                if(thisLinkedPortType == 'any'){
                    return;
                }
                // if multiple types are accepted by target node port, check if source port type is among them
                if(thisLinkedPortType.includes(thisNodeModelType)) {
                    return;
                }
		        port.getNode().getOptions().extras["borderColor"]="red";

                // if a list of types is provided for the port, parse it a bit to display it nicer
                if (thisLinkedPortType.includes(',')) {
                    thisLinkedPortType = this.parsePortType(thisLinkedPortType)
                }
		        port.getNode().getOptions().extras["tip"]= `Incorrect data type. Port ${thisLabel} is of type ` + "*`" + thisLinkedPortType + "`*.";
                port.getNode().setSelected(true);
                //tested - add stuff
                return false;
            }

        }else{
            if(Object.keys(port.getLinks()).length > 0){
		        port.getNode().getOptions().extras["borderColor"]="red";
		        port.getNode().getOptions().extras["tip"]= `Xircuits only allows 1 link per InPort! Please delete the current link to proceed.`;
                port.getNode().setSelected(true);
                return false;
            }
            //return(!(thisName.startsWith("parameter")) && !(Object.keys(port.getLinks()).length > 0));
        }
        this.removeErrorTooltip(this, port);
        return true;
    }

    isParameterNode = (nodeModelType: string) => {
        return (
            nodeModelType === 'boolean' ||
            nodeModelType === 'int' ||
            nodeModelType === 'float' ||
            nodeModelType === 'string' ||
            nodeModelType === 'list' ||
            nodeModelType === 'tuple' ||
            nodeModelType === 'dict' ||
            nodeModelType === 'secret'
        );
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

        while ((sourceNode != null) &&
                nodeType != 'Start' &&
                nodeType != 'boolean' &&
                nodeType != 'int' &&
                nodeType != 'float' &&
                nodeType != 'string' &&
                nodeType != 'list' &&
                nodeType != 'tuple' &&
                nodeType != 'dict' &&
                nodeType != 'secret'){
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
    parsePortType = (portType: string) => {
        // port type is of form: Union[type1, type2]
        portType = portType.replace('Union', '');    // remove Union word
        portType = portType.replace(/[\[\]]/g, '');  // remove square brackets
        portType = portType.replace(',', ' or ');
        return portType;
    }

}
