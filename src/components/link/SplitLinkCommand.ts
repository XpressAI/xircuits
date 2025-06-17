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

  // Creates a new link between two ports and inserts bend-points if needed
  private createLink(
    src: CustomPortModel,
    dst: CustomPortModel,
    bends: PointModel[]
  ) {
    const newLink = new DefaultLinkModel();
    newLink.setSourcePort(src);
    newLink.setTargetPort(dst);
    bends.forEach(p =>
      newLink.addPoint(newLink.generatePoint(p.getX(), p.getY()), newLink.getPoints().length - 1)
    );
    this.diagramModel.addLink(newLink);
  }

  execute() {
    const inPort = this.draggedNode.getPort('in-0') as CustomPortModel;
    const outPort = this.draggedNode.getPort('out-0') as CustomPortModel;

    if (!inPort || !outPort) {
      Notification.error("This component can't connect — missing ports.", { autoClose: 3000 });
      return;
    }

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

    const points = oldLink.getPoints();
    this.diagramModel.removeLink(oldLink);

    // Straight link (no bends)
    if (points.length <= 2) {
      this.createLink(srcPort, inPort, []);
      this.createLink(outPort, dstPort, []);
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

    // Bend-points before and after the dropPosition segment (excluding endpoints)
    const leftBends = segIdx > 0 ? points.slice(1, segIdx+1) : [];
    const rightBends = segIdx+1 < points.length-1 ? points.slice(segIdx+1, -1) : [];

    // Reconnect with preserved bend-points
    this.createLink(srcPort, inPort, leftBends);
    this.createLink(outPort, dstPort, rightBends);
  }
}
