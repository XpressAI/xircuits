import { showDialog, Dialog } from '@jupyterlab/apputils';

import { requestAPI } from "../server/handler";
import React from 'react';

async function get_all_components_method() {

    try {
      // Trigger the load library config on refresh
      await requestAPI('library/reload_config', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  
      // Proceed with the GET request to fetch components
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
  
      return components;
    } catch (error) {
      console.error('Failed to get components or trigger library reload', error);
      // Handle the error appropriately in your application
    }
  }
  

export default async function ComponentList() {
    let component_list_result: string[] = await get_all_components_method();

    return component_list_result;
}
