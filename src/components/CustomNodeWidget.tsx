import * as React from 'react';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from 'react-image-gallery';
import ToolTip from 'react-portal-tooltip';
import { Pagination } from "krc-pagination";
import 'krc-pagination/styles.css';
import Toggle from 'react-toggle'
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { commandIDs } from './xircuitBodyWidget';
import { CustomPortLabel } from './port/CustomPortLabel';
import { Dialog } from '@jupyterlab/apputils';
import { formDialogWidget } from '../dialog/formDialogwidget';
import { showFormDialog } from '../dialog/FormDialog';
import { CommentDialog } from '../dialog/CommentDialog';
import ReactTooltip from 'react-tooltip';
import { marked } from 'marked';

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

    S.CommentContainer = styled.div<{ selected: boolean;  }>`
        background: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
		font-family: sans-serif;
		color: rgb(255, 255, 255);
		border: solid 2px black;
		font-size: 12px;
        border: solid 2px ${(p) => p.selected ? 'rgb(0,192,255)':'black'};
        padding: 5px;
    `;

    S.DescriptionName = styled.div<{ color:string }>`
        color: ${(p) => p.color ?? 'rgb(0, 0, 0)'};
        text-align: justify;
        font-family: 'Roboto', sans-serif;
        font-weight: 700;
        font-size: 13px;
	`;

    S.Ports = styled.div`
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;

    S.PortsContainer = styled.div`
        max-width: 640px;
        white-space: pre;
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
    app: JupyterFrontEnd;
    shell : ILabShell;
}

/**
 * Default node that models the DefaultNodeModel. It creates two columns
 * for both all the input ports on the left, and the output ports on the right.
 */
export class CustomNodeWidget extends React.Component<DefaultNodeProps> {

