import {
  DefaultLinkModel,
  DiagramModel,
  PointModel
} from '@projectstorm/react-diagrams';
import { Point } from '@projectstorm/geometry';
import { CustomPortModel } from '../port/CustomPortModel';
import { CustomNodeModel } from '../node/CustomNodeModel';
import { Notification } from '@jupyterlab/apputils';

/**
 * Calculates the squared distance from point `p` to the closest point on segment AB.
 * Used to find which segment of the original link is closest to the dropPosition location.
 */
const dist2Seg = (p: Point, a: Point, b: Point) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (!dx && !dy) return (p.x - a.x)**2 + (p.y - a.y)**2;
    const t = Math.max(
        0,
        Math.min(
          1,
          ((p.x - a.x)*dx + (p.y - a.y)*dy)/(dx*dx + dy*dy)
      )
    );
    const qx = a.x + t*dx, qy = a.y + t*dy;
    return (p.x - qx)**2 + (p.y - qy)**2;
  };

export class SplitLinkCommand {
    constructor(
        private diagramModel : DiagramModel,
        private draggedNode  : CustomNodeModel,
        private linkId       : string,
        private dropPosition : Point
      ) {}

  // Helper to clone a point onto a new link (maintains internal refs).
  private clonePoint(orig: PointModel, link: DefaultLinkModel): PointModel {
      return link.generatePoint(orig.getX(), orig.getY());
  }

   /** Remove all links on *any* port of the dragged node */
  private clearAllNodeLinks() {
    Object.values(this.draggedNode.getPorts()).forEach(port =>
      Object.values((port as CustomPortModel).getLinks()).forEach(l => this.diagramModel.removeLink(l))
    );
  }
  execute(): void {
      const inPort = this.draggedNode.getPort('in-0') as CustomPortModel;
      const outPort = this.draggedNode.getPort('out-0') as CustomPortModel;

    if (!inPort || !outPort) {
        Notification.error("This component can't connect — missing ports.", { autoClose: 3000 });
        return;
    }
    
    this.clearAllNodeLinks();

    const existingInLinks = Object.values(inPort.getLinks());
    const existingOutLinks = Object.values(outPort.getLinks());
    if (existingInLinks.length > 0 || existingOutLinks.length > 0) {
        Notification.info("One or more ports are already connected. Existing connections will be removed.", { autoClose: 3000 });
        existingInLinks.forEach(l => this.diagramModel.removeLink(l));
        existingOutLinks.forEach(l => this.diagramModel.removeLink(l));
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

    const points = [...oldLink.getPoints()];
    this.diagramModel.removeLink(oldLink);

    // Straight link (no bends)
    if (points.length <= 2) {
        const leftLink = new DefaultLinkModel();
        const rightLink = new DefaultLinkModel();
        leftLink.setSourcePort(srcPort);
        leftLink.setTargetPort(inPort);
        rightLink.setSourcePort(outPort);
        rightLink.setTargetPort(dstPort);
        this.diagramModel.addLink(leftLink);
        this.diagramModel.addLink(rightLink);
        return;
    }

    // Find the segment closest to the dropPosition point
    let segIdx = 0, minDist = Infinity;
    points.slice(0, -1).forEach((_, i) => {
        const a = new Point(points[i].getX(), points[i].getY());
        const b = new Point(points[i+1].getX(), points[i+1].getY());
        const d2 = dist2Seg(this.dropPosition, a, b);
      if (d2 < minDist) {
          minDist = d2;
          segIdx = i;
      }
    });

    // Clone original link twice to retain type and options
    const leftLink = oldLink.clone() as DefaultLinkModel;
    const rightLink = oldLink.clone() as DefaultLinkModel;

    // Prepare point arrays (including drop point)
    const leftBends: PointModel[] = points
        .slice(0, segIdx + 1)
        .map(p => this.clonePoint(p, leftLink));
    leftBends.push(leftLink.generatePoint(this.dropPosition.x, this.dropPosition.y));

    const rightBends: PointModel[] = [
        rightLink.generatePoint(this.dropPosition.x, this.dropPosition.y),
        ...points.slice(segIdx + 1).map(p => this.clonePoint(p, rightLink))
    ];

    // Assign ports & set points
    leftLink.setSourcePort(srcPort);
    leftLink.setTargetPort(inPort);
    leftLink.setPoints(leftBends);

    rightLink.setSourcePort(outPort);
    rightLink.setTargetPort(dstPort);
    rightLink.setPoints(rightBends);

    this.diagramModel.addLink(leftLink);
    this.diagramModel.addLink(rightLink);
    
    // Highlight new links
    leftLink.setSelected(true);
    rightLink.setSelected(true);
    leftBends.forEach(pt => pt.setSelected(true));
    rightBends.forEach(pt => pt.setSelected(true));
  }
}
