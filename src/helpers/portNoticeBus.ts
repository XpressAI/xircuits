import { Signal } from '@lumino/signaling';

export type NodeNotice = {
  message: string;
  nodeId: string;
  modelId?: string;
};

class NodeNotificationBus {
  readonly signal = new Signal<this, NodeNotice>(this);
  emit(payload: NodeNotice) { this.signal.emit(payload); }
}

export const nodeNoticeBus = new NodeNotificationBus();

export function emitPortNotice(p: NodeNotice) {
  nodeNoticeBus.emit(p);
}
