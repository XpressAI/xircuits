import * as React from 'react';
import { CustomNodeModel } from './CustomNodeModel';

import {AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent} from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import {CustomNodeWidget} from "./CustomNodeWidget";
import { JupyterFrontEnd } from '@jupyterlab/application';

export class CustomNodeFactory extends AbstractReactFactory<CustomNodeModel, DiagramEngine> {
	app : JupyterFrontEnd
	constructor(app) {
		super('custom-node');
		this.app = app;
	}

	generateModel(initialConfig: GenerateModelEvent) {
		return new CustomNodeModel();
	}

	generateReactWidget(event: GenerateWidgetEvent<any>): JSX.Element {
		return <CustomNodeWidget engine={this.engine as DiagramEngine} node={event.model} app={this.app}/>;
	}
}
