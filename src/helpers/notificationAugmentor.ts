import { Notification, showDialog, Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

const MAX_VISIBLE_CHARS = 140;
const VIEW_DETAILS_LABEL = 'View details';

function toPlainText(value: unknown): string {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? '');
  }
}

function createViewDetailsAction(fullMessage: string, dialogTitle = 'Details'): Notification.IAction {
  return {
    label: VIEW_DETAILS_LABEL,
    caption: 'Show full message',
    callback: async () => {
      const dialogBody = new Widget();
      dialogBody.addClass('xircuits-notification-details');

      const pre = document.createElement('pre');
      pre.textContent = fullMessage;
      dialogBody.node.appendChild(pre);

      const copyButton = Dialog.createButton({ label: 'Copy' });
      const closeButton = Dialog.okButton({ label: 'Close' });

      const result = await showDialog({
        title: dialogTitle,
        body: dialogBody,
        buttons: [copyButton, closeButton]
      });

      if (result.button.label === 'Copy') {
        await navigator.clipboard.writeText(fullMessage);
      }
    }
  };
}

function ensureViewDetailsAction(
  messageText: string,
  options: any = {},
  title?: string
): any {
  if (messageText.length <= MAX_VISIBLE_CHARS) return options;
  const actions = [...(options.actions ?? [])];
  if (!actions.some((a: any) => a?.label === VIEW_DETAILS_LABEL)) {
    actions.push(createViewDetailsAction(messageText, title));
  }
  return { ...options, actions };
}

export function augmentNotifications(): void {
  const NotificationObj: any = Notification as any;
  if (NotificationObj.__xircuitsAugmented) return;

  const wrap = (method: 'error' | 'warning' | 'info' | 'success') => {
    const original = NotificationObj[method]?.bind(Notification);
    if (!original) return;

    NotificationObj[method] = (...args: any[]) => {
      const [rawMessage, rawOptions] = args;
      const text = toPlainText(rawMessage);
      const options = ensureViewDetailsAction(text, rawOptions);
      return original(text, options);
    };
  };

  ['error', 'warning', 'info', 'success'].forEach(wrap);
  NotificationObj.__xircuitsAugmented = true;
}
