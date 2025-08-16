import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Notification } from '@jupyterlab/apputils';
import { requestAPI } from '../server/handler';
import { handleInstall } from '../context-menu/TrayContextMenu';
import { commandIDs } from '../commands/CommandIDs';
import { CustomNodeModel } from '../components/node/CustomNodeModel';

export function showNodeCenteringNotification(
  message: string,
  nodeId: string,
  engine?: DiagramEngine
) {
  const options: any = { autoClose: 3000 };

  if (engine) {
    options.actions = [
      {
        label: 'Show Node',
        caption: 'Show Node on canvas',
        callback: (event: MouseEvent) => {
          event.preventDefault();
          centerNodeInView(engine, nodeId);
        }
      }
    ];
  }

  Notification.error(message, options);
}

export function centerNodeInView(engine: DiagramEngine, nodeId: string) {
  const model = engine.getModel();
  const node  = model.getNode(nodeId);
  if (!node) return;

  const { x, y } = node.getPosition();
  const { width = 150, height = 100 } = (node as any).getSize?.() ?? {};

  const canvas  = (engine as any).canvas as HTMLElement;
  const content = canvas.closest(
    '.lm-Widget[role="region"][aria-label="main area content"]'
  ) as HTMLElement;
  if (!content) return;

  const { width: vpW, height: vpH } = content.getBoundingClientRect();
  const zoom = model.getZoomLevel() / 100;

  const offsetX = vpW / 2 - (x + width / 2) * zoom;
  const offsetY = vpH / 2 - (y + height / 2) * zoom;

  node.getOptions().extras["borderColor"]="red";
  node.setSelected(true);

  model.setOffset(offsetX, offsetY);
  engine.repaintCanvas();
}

type LibraryInfo = { name: string | null; path?: string | null };

const LIB_REGEX = /xai_components[\/\\]([^\/\\]+)/i;

export function getLibraryFromPath(path?: string): string | null {
  if (!path) return null;
  const m = path.match(LIB_REGEX);
  return m?.[1] ?? null;
}

export async function resolveComponentLibrary(node: CustomNodeModel): Promise<LibraryInfo> {
  const extras: any = node?.getOptions?.().extras ?? {};
  const path = extras?.path || null;

  if (!path) {
    return { name: null, path: null };
  }

  const libFromPath = getLibraryFromPath(path);
  if (libFromPath) {
    return { name: libFromPath, path };
  }

  return { name: null, path };
}
export async function showInstallForRemoteLibrary(args: {
  app: any;                    
  engine?: DiagramEngine;
  nodeId: string;
  libName?: string | null;
  path?: string | null;
  message: string;

}): Promise<boolean> {
  const { app, engine, nodeId, message } = args;

  // Normalize to internal id: xai_<name>
  let libId = String(args.libName ?? '').trim().toLowerCase();
  if (!libId) return false;
  if (!libId.startsWith('xai_')) libId = `xai_${libId}`;

  // Display name: OPENAI / FLASK ...
  const displayName = libId.replace(/^xai_/, '').toUpperCase();

  // Query library catalog/config to check "remote" status
  let config: any;
  try {
    config = await requestAPI<any>('library/get_config', { method: 'GET' });
  } catch {
    return false;
  }

  const libs = config?.config?.libraries ?? [];
  const entry = libs.find((l: any) => (l?.name || '').toLowerCase() === libId);
  if (!entry || String(entry.status).toLowerCase() !== 'remote') {
    return false;
  }

  const actions: any[] = [
    {
      label: `Install ${displayName}`,
      caption: `Install ${displayName} library`,
      callback: async (event: MouseEvent) => {
        event.preventDefault();
        await handleInstall(
          app,
          displayName,
          () => app.commands.execute(commandIDs.refreshComponentList)
        );
      }
    }
  ];

  if (engine) {
    actions.push({
      label: 'Show Node',
      caption: 'Center this node on canvas',
      callback: (event: MouseEvent) => {
        event.preventDefault();
        centerNodeInView(engine, nodeId);
      }
    });
  }

  Notification.error(message, { autoClose: 3000, actions });
  return true;
}