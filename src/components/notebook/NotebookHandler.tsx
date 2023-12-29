import { FileDialog } from "@jupyterlab/filebrowser";
import { requestAPI } from "../../server/handler";

export async function handleNotebookComponent(node, app, docmanager) {
    
    const manager = docmanager;
    const dialog = FileDialog.getOpenFiles({
        manager,
        // filter: model => model.type == 'notebook' 
        filter: model => {
            if (model.type === 'notebook') {
                return { score: 1, indices: null }; 
            }
            return null;
        }
    });
    const result = await dialog;

    if(!result.button.accept) return

    // TODO: Only allow users to select 1 file
    let notebook = result.value[0];
    // await app.commands.execute(commandIDs.convertNotebook, { notebook });
    let notebook_component = await requestToConvertNotebook(notebook.path)
}

async function requestToConvertNotebook(path: string) {
    const data = {
      "outPath": path.split(".ipynb")[0] + ".py",
      "filePath": path,
    };

    try {
      return await requestAPI<any>('notebook/convert', {
        body: JSON.stringify(data),
        method: 'POST',
      });

    } catch (reason) {
      console.error(
        'Error on POST /xircuits/notebook/convert', data, reason
      );
    }
  }