import { Notification } from '@jupyterlab/apputils';
import { requestAPI } from "../server/handler";
let componentsCache = {
  data: null
};

export async function fetchComponents() {
  console.log("Fetching all components... this might take a while.")
  try {
    const componentsResponse = await requestAPI<any>('components/');
    const components = componentsResponse["components"];
    const error_msg = componentsResponse["error_msg"];

    if (error_msg) {
      Notification.error(error_msg, { autoClose: 3000 });
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
