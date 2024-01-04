import * as React from 'react';
import { CustomNodeModel } from './CustomNodeModel';

import {AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent} from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import {CustomNodeWidget} from "./CustomNodeWidget";
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';

export class CustomNodeFactory extends AbstractReactFactory<CustomNodeModel, DiagramEngine> {
	app : JupyterFrontEnd
	shell : ILabShell
	constructor(app, shell) {
		super('custom-node');
		this.app = app;
		this.shell = shell;
	}

	generateModel(initialConfig: GenerateModelEvent) {
		return new CustomNodeModel();
	}

	generateReactWidget(event: GenerateWidgetEvent<any>): JSX.Element {
		return <CustomNodeWidget engine={this.engine as DiagramEngine} node={event.model} app={this.app} shell={this.shell}/>;
	}
}
