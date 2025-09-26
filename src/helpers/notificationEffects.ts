import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Notification } from '@jupyterlab/apputils';
import { requestAPI } from '../server/handler';
import { handleInstall } from '../context-menu/TrayContextMenu';
import { commandIDs } from '../commands/CommandIDs';

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

type LibraryStatus = 'installed' | 'incomplete' | 'remote' | 'unknown';

function pathToLibraryId(rawPath?: string | null): string | null {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const m = rawPath.match(/xai_components[\/\\]([a-z0-9_-]+)[\/\\]/i);
  if (!m) return null;
  return m[1].replace(/^xai[-_]/i, '').toUpperCase();
}

function computeStatusFromEntry(entry: any | undefined): { libId: string | null; status: LibraryStatus } {
  if (!entry) return { libId: null, status: 'unknown' };

  const libId = entry?.library_id ? String(entry.library_id).toUpperCase() : null;
  const status = String(entry?.status ?? '').toLowerCase();
  const isRemote = status === 'remote';

  return { libId, status: isRemote ? 'remote' : 'installed' };
}

export async function resolveLibraryForNode(
  node: any
): Promise<{ libId: string | null; status: LibraryStatus }> {
  const extras = node?.getOptions?.().extras ?? {};
  const candidateId = pathToLibraryId(extras.path);
  if (!candidateId) return { libId: null, status: 'unknown' };

  const res: any = await requestAPI('library/get_config', { method: 'GET' });
  const libraries: any[] = Array.isArray(res?.config?.libraries) ? res.config.libraries : [];

  const entry = libraries.find(e => String(e?.library_id ?? '').toUpperCase() === candidateId);
  return computeStatusFromEntry(entry);
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

  const candidateId = String(args.libName ?? '').trim().toUpperCase();
  if (!candidateId) return false;

  const res: any = await requestAPI('library/get_config', { method: 'GET' });
  const libraries: any[] = Array.isArray(res?.config?.libraries) ? res.config.libraries : [];

  const entry = libraries.find(e => String(e?.library_id ?? '').toUpperCase() === candidateId);
  const { libId, status } = computeStatusFromEntry(entry);

  if (status !== 'remote' || !libId) return false;

  const displayName = libId; 

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
