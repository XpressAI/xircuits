import * as React from 'react';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { DefaultNodeModel ,DefaultPortLabel} from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import ToolTip from 'react-portal-tooltip'

var S;
(function (S) {
    S.Node = styled.div<{ borderColor:string,background: string; selected: boolean;  }>`
		background-color: ${(p) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		border: solid 2px ${(p) => (p.selected ? (p.borderColor==undefined? 'rgb(0,192,255)': p.borderColor ):'black')};
	`;

    S.Title = styled.div`
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
	`;

    S.TitleName = styled.div`
		flex-grow: 1;
		padding: 5px 5px;
	`;

    S.Ports = styled.div`
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;

    S.PortsContainer = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		&:first-of-type {
			margin-right: 10px;
		}

		&:only-child {
			margin-right: 0px;
		}
	`;
    S.ImageGalleryContainer = styled.div`
		width: 600px;
		height: 440px;
	`;
})(S || (S = {}));

export interface DefaultNodeProps {
    node: DefaultNodeModel;
    engine: DiagramEngine;
}

/**
 * Default node that models the DefaultNodeModel. It creates two columns
 * for both all the input ports on the left, and the output ports on the right.
 */
export class CustomNodeWidget extends React.Component<DefaultNodeProps> {

    generatePort = (port) => {
        return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
    };
    element:Object;
    state = {

        isTooltipActive: false,

    };

    showTooltip() {
        this.setState({isTooltipActive: true})
    }
    hideTooltip() {
        this.setState({isTooltipActive: false})
    }


    render() {

        let style = {
            style: {
                background: 'rgba(255,255,255,.8)',
                padding: 20,
                boxShadow: '5px 5px 3px rgba(0,0,0,.5)'
            },
            arrowStyle: {
                position: 'absolute',
                color: 'rgba(255,255,255,.8)',
                borderColor: false
            }
        }

        if(this.props.node.getOptions().extras["tip"]!=undefined&&this.props.node.getOptions().extras["tip"]!=""){
            return (
                <S.Node
                    onMouseEnter={this.showTooltip.bind(this)}
                    onMouseLeave={this.hideTooltip.bind(this)}
                    ref={(element) => { this.element = element }}
                    borderColor={this.props.node.getOptions().extras["borderColor"]}
                    data-default-node-name={this.props.node.getOptions().name}
                    selected={this.props.node.isSelected()}
                    background={this.props.node.getOptions().color}>
                    <ToolTip active={this.state.isTooltipActive} position="top" arrow="center" parent={this.element} style={style}>
                        <p>{this.props.node.getOptions().extras["tip"]}</p>
                    </ToolTip>
                    <S.Title>
                        <S.TitleName>{this.props.node.getOptions().name}</S.TitleName>
                    </S.Title>
                    <S.Ports>
                        <S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
                        <S.PortsContainer>{_.map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
                    </S.Ports>
                </S.Node>
            );
        }

        return (
            <S.Node
                borderColor={this.props.node.getOptions().extras["borderColor"]}
                data-default-node-name={this.props.node.getOptions().name}
                selected={this.props.node.isSelected()}
                background={this.props.node.getOptions().color}>
                <S.Title>
                  <S.TitleName>{this.props.node.getOptions().name}</S.TitleName>
                </S.Title>
            <S.Ports>
              <S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
              <S.PortsContainer>{_.map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
            </S.Ports>
            </S.Node>
    );
    }
}
