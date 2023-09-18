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

export interface DynaPortRef {
    previous: string | null;
    next: string | null;
}

export interface CustomDynaPortModelOptions extends CustomPortModelOptions {
    dynaPortOrder: number;
    dynaPortRef: DynaPortRef;
}

export  class CustomDynaPortModel extends CustomPortModel {
    dynaPortOrder: number;
    dynaPortRef: DynaPortRef;

    constructor(options: CustomDynaPortModelOptions) {
        super({
            ...options,
        });

        this.dynaPortOrder = options.dynaPortOrder || 0;
        this.dynaPortRef = options.dynaPortRef || { previous: null, next: null };

    }

    serialize() {
        return {
            ...super.serialize(),
            dynaPortOrder: this.dynaPortOrder,
            dynaPortRef: this.dynaPortRef,
        };
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
        this.dynaPortOrder = event.data.dynaPortOrder;
        this.dynaPortRef = event.data.dynaPortRef;
    }

    handleNewDynamicLink(){
        console.log("Handling new dynamic link...")
    }

    isTypeCompatible(thisNodeModelType, thisLinkedPortType) {
        // if thisLinkedPortType is dynalist or dynatuple, treat it as any
        if (['dynalist', 'dynatuple'].includes(thisLinkedPortType)) {
            return true;  // Accepts anything
        }

        // if thisLinkedPortType is dynadict, accept only dict
        if (thisLinkedPortType === 'dynadict' && thisNodeModelType !== 'dict') {
            return false;
        }

        // default check
        return super.isTypeCompatible(thisNodeModelType, thisLinkedPortType);
    }

    adjustOrder(order: number){

        this.dynaPortOrder = order
        
        if(order==0){
            this.options.name = "parameter-" + this.dataType + "-" + this.varName;
            this.options.label = `${this.varName}`;
        }else{
            this.options.name = "parameter-" + this.dataType + "-" + this.varName + "-" + order;
            this.options.label = `${this.varName}[${order}]`;
        }
    }

    get previous() {
        return this.dynaPortRef.previous;
    }

    get next() {
        return this.dynaPortRef.next;
    }

    set previous(value: string | null) {
        this.dynaPortRef.previous = value;
    }

    set next(value: string | null) {
        this.dynaPortRef.next = value;
    }
}
