import { JupyterFrontEnd } from '@jupyterlab/application';

interface ILineRange {
  lineno: number;
  end_lineno: number;   
}

export async function openFileAtLine(
  app: JupyterFrontEnd,
  filePath: string,
  range: ILineRange
): Promise<void> {
  const widget: any = await app.commands.execute('docmanager:open', {
    path: filePath,
    factory: 'Editor'
  });
  await widget.context.ready;

  await app.commands.execute('fileeditor:go-to-line', { line: range.end_lineno });

  await new Promise(res => setTimeout(res, 10));
  await app.commands.execute('fileeditor:go-to-line', { line: range.lineno });
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
