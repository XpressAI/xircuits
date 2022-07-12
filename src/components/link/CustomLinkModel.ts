import { DefaultLinkModel, DefaultLinkModelOptions } from '@projectstorm/react-diagrams';
import { CustomPortModel } from '../port/CustomPortModel';

// Custom link
export class CustomLinkModel extends DefaultLinkModel {
	constructor(options: DefaultLinkModelOptions = {}) {
		super({
			type: 'custom',
			width: 3,
			...options
		});
	}
}

export class CustomLinkPortModel extends CustomPortModel {
	createLinkModel(): CustomLinkModel | null {
		return new CustomLinkModel();
	}
}

// Triangle link
export class TriangleLinkModel extends DefaultLinkModel {
	constructor(options: DefaultLinkModelOptions = {}) {
		super({
			type: 'triangle',
			width: 3,
			...options
		});
	}
}

export class TrianglePortModel extends CustomPortModel {
	createLinkModel(): TriangleLinkModel | null {
		return new TriangleLinkModel();
	}
}

