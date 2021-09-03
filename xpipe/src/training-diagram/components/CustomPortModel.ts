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

        }
        console.log("return true")
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

        return (portLabel === '▶' && thisPortLabel === '▶');
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

}
