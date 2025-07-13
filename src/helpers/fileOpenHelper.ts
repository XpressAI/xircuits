import { JupyterFrontEnd } from '@jupyterlab/application';

export async function openFileAtLine(
  app: JupyterFrontEnd,
  filePath: string,
  line: number
): Promise<void> {
  const widget: any = await app.commands.execute('docmanager:open', {
    path: filePath,
    factory: 'Editor'
  });
  await widget.context.ready;

  const editor = widget?.content?.editor;
  if (editor?.setCursorPosition) {
    const pos = { line: line - 1, column: 0 };
    editor.setCursorPosition(pos);
    editor.revealPosition(pos);
  }
}

export async function openNodeScript(
  app: JupyterFrontEnd,
  filePath: string,
  lineInfo: { lineno: number; end_lineno: number }[],
  nodeName: string
): Promise<void> {
  await app.commands.execute('Xircuit-editor:open-node-script', {
    nodePath: filePath,
    nodeLineNo: lineInfo,
    nodeName
  });
}
