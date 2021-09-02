import {DefaultPortModel} from "@projectstorm/react-diagrams";
import {PortModel} from "@projectstorm/react-diagrams-core";

/**
 * @author wenfeng xu
 * custom port model enable it can execute some rule
 * before it can link to another
 */
export class CustomPortModel extends DefaultPortModel  {
    canLinkToPort(port: PortModel): boolean {
        if (port instanceof DefaultPortModel) {
            if (this.options.in === port.getOptions().in) {
                return false;
            }
        } else if (port instanceof CustomPortModel) {
            return this.canTriangleLinkToTriangle(port) || this.canParameterLinkToPort(port);
        }

        return true;
    }

    /**
     * the qty of ports of parameter node link to the same port in other node can
     * not be more than one
     * @param port
     */
    canParameterLinkToPort = (port: PortModel) => {
        let thisNode = this.getNode();
        let thisNodeModelType = thisNode.getOptions()["extras"]["type"];

        if (this.isParameterNode(thisNodeModelType)) {
            if (Object.keys(port.getLinks()).length > 0) {
               return false;
            }
        }
        return true;
    }

    isParameterNode = (nodeModelType: string) => {
        return (
            nodeModelType === 'literal' ||
            nodeModelType === 'int' ||
            nodeModelType === 'float' ||
            nodeModelType === 'string'
        );
    }

    canTriangleLinkToTriangle = (port: CustomPortModel) => {
        let portLabel = port.getOptions()["label"];
        let thisPortLabel = this.options["label"];
        let thisNode = this.getNode();
        let node = port.getNode();

        if (portLabel === '▶' && thisPortLabel === '▶') {
            let thisNodeModelType=thisNode.getOptions()["extras"]["type"];
            let nodeModelType=node.getOptions()["extras"]["type"];

            if (thisNodeModelType == "Start" && nodeModelType != "in") {
                return false;
            }
            if (thisNodeModelType == "in" && nodeModelType != "split" && nodeModelType != "in") {
                return false;
            }
            if (thisNodeModelType == "split" && nodeModelType != "train" && nodeModelType != "out") {
                return false;
            }
            if (thisNodeModelType == "out" && nodeModelType != "train") {
                return false;
            }
            if (thisNodeModelType == "train" && nodeModelType != "eval") {
                return false;
            }
            if (thisNodeModelType == "eval" && nodeModelType != "Finish") {
                return false;
            }

        }
        return true;
    }
}
