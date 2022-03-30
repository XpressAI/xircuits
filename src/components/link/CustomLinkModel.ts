import { DefaultLinkModel } from '@projectstorm/react-diagrams';
import { CustomPortModel } from '../CustomPortModel';

// Custom link
export class CustomLinkModel extends DefaultLinkModel {
	constructor() {
		super({
			type: 'custom',
			width: 3
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
	constructor() {
		super({
			type: 'triangle',
			width: 3
		});
	}
}

export class TrianglePortModel extends CustomPortModel {
	createLinkModel(): TriangleLinkModel | null {
		return new TriangleLinkModel();
	}
}

