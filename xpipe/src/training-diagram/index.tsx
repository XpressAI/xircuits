import * as React from 'react';

import { BodyWidget } from './components/BodyWidget';
import { Application } from './Application';

export function CreateTrainingDiagramComponent(projectId: string) {
	var app = new Application();
	return <BodyWidget app={app} projectId={projectId} />;
}
