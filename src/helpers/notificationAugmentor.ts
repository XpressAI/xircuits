import { Notification, showDialog, Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { copyIcon } from '@jupyterlab/ui-components';

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
      const DURATION = 1200;

      const dialogBody = new Widget();
      dialogBody.addClass('xircuits-notification-details');

      const wrap = document.createElement('div');
      wrap.className = 'x-details-copyWrap';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'x-copy-icon-btn jp-Button jp-mod-minimal';
      copyBtn.type = 'button';
      copyBtn.title = 'Copy';
      copyBtn.setAttribute('aria-label', 'Copy');
      copyIcon.element({ container: copyBtn, height: '16px', width: '16px' });

      wrap.appendChild(copyBtn);

      const pre = document.createElement('pre');
      pre.className = 'x-details-pre';
      pre.textContent = fullMessage;

      dialogBody.node.append(wrap, pre);

      let timer: number | null = null;
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(fullMessage);

          copyBtn.classList.add('is-copied');
          copyBtn.title = 'Copied';
          copyBtn.setAttribute('aria-label', 'Copied');

          if (timer) clearTimeout(timer);
          timer = window.setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            copyBtn.title = 'Copy';
            copyBtn.setAttribute('aria-label', 'Copy');
            timer = null;
          }, DURATION);
        } catch (err) {
          console.error('Copy failed', err);
        }
      });

      await showDialog({
        title: dialogTitle,
        body: dialogBody,
        buttons: [Dialog.okButton({ label: 'Close' })]
      });
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
