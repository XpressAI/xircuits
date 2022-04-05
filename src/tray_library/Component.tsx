import { showDialog, Dialog } from '@jupyterlab/apputils';

import { requestAPI } from "../server/handler";
import React from 'react';

async function get_all_components_method() {
    const response = await requestAPI<any>('components/');
    const components = response["components"];
    const error_msg = response["error_msg"];

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
}

export default async function ComponentList() {
    let component_list_result: string[] = await get_all_components_method();

    return component_list_result;
}
