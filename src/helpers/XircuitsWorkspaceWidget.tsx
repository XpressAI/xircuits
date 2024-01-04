import * as React from 'react';
import styled from '@emotion/styled';

export interface XircuitsWorkspaceWidgetProps {
	buttons?: any;
	children?: any;
}

namespace S {
	export const Toolbar = styled.div`
		padding: 5px;
		display: flex;
		flex-shrink: 0;
	`;

	export const Content = styled.div`
		flex-grow: 1;
		height: 100%;
	`;

	export const Container = styled.div`
		background: black;
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: 5px;
		overflow: hidden;
	`;
}


export class XircuitsWorkspaceWidget extends React.Component<XircuitsWorkspaceWidgetProps> {
	render() {
		return (
			<S.Container>
				<S.Toolbar>{this.props.buttons}</S.Toolbar>
				<S.Content>{this.props.children}</S.Content>
			</S.Container>
		);
	}
}
