import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { BaseModelOptions, DeserializeEvent} from '@projectstorm/react-canvas-core';
import { CustomPortModel } from "../port/CustomPortModel";
import { CustomDynaPortModel, DYNAMIC_PARAMETER_NODE_TYPES, DynaPortRef } from "../port/CustomDynaPortModel";
import type { Point } from "@projectstorm/geometry";


export interface CustomNodeModelOptions extends BaseModelOptions {
    color?: string;
    name?: string;
    extras?: object;
}

export class CustomNodeModel extends DefaultNodeModel {
    color: string;
    name: string;
    extras: object;

    constructor(options: CustomNodeModelOptions = {}) {
        super({
            ...options,
            type: 'custom-node'
        });

        this.color = options.color || 'red';
        this.name = options.name || '';
        this.extras = options.extras || {};
    }

    serialize() {
        return {
            ...super.serialize(),
            color: this.color,
            name: this.name,
            extras: this.extras
        };
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
        this.color = event.data.color;
        this.name= event.data.name;
        this.extras=event.data.extras;
    }

    addOutPortEnhance({ label, name, order = null, id, dataType, position = null}:
        { label: string, name: string, order?: number, id?: string, dataType?: string, position?: Point}): CustomPortModel {

        //check if portID is passed, if not SR will generate a new port ID
        const p = (id) ? new CustomPortModel({in: false, name: name, label: label, id:id, dataType: dataType}) : 
                         new CustomPortModel({in: false, name: name, label: label, dataType: dataType});
        
        if (order !== null) {
            this.portsOut.splice(order, 0, p);
        }
        if (position !== null){
            p.setPosition(position);
        }

        return this.addPort(p);
    }

    addInPortEnhance({ label, name, varName = label, order = null, id, dataType, dynaPortOrder = 0, dynaPortRef = { previous: null, next: null }, position = null }:
        { label: string, name: string, varName?: string, order?: number, id?: string, dataType?: string, dynaPortOrder?: number, dynaPortRef?: DynaPortRef, position?: Point}): CustomPortModel {
                
        // // Check if portID is passed, if not SR will generate a new port ID
        let p: CustomPortModel;

        if (DYNAMIC_PARAMETER_NODE_TYPES.includes(dataType || '')) {
            p = (id)
                ? new CustomDynaPortModel({in: true, name: name, varName: varName, label: label, id: id, dataType: dataType, dynaPortOrder, dynaPortRef })
                : new CustomDynaPortModel({in: true, name: name, varName: varName, label: label, dataType: dataType, dynaPortOrder, dynaPortRef });
        } else {
            p = (id)
                ? new CustomPortModel({in: true, name: name, varName: varName, label: label, id: id, dataType: dataType})
                : new CustomPortModel({in: true, name: name, varName: varName, label: label, dataType: dataType});
        }

        if (order !== null) {
                this.portsIn.splice(order, 0, p);
        }

        if (position !== null){
            p.setPosition(position);
        }

        return this.addPort(p);
        
    }

}
