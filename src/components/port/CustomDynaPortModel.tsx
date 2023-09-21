import { DeserializeEvent} from '@projectstorm/react-canvas-core';
import { CustomPortModel, CustomPortModelOptions } from './CustomPortModel';
import { CustomNodeModel } from '../CustomNodeModel';

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

    canLinkToLinkedPort(): boolean {
        return true
    }

    spawnDynamicPort(offset: number = 1, port: CustomDynaPortModel = this): CustomDynaPortModel {

        let node = port.parent as CustomNodeModel;

        let absolutePortOrder = port.getPortOrder() + offset;
        let newDynamicPortOrder = port.dynaPortOrder + offset;
        let newDynamicPortName: string;
        let newDynamicPortLabel: string;
    
        if (newDynamicPortOrder == 0) {
            newDynamicPortName = `parameter-${port.dataType}-${port.varName}`;
            newDynamicPortLabel = `${port.varName}`;
        } else {
            newDynamicPortName = `parameter-${port.dataType}-${port.varName}-${newDynamicPortOrder}`;
            newDynamicPortLabel = `${port.varName}[${newDynamicPortOrder}]`;
        }
    
        let newPort = node.addInPortEnhance({
            label: newDynamicPortLabel,
            name: newDynamicPortName,
            varName: port.varName,
            dataType: port.dataType,
            order: absolutePortOrder,
            dynaPortOrder: newDynamicPortOrder
        }) as CustomDynaPortModel;

        return newPort
    }

    adjustOrder(order: number, port: CustomDynaPortModel = this){

        port.dynaPortOrder = order
        
        if(order==0){
            port.options.name = "parameter-" + port.dataType + "-" + port.varName;
            port.options.label = `${port.varName}`;
        }else{
            port.options.name = "parameter-" + port.dataType + "-" + port.varName + "-" + order;
            port.options.label = `${port.varName}[${order}]`;
        }
    }

    shiftPorts() {

        let currentPort = this as CustomDynaPortModel;
        let node = this.parent;
        let lastPort: CustomDynaPortModel | null = null;
    
        while (currentPort) {

            currentPort.adjustOrder(currentPort.dynaPortOrder + 1);
            lastPort = currentPort;
    
            // If the current port has a next port, fetch it, otherwise, break the loop
            if (currentPort.next) {
                currentPort = node.getPortFromID(currentPort.next) as CustomDynaPortModel;
            } else {
                break;
            }
        }

        // spawn +1 dynamic port at the end
        this.spawnDynamicPort(1, lastPort);

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
