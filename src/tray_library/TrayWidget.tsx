import * as React from 'react';

import styled from '@emotion/styled';

export const Tray = styled.div`
	min-width: 150px;
	background: rgb(255, 255, 255);
	flex-grow: 1;
	width: 150px;
	flex-shrink: 1;
	max-height: auto;
	overflow-y: auto;
`;

interface TrayWidgetProps {
    children?: React.ReactNode;
}

export class TrayWidget extends React.Component<TrayWidgetProps> {
	render() {
		return <Tray>{this.props.children}</Tray>;
	}
}