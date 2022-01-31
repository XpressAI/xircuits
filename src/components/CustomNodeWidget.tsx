import * as React from 'react';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { DefaultNodeModel ,DefaultPortLabel} from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from 'react-image-gallery';
import ToolTip from 'react-portal-tooltip';
import { Pagination } from "krc-pagination";
import 'krc-pagination/styles.css';
import { Action, ActionEvent, InputType } from '@projectstorm/react-canvas-core';
import Toggle from 'react-toggle'
import { CustomNodeModel } from './CustomNodeModel';


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

interface CustomDeleteItemsActionOptions {
	keyCodes?: number[];
    customDelete?: CustomNodeWidget;
}

export class CustomDeleteItemsAction extends Action {
    constructor(options: CustomDeleteItemsActionOptions = {}) {
        options = {
            keyCodes: [46, 8],
            ...options
        };

        super({
            type: InputType.KEY_DOWN,
            fire: (event: ActionEvent<React.KeyboardEvent>) => {
                if (options.keyCodes.indexOf(event.event.keyCode) !== -1) {
                    const selectedEntities = this.engine.getModel().getSelectedEntities();

                    _.forEach(selectedEntities, (model) => {
                        if (model.getOptions()["name"] !== "undefined") {
                            let modelName = model.getOptions()["name"];
                            if (modelName !== 'Start' && modelName !== 'Finish') {
                                if (!model.isLocked()) {
                                    model.remove()
                                } else {
                                    alert(`${modelName}'s node cannot be deleted!`);
                                }
                            }
                            else {
                                alert(`${modelName}'s node cannot be deleted!`);
                            }
                        }
                    });
                    this.engine.repaintCanvas();
                }
            }
        });
    }
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
        nodeDeletable: false,

        imageGalleryItems:[
        {
            original: 'https://picsum.photos/id/1018/1000/600/',
            thumbnail: 'https://picsum.photos/id/1018/250/150/'
        },
        {
            original: 'https://picsum.photos/id/1015/1000/600/',
            thumbnail: 'https://picsum.photos/id/1015/250/150/'
        },
        {
            original: 'https://picsum.photos/id/1019/1000/600/',
            thumbnail: 'https://picsum.photos/id/1019/250/150/'
        },
       ]
    };

    showTooltip() {
        this.setState({isTooltipActive: true})
    }
    hideTooltip() {
        this.setState({isTooltipActive: false})
    }
    handleClose() {
        let allNodes = this.props.engine.getModel().getNodes();
        delete allNodes[1].getOptions().extras["imageGalleryItems"];
        this.hideTooltip();
    };

    /**
     * load more data from server when page changed
     * @param e
     */
    onPageChanged = e => {
        console.log(e.currentPage);

        let imageGalleryItems = this.props.node.getOptions().extras["imageGalleryItems"];

        //update imageGalleryItems after data loaded from server
    };

    handleDeletableNode(key, event) {
        this.setState({
            [key]: event.target.checked
                ? this.props.node.setLocked(true)
                : this.props.node.setLocked(false),
        })
    }

    /**
     * Allow to edit Literal Component
     */
    handleEditLiteral() {
        if(!this.props.node.getOptions()["name"].startsWith("Literal")){
            return;
        }

        let node = null;
        var data = this.props.node;

        // Prompt the user to enter new value
        let theResponse = window.prompt('Enter New Value (Without Quotes):');
        node = new CustomNodeModel({ name: data["name"], color: data["color"], extras: { "type": data["extras"]["type"] } });
        node.addOutPortEnhance(theResponse, 'out-0');

        // Set new node to old node position
        let position = this.props.node.getPosition();
        node.setPosition(position);
        this.props.engine.getModel().addNode(node);

        // Remove old node
        this.props.node.remove();
    }
    
    render() {

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
                    <ToolTip active={this.state.isTooltipActive} position="top" arrow="center" parent={this.element}>
                        <p>{this.props.node.getOptions().extras["tip"]}</p>
                    </ToolTip>
                    <S.Title>
                        <S.TitleName>{this.props.node.getOptions().name}</S.TitleName>
                        <label>
                            <Toggle
                                className='lock'
                                checked={this.props.node.isLocked()}
                                onChange={this.handleDeletableNode.bind(this, 'nodeDeletable')}
                            />
                        </label>
                    </S.Title>
                    <S.Ports>
                        <S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
                        <S.PortsContainer>{_.map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
                    </S.Ports>
                </S.Node>
            );
        }
        else if(this.props.node.getOptions().extras["imageGalleryItems"] != undefined){
            return (
                <S.Node
                    onMouseEnter={this.showTooltip.bind(this)}
                    onMouseLeave={this.hideTooltip.bind(this)}
                    ref={(element) => { this.element = element }}
                    borderColor={this.props.node.getOptions().extras["borderColor"]}
                    data-default-node-name={this.props.node.getOptions().name}
                    selected={this.props.node.isSelected()}
                    background={this.props.node.getOptions().color}>
                    <ToolTip active={this.state.isTooltipActive} position="top" arrow="center" parent={this.element}>
                        <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
                            onClick={this.handleClose.bind(this)}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                        {/* Get the current image from the node when getting response from API endpoint */}
                        <S.ImageGalleryContainer >
                            <ImageGallery items={this.state.imageGalleryItems} />
                        {/* <ImageGallery items={this.props.node.getOptions().extras["imageGalleryItems"] || null?}  /> */}
                        </S.ImageGalleryContainer> 

                        <Pagination
                            totalRecords={100}
                            pageLimit={5}
                            pageNeighbours={1}
                            onPageChanged={this.onPageChanged}
                        />
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
        else if(this.props.node.getOptions()["name"] !== 'Start' && this.props.node.getOptions()["name"] !== 'Finish'){
            return (
                <S.Node
                    borderColor={this.props.node.getOptions().extras["borderColor"]}
                    data-default-node-name={this.props.node.getOptions().name}
                    selected={this.props.node.isSelected()}
                    background={this.props.node.getOptions().color}
                    onDoubleClick={this.handleEditLiteral.bind(this)}>
                    <S.Title>
                        <S.TitleName>{this.props.node.getOptions().name}</S.TitleName>
                        <label>
                            <Toggle
                                className='lock'
                                checked={this.props.node.isLocked()}
                                onChange={this.handleDeletableNode.bind(this, 'nodeDeletable')}
                            />
                        </label>
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
