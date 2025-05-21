import { showDialog, Dialog } from '@jupyterlab/apputils';
import { requestAPI } from "../server/handler";
import React from 'react';

let componentsCache = {
  data: null
};
// When true, indicates a manual reload. Used to show error popup only during manual reloads.
let isManualReload = false;

export async function manualReload() {
  isManualReload = true;
  await refreshComponentListCache();    
}

export async function fetchComponents() {
  console.log("Fetching all components... this might take a while.")
  try {
    const componentsResponse = await requestAPI<any>('components/');
    const components = componentsResponse["components"];
    const error_msg = componentsResponse["error_msg"];

    if (error_msg && isManualReload) {
      await showDialog({
        title: 'Parse Component Failed',
        body: (
          <pre>{error_msg}</pre>
        ),
        buttons: [Dialog.warnButton({ label: 'OK' })]
      });
    }
    console.log("Fetch complete.")
    return components;
  } catch (error) {
    console.error('Failed to get components', error);
    if (isManualReload) {
      // Show error popup only if this is a manual reload
      await showDialog({
        title: 'Network Error',
        body: <pre>{String(error)}</pre>,
        buttons: [Dialog.warnButton({ label: 'OK' })]
      });
    }

    componentsCache.data = null;
    return []; 
  } finally {
    isManualReload = false;
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
