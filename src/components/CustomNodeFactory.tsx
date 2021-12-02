import * as React from 'react';
import { CustomNodeModel } from './CustomNodeModel';

import {AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent} from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import {CustomNodeWidget} from "./CustomNodeWidget";

export class CustomNodeFactory extends AbstractReactFactory<CustomNodeModel, DiagramEngine> {
	constructor() {
		super('custom-node');
	}

	generateModel(initialConfig: GenerateModelEvent) {
		return new CustomNodeModel();
	}

	generateReactWidget(event: GenerateWidgetEvent<any>): JSX.Element {
		return <CustomNodeWidget engine={this.engine as DiagramEngine} node={event.model} />;
	}
}
