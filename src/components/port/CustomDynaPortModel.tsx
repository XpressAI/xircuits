import { DeserializeEvent} from '@projectstorm/react-canvas-core';
import { CustomPortModel, CustomPortModelOptions } from '../port/CustomPortModel';
import { CustomNodeModel } from '../node/CustomNodeModel';

export const DYNAMIC_PARAMETER_NODE_TYPES = [
    'dynalist', 'dynatuple'
];

export interface DynaPortRef {
    previous: string | null;
    next: string | null;
}

export interface CustomDynaPortModelOptions extends CustomPortModelOptions {
    dynaPortOrder: number;
    dynaPortRef: DynaPortRef;
}

export interface SpawnDynamicPortOptions {
    offset?: number;
    node?: CustomNodeModel;
    port?: CustomDynaPortModel;
    absolutePortOrder?: number;
    newDynamicPortOrder?: number;
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

        // default check
        return super.isTypeCompatible(thisNodeModelType, thisLinkedPortType);
    }

    canLinkToLinkedPort(): boolean {
        return true
    }

    spawnDynamicPort(options: SpawnDynamicPortOptions): CustomDynaPortModel {
        let {
            offset = 1,
            node = null,
            port = this,
            absolutePortOrder = null,
            newDynamicPortOrder = null
        } = options;
    
        node = node !== null ? node : port.parent as CustomNodeModel;

        absolutePortOrder = absolutePortOrder !== null ? absolutePortOrder : port.getPortOrder() + offset;
        newDynamicPortOrder = newDynamicPortOrder !== null ? newDynamicPortOrder : port.dynaPortOrder + offset;
        
        let newDynamicPortName: string;
        let newDynamicPortLabel: string;
    
        if (newDynamicPortOrder == 0) {
            newDynamicPortName = `parameter-${port.dataType}-${port.varName}`;
            newDynamicPortLabel = `${port.varName}`;
        } else {
            // strip compulsory notation [★] if not first dynaport
            port.varName = port.varName.replace(/★/g, '');
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
    
        return newPort;
    }

    shiftPorts({ shouldShiftBack = false } = {}) {
        let node = this.parent as CustomNodeModel;
        let currentPort = this as CustomDynaPortModel;
        let previousPort = node.getPortFromID(currentPort.previous) as CustomDynaPortModel;
        const currentPortProps = currentPort.getCustomProps();
        
        // Store each subsequent port and its link in the array
        let portsAndLinks = [];
        while (currentPort) {
            let link = Object.values(currentPort.getLinks())[0] || null;
            portsAndLinks.push({ port: currentPort, link });
            currentPort = currentPort.next ? node.getPortFromID(currentPort.next) as CustomDynaPortModel : null;
        }
        
        // Disconnect links and remove corresponding ports
        portsAndLinks.forEach(({ port, link }) => {
            if (link) link.setTargetPort(null);
            node.removePort(port);
        });
    
        // If shouldShiftBack flag is true, remove the first element from portsAndLinks array
        if (shouldShiftBack) portsAndLinks.shift();
    
        // Spawn a new port using properties from either the previous port or the current port
        let newPort = previousPort ? previousPort.spawnDynamicPort({ offset: 1, port: previousPort }) 
                                   : this.spawnDynamicPort({ node, newDynamicPortOrder: currentPortProps.dynaPortOrder, absolutePortOrder: currentPortProps.absolutePortOrder });
    
        if (previousPort) {
            newPort.previous = previousPort.getID();
            previousPort.next = newPort.getID();
        }
    
        // Initialize a variable to keep track of the last created port
        let lastCreatedPort = newPort;
        
        // Loop over the portsAndLinks array to recreate each port and reconnect the links
        portsAndLinks.forEach(({ link }) => {
            let recreatedPort = lastCreatedPort.spawnDynamicPort({ offset: 1, port: lastCreatedPort });
            
            recreatedPort.previous = lastCreatedPort.getID();
            lastCreatedPort.next = recreatedPort.getID();
            
            // If a link exists, connect it to lastCreatedPort when shifting backwards and deleting, 
            // to maintain the connection with the existing port.
            // Otherwise, connect to the recreatedPort to link with the newly spawned port.
            if (link) link.setTargetPort(shouldShiftBack ? lastCreatedPort : recreatedPort);
            
            // Update the lastCreatedPort to point to the newly recreated port
            lastCreatedPort = recreatedPort;
        });
    
        // If shouldShiftBack flag is true, remove the last created port
        if (shouldShiftBack) node.removePort(lastCreatedPort);
        
        return newPort;
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

    getCustomProps() {
        const baseProps = super.getCustomProps();
        const { dynaPortOrder, dynaPortRef } = this;
        const absolutePortOrder = this.getPortOrder()
        return {
            ...baseProps,
            dynaPortOrder,
            dynaPortRef,
            absolutePortOrder
        };
    }

}
