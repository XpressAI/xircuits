import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Notification } from '@jupyterlab/apputils';
import { requestAPI } from '../server/handler';
import { handleInstall } from '../context-menu/TrayContextMenu';
import { commandIDs } from '../commands/CommandIDs';
import { normalizeLibraryName } from '../tray_library/ComponentLibraryConfig';

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
type LibraryEntry = { library_id: string; status: string; [k: string]: any };

function pathToLibraryId(rawPath?: string | null): string | null {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const m = rawPath.match(/xai_components[\/\\]([a-z0-9_-]+)[\/\\]/i);
  if (!m) return null;
  return normalizeLibraryName(m[1]);
}

async function loadLibraryIndex(): Promise<Map<string, LibraryEntry>> {
  const res: any = await requestAPI('library/get_config', { method: 'GET' });
  const libs = res?.config?.libraries;
  if (!Array.isArray(libs)) throw new Error('Invalid library response');

  const index = new Map<string, LibraryEntry>();
  for (const lib of libs as LibraryEntry[]) {
    if (!lib?.library_id) continue;
    const id = normalizeLibraryName(String(lib.library_id));
    index.set(id, lib);
  }
  return index;
}

function computeStatusFromEntry(entry?: LibraryEntry, normalizedId?: string): { libId: string | null; status: LibraryStatus } {
  if (!entry) return { libId: null, status: 'unknown' };
  const s = String(entry.status).toLowerCase();
  return { libId: normalizedId, status: s === 'remote' ? 'remote' : 'installed' };
}

export async function resolveLibraryForNode(
  node: any
): Promise<{ libId: string | null; status: LibraryStatus }> {
  const extras = node?.getOptions?.().extras ?? {};
  const candidateId = pathToLibraryId(extras.path);
  if (!candidateId) return { libId: null, status: 'unknown' };

  const idx = await loadLibraryIndex();
  const entry = idx.get(candidateId);
  return computeStatusFromEntry(entry, candidateId);
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

  const rawName = (args.libName ?? '').trim();
  if (!rawName) return false;
  const candidateId = normalizeLibraryName(rawName);
  const idx = await loadLibraryIndex();
  const entry = idx.get(candidateId);
  const { libId, status } = computeStatusFromEntry(entry, candidateId);

  if (status !== 'remote' || !libId) return false;

  const displayName = entry.library_id;
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
