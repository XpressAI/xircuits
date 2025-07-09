import { JupyterFrontEnd } from '@jupyterlab/application';

interface PendingErrorToast {
  text: string;
  fullPath: string;
  line: number;
  app: JupyterFrontEnd;
}

const pendingToasts: PendingErrorToast[] = [];
let observerStarted = false;

export function linkErrorToast(
  toastText: string,
  fullPath: string,
  line: number,
  app: JupyterFrontEnd
)
 {
  pendingToasts.push({ text: toastText, fullPath, line, app });
  if (!observerStarted) {
    startToastObserver();
    observerStarted = true;
  }
}

function startToastObserver() {
  const observer = new MutationObserver((records) => {
    for (const rec of records) {
      rec.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        const toastEls: HTMLElement[] = node.matches?.('.Toastify__toast')
          ? [node]
          : Array.from(node.querySelectorAll('.Toastify__toast') ?? []);

        toastEls.forEach((toastEl) => {
          if (toastEl.dataset.linkified) return;

          const toastText =
            toastEl.querySelector('.jp-toast-message')?.textContent ?? '';


          const idx = pendingToasts.findIndex((p) =>
            toastText.includes(`Error found in: ${p.text}`)
          );
          if (idx === -1) {
            console.warn("No match found for toast:", toastText);
            return;
          }

          const { fullPath, line, app } = pendingToasts[idx];
          console.log("Matching toast found. Attaching link...");
          pendingToasts.splice(idx, 1);
          attachFileLink(toastEl, fullPath, line, app);
        });
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function attachFileLink(
  toastEl: HTMLElement,
  file: string,
  line: number,
  app: JupyterFrontEnd
) {
  toastEl.dataset.linkified = 'true';
  toastEl.style.cursor = 'pointer';
  toastEl.title = `Open ${file}:${line}`;

  toastEl.addEventListener('click', async () => {
  console.log(`Opening file: ${file}:${line}`);  

  try {
    const widget: any = await app.commands.execute('docmanager:open', {
      path: file,
      factory: 'Editor'
    });
    await widget.context.ready;
    const editor = widget?.content?.editor;
    if (editor && typeof editor.setCursorPosition === 'function') {
      const pos = { line: line - 1, column: 0 };
      editor.setCursorPosition(pos);
      editor.revealPosition(pos);
    } else {
      console.warn("Editor not found or invalid");
    }
  } catch (err) {
    console.error("Failed to open file:", err);
  }
});
}