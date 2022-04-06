import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { BaseModelOptions, DeserializeEvent} from '@projectstorm/react-canvas-core';
import {CustomPortModel} from "./port/CustomPortModel";


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

    addOutPortEnhance(label: string, name: string, after: boolean = true, id?: string): CustomPortModel {
        
        //check if portID is passed, if not SR will generate a new port ID
        const p = (id) ? new CustomPortModel({in: false, name: name, label: label, id:id}) : 
                         new CustomPortModel({in: false, name: name, label: label});
        
        if (!after) {
            this.portsOut.splice(0, 0, p);
        }

        return this.addPort(p);
    }

    addInPortEnhance(label: string, name: string, after: boolean = true, id?: string): CustomPortModel {
        
        //check if portID is passed, if not SR will generate a new port ID
        const p = (id) ? new CustomPortModel({in: true, name: name, label: label, id:id}) : 
                         new CustomPortModel({in: true, name: name, label: label});

        if (!after) {
                this.portsOut.splice(0, 0, p);
        }
    
        return this.addPort(p);
        
    }
}
