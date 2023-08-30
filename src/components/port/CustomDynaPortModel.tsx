import { DeserializeEvent} from '@projectstorm/react-canvas-core';
import { CustomPortModel, CustomPortModelOptions } from './CustomPortModel';

/**
 * @author wenfeng xu
 * custom port model enable it can execute some rule
 * before it can link to another
 */

export const DYNAMIC_PARAMETER_NODE_TYPES = [
    'dynalist', 'dynadict', 'dynatuple'
];

export interface CustomDynaPortModelOptions extends CustomPortModelOptions {
    dynaPortOrder: number;
}

export  class CustomDynaPortModel extends CustomPortModel {
    dynaPortOrder: number;

    constructor(options: CustomDynaPortModelOptions) {
        super({
            ...options,
        });

        this.dynaPortOrder = options.dynaPortOrder || 0;
    }

    serialize() {
        return {
            ...super.serialize(),
            dynaPortOrder: this.dynaPortOrder,
        };
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
        this.dynaPortOrder = event.data.dynaPortOrder;
    }

    handleDynamicLink(){
        console.log("Handling dynamic link...")
    }

}
