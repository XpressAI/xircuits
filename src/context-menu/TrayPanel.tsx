import * as React from 'react';

import styled from '@emotion/styled';

export const Tray = styled.div`
	min-width: 150px;
	background: rgb(35, 35, 35);
	flex-grow: 1;
	width: 150px;
	flex-shrink: 1;
	max-height: auto;
	overflow-y: auto;
`;

export class TrayPanel extends React.Component {
	render() {
		return <Tray>{this.props.children}</Tray>;
	}
}
