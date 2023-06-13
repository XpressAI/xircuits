import { DefaultLinkModel, DefaultLinkModelOptions } from '@projectstorm/react-diagrams';
import { CustomPortModel } from '../port/CustomPortModel';

// Custom link

export interface CustomLinkModelOptions extends DefaultLinkModelOptions {
    disableAnimation?: boolean;
}

export class CustomLinkModel extends DefaultLinkModel {
	constructor(options: CustomLinkModelOptions = {}) {
		super({
			type: 'custom-link',
			width: 3,
			...options
		});
	}

	getOptions(): CustomLinkModelOptions {
		return super.getOptions() as CustomLinkModelOptions;
	}
}

export class CustomLinkPortModel extends CustomPortModel {
	createLinkModel(): CustomLinkModel | null {
		return new CustomLinkModel();
	}
}

// Triangle link
export interface TriangleLinkModelOptions extends DefaultLinkModelOptions {
    disableAnimation?: boolean;
}

export class TriangleLinkModel extends DefaultLinkModel {
	constructor(options: TriangleLinkModelOptions = {}) {
		super({
			type: 'triangle-link',
			width: 3,
			...options
		});
	}

	getOptions(): TriangleLinkModelOptions {
		return super.getOptions() as TriangleLinkModelOptions;
	}
}

export class TrianglePortModel extends CustomPortModel {
	createLinkModel(): TriangleLinkModel | null {
		return new TriangleLinkModel();
	}
}
