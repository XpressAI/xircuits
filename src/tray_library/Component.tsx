import { Notification } from '@jupyterlab/apputils';
import { requestAPI } from "../server/handler";
import { linkErrorToast } from '../helpers/errorToastLinks';   
import { JupyterFrontEnd }   from '@jupyterlab/application';   

let componentsCache = {
  data: null
};

let _app: JupyterFrontEnd | null = null;                       

export function initComponentFetcher(app: JupyterFrontEnd) {   
  _app = app;
}

export async function fetchComponents() {
  try {
    const componentsResponse = await requestAPI<any>('components/');
    const components = componentsResponse["components"];
    const error_info = componentsResponse["error_info"];
    if (error_info) {
      const uniqueId = `${error_info.full_path}:${error_info.line}`;
      const formatted =
        `Error found in: ${uniqueId}\n❌ ${error_info.message}`;

      Notification.error(formatted, { autoClose: 6000 });
      linkErrorToast(uniqueId, error_info.full_path, error_info.line, _app);
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
