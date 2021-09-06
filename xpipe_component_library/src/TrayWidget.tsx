import * as React from 'react';
import styled from '@emotion/styled';


export const Tray = styled.div`
	min-width: 260px;
	background: rgb(20, 20, 20);
	flex-grow: 3;
	flex-shrink: 0;
	width:auto;
	max-height: auto;
	overflow-y: auto;
`;


export class TrayWidget extends React.Component {
	render() {
		return <Tray>{this.props.children}</Tray>;
	}
}
