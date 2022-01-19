import { ServiceManager } from '@jupyterlab/services';

import {requestAPI} from "../server/handler";

async function get_all_components_method() {
    const components = await requestAPI<any>('components/');
    return components;
}

export default async function ComponentList(serviceManager: ServiceManager) {
    let component_list_result: string[] = await get_all_components_method();
    
    return component_list_result;
}
