import { useEffect } from 'react';
import type { DiagramEngine } from '@projectstorm/react-diagrams';
import { nodeNoticeBus, type NodeNotice } from './portNoticeBus';
import { showNodeCenteringNotification } from './notificationEffects';

export function useNodeNotice(getEngine: () => DiagramEngine | undefined) {
  useEffect(() => {
    const onNotice = (_: unknown, p: NodeNotice) => {
      const engine = getEngine();
      if (!engine) return;

      const myModelId = engine.getModel()?.getID?.();
      if (!p.modelId || p.modelId !== myModelId) return;

      showNodeCenteringNotification(p.message, p.nodeId, engine);
    };

    nodeNoticeBus.signal.connect(onNotice);
    return () => {
            nodeNoticeBus.signal.disconnect(onNotice);
        }
  }, [getEngine]);
}
