import * as React from 'react';
import styled from '@emotion/styled';


export const Tray = styled.div`
	min-width: 200px;
	background: rgb(20, 20, 20);
	flex-grow: 3;
	flex-shrink: 0;
	width:auto;
`;


export class TrayWidget extends React.Component {
	render() {
		return <Tray>{this.props.children}</Tray>;
	}
}
