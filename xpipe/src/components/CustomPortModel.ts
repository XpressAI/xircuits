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
                console.log("in not connected to in");
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
            console.log("triangle to triangle failed.");
            return false;
        }

        let checkLinkDirection = this.checkLinkDirection(this, port);

        if (checkLinkDirection == false){
            console.log("Port should be created from outPort [right] to inPort [left]");
            return false;
        }

        let checkExecutionLoop = this.checkExecutionLoop(this, port);

        if (checkExecutionLoop == false){
            //console.log("Loop detected.");
            return false;
        }

        return true;
    }

    /**
     * the qty of ports of parameter node link to the same port in other node can
     * not be more than one
     * @param thisPort
     * @param port
     */
    canParameterLinkToPort = (thisPort, port) => {

        let thisNode = this.getNode();
        let thisNodeModelType = thisNode.getOptions()["extras"]["type"];
        let thisName = port.getName();


        if (this.isParameterNode(thisNodeModelType) == true){
            // if the port you are trying to link ready has other links
            console.log("port name: ", thisName);
            console.log("parameter port: ", port.getNode().getInPorts());
            if (Object.keys(port.getLinks()).length > 0){
                console.log("port has other link.");
               return false;
            }

            console.log("Is correct node Model Type");

            if (!thisName.startsWith("parameter")){
                console.log("port linked not parameter.");
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

            console.log("thisLinkedName ", thisLinkedName)
            console.log("result ", result)

            if(thisNodeModelType != result[1]){
                console.log("thisNodeModelType ", thisNodeModelType)
                console.log("result[1] ",result[1])
                console.log("port linked not correct type.");
                return false;
            }

        }else{
            return(!(thisName.startsWith("parameter")) && !(Object.keys(port.getLinks()).length > 0));
        }
        return true;
    }

    isParameterNode = (nodeModelType: string) => {
        return (
            nodeModelType === 'boolean' ||
            nodeModelType === 'int' ||
            nodeModelType === 'float' ||
            nodeModelType === 'string'
        );
    }

    canTriangleLinkToTriangle = (thisPort, port) => {

        let portLabel = port.getOptions()["label"];
        let thisPortLabel = this.options["label"];
        let thisNode = this.getNode();
        let node = port.getNode();

        let thisNodeModelType = thisNode.getOptions()["extras"]["type"];

        if (this.isParameterNode(thisNodeModelType)){
            return true;
        }

        if (!(thisPortLabel.endsWith('▶'))){
            return true;
        }else{
            return (portLabel === '▶' && thisPortLabel.endsWith('▶') && !(Object.keys(thisPort.getLinks()).length > 1));
        }
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

        nodeIDList.push(sourceNode.getID(), targetNode.getID());

        //console.log("sourceNode is:", sourceNode.getOptions()["name"], "\ntargetNode is:", targetNode.getOptions()["name"]);

        while ((sourceNode != null) && sourceNode.getOptions()["name"]!="Start"){
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

}
