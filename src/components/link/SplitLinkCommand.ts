import {
  DefaultLinkModel,
  DiagramModel
} from '@projectstorm/react-diagrams';
import { Point } from '@projectstorm/geometry';
import { CustomPortModel } from '../port/CustomPortModel';
import { CustomNodeModel } from '../node/CustomNodeModel';
import { Notification } from '@jupyterlab/apputils';

export class SplitLinkCommand {
    constructor(
        private diagramModel : DiagramModel,
        private draggedNode   : CustomNodeModel,
        private linkId        : string,   
        private dropPosition  : Point      
    ) {}

    private forceLink(src: CustomPortModel, dst: CustomPortModel): void {
        Object.values(src.getLinks()).forEach(l => this.diagramModel.removeLink(l));
        Object.values(dst.getLinks()).forEach(l => this.diagramModel.removeLink(l));

        // Create and add new link directly
        const newLink = new DefaultLinkModel();
        newLink.setSourcePort(src);
        newLink.setTargetPort(dst);
        this.diagramModel.addLink(newLink);
    }

    execute(): void {
        const sourcePort = this.draggedNode.getPort("in-0");
        const targetPort = this.draggedNode.getPort("out-0");

        if (
            (sourcePort && Object.keys(sourcePort.getLinks()).length > 0) ||
            (targetPort && Object.keys(targetPort.getLinks()).length > 0)
            ) {
            Notification.info("One or more ports are already connected. Existing connection will be overwritten.", { autoClose: 3000 });
            }

        if (!sourcePort || !targetPort) {
            Notification.error("This component can't connect — missing ports.", { autoClose: 3000 });
            return;
        }
        const oldLink = this.diagramModel.getLink(this.linkId) as DefaultLinkModel;
        if (!oldLink) return;

        const srcPort = oldLink.getSourcePort() as CustomPortModel;
        const dstPort = oldLink.getTargetPort() as CustomPortModel;
        if (!srcPort || !dstPort) return;
        if (srcPort.getName() !== 'out-0' || dstPort.getName() !== 'in-0') {
        return;
        }

        if (!this.diagramModel.getNode(this.draggedNode.getID())) {
        this.diagramModel.addNode(this.draggedNode);
        }

        this.draggedNode.setPosition(this.dropPosition.x, this.dropPosition.y);

        const inPort  = this.draggedNode.getPort('in-0')  as CustomPortModel;
        const outPort = this.draggedNode.getPort('out-0') as CustomPortModel;
        if (!inPort || !outPort) {
        console.warn('[SplitLink] Dropped node is missing in-0 or out-0 ports.');
        return;
        }

        this.diagramModel.removeLink(oldLink);

        Object.values(srcPort.getLinks()).forEach(l => this.diagramModel.removeLink(l));
        Object.values(inPort.getLinks()).forEach(l => this.diagramModel.removeLink(l));
        Object.values(dstPort.getLinks()).forEach(l => this.diagramModel.removeLink(l));

        this.forceLink(srcPort, inPort);   
        this.forceLink(outPort, dstPort); 
    }
    }
