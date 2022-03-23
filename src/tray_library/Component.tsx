import { ServiceManager } from '@jupyterlab/services';
import { showDialog, Dialog } from '@jupyterlab/apputils';

import {requestAPI} from "../server/handler";
import React from 'react';

async function get_all_components_method() {
    const response = await requestAPI<any>('components/');
    const components = response["components"];
    const error_msg = response["error_msg"];
    let error_occured : boolean = false;

    if(error_msg){
        showDialog({
            title: 'Parse Component Failed',
            body: (
                <pre>{error_msg}</pre>
            ),
            buttons: [Dialog.warnButton({ label: 'OK' })]
        });
        error_occured = true;
    }
    return [components, error_occured];
}

export default async function ComponentList(serviceManager: ServiceManager) {
    let component_list_result = await get_all_components_method();
    
    return component_list_result;
}
