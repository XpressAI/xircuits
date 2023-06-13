import { DefaultLinkModel, DefaultLinkModelOptions } from '@projectstorm/react-diagrams';
import { CustomPortModel } from '../port/CustomPortModel';

export interface CustomLinkModelOptions extends DefaultLinkModelOptions {
    isAnimationEnabled?: boolean;
}

export class CustomLinkModel extends DefaultLinkModel {
	constructor(options: CustomLinkModelOptions = {}) {
		super({
			type: 'custom-link',
			width: 3,
			isAnimationEnabled: true,
			...options
		});
	}

	getOptions(): CustomLinkModelOptions {
		return super.getOptions() as CustomLinkModelOptions;
	}

	setAnimate(value: boolean): void {
		const options = this.getOptions();
		options.isAnimationEnabled = value;
	}
	
	serialize() {
		return {
			...super.serialize(),
			isAnimationEnabled: this.getOptions().isAnimationEnabled
		};
	}
}


export class CustomLinkPortModel extends CustomPortModel {
	createLinkModel(): CustomLinkModel | null {
		return new CustomLinkModel();
	}
}

// Parameter link
export interface ParameterLinkModelOptions extends CustomLinkModelOptions {}

export class ParameterLinkModel extends CustomLinkModel {
	constructor(options: ParameterLinkModelOptions = {}) {
		super({
			type: 'parameter-link',
			...options
		});
	}

	getOptions(): ParameterLinkModelOptions {
		return super.getOptions() as ParameterLinkModelOptions;
	}
}

export class ParameterLinkPortModel extends CustomPortModel {
	createLinkModel(): ParameterLinkModel | null {
		return new ParameterLinkModel();
	}
}

// Triangle link
export interface TriangleLinkModelOptions extends CustomLinkModelOptions {}

export class TriangleLinkModel extends CustomLinkModel {
	constructor(options: TriangleLinkModelOptions = {}) {
		super({
			type: 'triangle-link',
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
