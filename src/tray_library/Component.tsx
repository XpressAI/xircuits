import { showDialog, Dialog } from '@jupyterlab/apputils';
import { requestAPI } from "../server/handler";
import React from 'react';

let componentsCache = {
  data: null
};

export async function fetchComponents(showError = true): Promise<any[] | null> {
  try {
    const componentsResponse = await requestAPI<any>('components/');
    const components = componentsResponse["components"];
    const error_msg = componentsResponse["error_msg"];

    if (error_msg) {
      if (showError) {
        await showDialog({
        title: 'Parse Component Failed',
        body: (
          <pre>{error_msg}</pre>
        ),
        buttons: [Dialog.warnButton({ label: 'OK' })]
      });
      }
      return components;
    }
    return componentsResponse.components ?? [];   
  } catch (error) {
    console.error('Failed to get components', error);
    if (showError) {
      await showDialog({
        title: 'Failed to get components',
        body: <pre>{String(error)}</pre>,
        buttons: [Dialog.warnButton({ label: 'OK' })]
      });
    }
    return null;
  }
}

export async function refreshComponentListCache(
  showError = true
): Promise<boolean> {
  const newData = await fetchComponents(showError);

  if (Array.isArray(newData) && newData.length > 0) {
    componentsCache.data = newData;
    return true;            
  }
  return false;             
}
 
export async function ComponentList(showError = true): Promise<any[]> {
  if (!componentsCache.data) {
    await refreshComponentListCache(showError);   
  }
  return componentsCache.data ?? [];
}