    generatePort = (port) => {
        return <CustomPortLabel engine={this.props.engine} port={port} key={port.getID()} node={this.props.node} />;
    };
    element:Object;
    state = {

        isTooltipActive: false,
        nodeDeletable: false,
        commentInput: this.props.node['extras']['commentInput'],
        showDescription: false,
        descriptionStr: "",

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

    handleOnChangeCanvas(){
        this.props.engine.fireEvent({}, 'onChange');
    }

    /**
     * Allow to edit Literal Component
     */
    handleEditLiteral() {
        if (!this.props.node.getOptions()["name"].startsWith("Literal")) {
            return;
        }
        this.props.app.commands.execute(commandIDs.editNode)
    }

    dialogOptions: Partial<Dialog.IOptions<any>> = {
        body: formDialogWidget(
                <CommentDialog commentInput={this.state.commentInput}/>
        ),
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: ('Submit') })],
	focusNodeSelector: 'textarea'
    };

    /**
     * Allow to edit Comment Component
     */
    async handleEditComment(){
        let dialogResult = await showFormDialog(this.dialogOptions)

        if (dialogResult["button"]["label"] == 'Cancel') {
			// When Cancel is clicked on the dialog, just return
			return false;
		}
        const newVal = dialogResult["value"]['']
        //  update value both in internal component state
        this.setState({ commentInput: newVal });
        // and in model object
        this.props.node['extras']['commentInput'] = newVal;
        this.handleOnChangeCanvas();
    }

    /**
     * Show/Hide Component's Description Tooltip
     */
    async handleDescription() {
        await this.setState({ showDescription: !this.state.showDescription });
        this.getDescriptionStr();
        ReactTooltip.show(this.element as Element);
    }

    renderText = text => {
        var renderer = new marked.Renderer();
        renderer.link = function(href, title, text) {
            var link = marked.Renderer.prototype.link.apply(this, arguments);
            return link.replace("<a","<a target='_blank'");
        };
        marked.setOptions({
            renderer: renderer
        });
        const __html = marked(text ?? '')
        return { __html }
    }

    getDescriptionStr() {
        let dscrptStr = this.props.node['extras']['description'] ?? '***No description provided***';
        this.setState({ descriptionStr: dscrptStr });
    }

    // Hide Error Tooltip
    hideErrorTooltip(){
        delete this.props.node.getOptions().extras["tip"];
        this.props.node.getOptions().extras["borderColor"]="rgb(0,192,255)";
    }
    
    render() {
        if (this.props.node['extras']['type'] == 'comment') {
            return (
                <S.CommentContainer
                    onDoubleClick={this.handleEditComment.bind(this)}
                    selected={this.props.node.isSelected()}>
                    <S.TitleName><b>{this.props.node.getOptions().name}</b></S.TitleName>
                    <div className='comment-component-content'>
                        {this.state.commentInput}
                    </div>
                </S.CommentContainer>
            );
        } 
        else if (this.props.node.getOptions()["name"].startsWith('Literal')) {
            return (
                <S.Node
                    borderColor={this.props.node.getOptions().extras["borderColor"]}
                    data-default-node-name={this.props.node.getOptions().name}
                    selected={this.props.node.isSelected()}
                    background={this.props.node.getOptions().color}
                    onDoubleClick={this.handleEditLiteral.bind(this)}>
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
        else if (this.props.node.getOptions()["name"] !== 'Start' && this.props.node.getOptions()["name"] !== 'Finish') {
            return (
                <>
                    <S.Node
                        onMouseEnter={this.showTooltip.bind(this)}
                        onMouseLeave={this.hideTooltip.bind(this)}
                        ref={(element) => { this.element = element }}
                        data-tip data-for={this.props.node.getOptions().id} // Data for tooltip
                        borderColor={this.props.node.getOptions().extras["borderColor"]}
                        data-default-node-name={this.props.node.getOptions().name}
                        selected={this.props.node.isSelected()}
                        background={this.props.node.getOptions().color}
                        onDoubleClick={this.handleEditLiteral.bind(this)}>
                        <S.Title>
                            <S.TitleName>{this.props.node.getOptions().name}</S.TitleName>
                            <label data-no-drag>
                                <Toggle
                                    className='lock'
                                    checked={this.props.node.isLocked()}
                                    onChange={this.handleDeletableNode.bind(this, 'nodeDeletable')}
                                />
                                <Toggle
                                    className='description'
                                    name='Description'
                                    checked={this.state.showDescription}
                                    onChange={this.handleDescription.bind(this)}
                                />
                            </label>
                        </S.Title>
                        <S.Ports>
                            <S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
                            <S.PortsContainer>{_.map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
                        </S.Ports>
                    </S.Node>
                    {/** Description Tooltip */}
                    {this.state.showDescription && <ReactTooltip
                        id={this.props.node.getOptions().id}
                        className='description-tooltip'
                        arrowColor='rgb(255, 255, 255)'
                        clickable
                        afterShow={() => { this.setState({ showDescription: true }) }}
                        afterHide={() => { this.setState({ showDescription: false }) }}
                        delayHide={60000}
                        delayUpdate={5000}
                        getContent={() =>
                            <div data-no-drag style={{ cursor: 'default' }}>
                                <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => { this.setState({ showDescription: false }); }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <S.DescriptionName color={this.props.node.getOptions().color}>{this.props.node.getOptions()["name"]}</S.DescriptionName>
                                <p className='description-title'>Description:</p>
                                <div 
                                    onWheel={(e) => e.stopPropagation()}
                                    className='description-container'>
                                    <div className='markdown-body' dangerouslySetInnerHTML={this.renderText(this.state.descriptionStr)} />
                                </div>
                            </div>}
                        overridePosition={(
                            { left, top },
                            currentEvent, currentTarget, node, refNode) => {
                            const currentNode = this.props.node;
                            const nodeDimension = { x: currentNode.width, y: currentNode.height };
                            const nodePosition = { x: currentNode.getX(), y: currentNode.getY() };
                            let newPositionX = nodePosition.x;
                            let newPositionY = nodePosition.y;
                            let offset = 0;

                            if (!this.props.shell.leftCollapsed) {
                                // Some weird offset happened when left sidebar opened, need to add this
                                let leftSidebar = document.getElementById('jp-left-stack');
                                offset = leftSidebar.clientWidth + 2;
                            }

                            if (refNode == 'top') {
                                newPositionX = newPositionX - 208 + offset + (nodeDimension.x / 2);
                                newPositionY = newPositionY - 220;
                            }
                            else if (refNode == 'bottom') {
                                newPositionX = newPositionX - 208 + offset + (nodeDimension.x / 2);
                                newPositionY = newPositionY + 85 + nodeDimension.y;
                            }
                            else if (refNode == 'right') {
                                newPositionX = newPositionX + 40 + offset + nodeDimension.x;
                                newPositionY = newPositionY - 66 + (nodeDimension.y / 2);
                            }
                            else if (refNode == 'left') {
                                newPositionX = newPositionX - 450 + offset;
                                newPositionY = newPositionY - 66 + (nodeDimension.y / 2);
                            }
                            const tooltipPosition = this.props.engine.getRelativePoint(newPositionX, newPositionY);

                            left = tooltipPosition.x;
                            top = tooltipPosition.y;
                            return { top, left }
                        }}
                    />}
                    {/** Error Tooltip */}
                    {(this.props.node.getOptions().extras["tip"] != undefined && this.props.node.getOptions().extras["tip"] != "") ?
                        <ReactTooltip
                            id={this.props.node.getOptions().id}
                            clickable
                            place='bottom'
                            className='error-tooltip'
                            arrowColor='rgba(255, 0, 0, .9)'
                            delayHide={100}
                            delayUpdate={50}
                            getContent={() =>
                                <div data-no-drag className='error-container'>
                                    <p className='error-title'>Error</p>
                                    <div className='markdown-body' dangerouslySetInnerHTML={this.renderText(this.props.node.getOptions().extras["tip"])} />
                                    <button
                                        type="button"
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        onClick={this.hideErrorTooltip.bind(this)}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            }
                            overridePosition={({ left, top }) => {
                                const currentNode = this.props.node;
                                const nodeDimension = { x: currentNode.width, y: currentNode.height };
                                const nodePosition = { x: currentNode.getX(), y: currentNode.getY() };
                                let newPositionX = nodePosition.x;
                                let newPositionY = nodePosition.y;
                                let offset = 0;

                                if (!this.props.shell.leftCollapsed) {
                                    // Some weird offset happened when left sidebar opened, need to add this
                                    let leftSidebar = document.getElementById('jp-left-stack');
                                    offset = leftSidebar.clientWidth + 2;
                                }

                                newPositionX = newPositionX - 184 + offset + (nodeDimension.x / 2);
                                newPositionY = newPositionY + 90 + nodeDimension.y;

                                const tooltipPosition = this.props.engine.getRelativePoint(newPositionX, newPositionY);

                                left = tooltipPosition.x;
                                top = tooltipPosition.y;
                                return { top, left }
                            }}
                        />
                        : null}
                </>
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
