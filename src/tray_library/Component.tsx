import { Notification } from '@jupyterlab/apputils';
import { requestAPI } from "../server/handler";
import { openFileAtLine } from '../helpers/fileOpenHelper';   
import { JupyterFrontEnd }   from '@jupyterlab/application';   

let componentsCache = {
  data: null
};

let _app: JupyterFrontEnd | null = null;
    
export function initComponentFetcher(app: JupyterFrontEnd) {   
  _app = app;
}                   

export async function fetchComponents() {
  console.log("Fetching all components... this might take a while.")
  try {
    const componentsResponse = await requestAPI<any>('components/');
    const components = componentsResponse["components"];
    const error_info = componentsResponse["error_info"];
    if (error_info) {
      const { full_path, line, end_lineno, message } = error_info;
      const uniqueId = `${full_path}:${line}`;
      const formatted =`Error found in: ${uniqueId}\n❌ ${message}`;

      Notification.error(formatted, {autoClose: 6000,
        actions: [{
          label: 'Open File',
          caption: 'Open file',
          callback: () => {openFileAtLine(_app, full_path, { lineno: line, end_lineno });}
        }]
      });
    }
    console.log("Fetch complete.")
    return components;
  } catch (error) {
    console.error('Failed to get components', error);
  }
}

export async function ComponentList() {

  if (!componentsCache.data) {
    componentsCache.data = await fetchComponents();
  }

  return componentsCache.data;
}

export async function refreshComponentListCache() {
  componentsCache.data = await fetchComponents();
}
