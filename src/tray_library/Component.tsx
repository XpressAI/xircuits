import { showDialog, Dialog } from '@jupyterlab/apputils';
import { requestAPI } from "../server/handler";
import React from 'react';

let componentsCache = {
  data: null
};

async function fetchComponents() {
  console.log("Fetching all components... this might take a while.")
  try {
    const componentsResponse = await requestAPI<any>('components/');
    const components = componentsResponse["components"];
    const error_msg = componentsResponse["error_msg"];

    if (error_msg) {
      showDialog({
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
  }
}

async function get_all_components_method() {
  if (!componentsCache.data) {
    componentsCache.data = await fetchComponents();
  }

  return componentsCache.data;
}

export async function ComponentList() {
  let component_list_result = await get_all_components_method();
  return component_list_result;
}

export async function refreshComponentListCache() {
  componentsCache.data = await fetchComponents();
}
