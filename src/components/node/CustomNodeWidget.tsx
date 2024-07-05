import * as React from 'react';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import Toggle from 'react-toggle'
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { CustomPortLabel } from '../port/CustomPortLabel';
import { Dialog } from '@jupyterlab/apputils';
import { formDialogWidget } from '../../dialog/formDialogwidget';
import { showFormDialog } from '../../dialog/FormDialog';
import { CommentDialog } from '../../dialog/CommentDialog';
import ReactTooltip from "react-tooltip"
import { marked } from 'marked';
import Color from 'colorjs.io';
import { commandIDs } from "../../commands/CommandIDs";

var S;
(function (S) {
    S.Node = styled.div<{ borderColor: string, background: string; selected: boolean; }>`
		background-color: ${(p) => {
        const color = new Color(p.background);
        color.alpha = 0.75;
        color.oklch.c *= 1.2;
        return color.to('oklch').toString();
    }};
    box-shadow: 1px 1px 10px ${(p) => p.selected ? '3px rgb(0 192 255 / 0.5)' : '0px rgb(0 0 0 / 0.5)'};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		overflow: visible;
		font-size: 11px;
		border: solid 1px ${(p) => (p.selected ? (p.borderColor == undefined ? 'rgb(0,192,255)' : p.borderColor) : 'black')};
	`;

    S.Title = styled.div`
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
    box-shadow: inset 0 -2px 4px 0 rgb(0 0 0 / 0.05);  
	`;

    S.TitleName = styled.div`
		flex-grow: 1;
		padding: 5px 5px;
	`;

    S.CommentContainer = styled.div<{ selected: boolean; }>`
        background: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
		font-family: sans-serif;
		color: rgb(255, 255, 255);
		border: solid 2px black;
		font-size: 12px;
        border: solid 2px ${(p) => p.selected ? 'rgb(0,192,255)' : 'black'};
        padding: 5px;
    `;

    S.DescriptionName = styled.div<{ color: string }>`
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
    S.WorkflowNode = styled(S.Node)`
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 8px; // Space between the main node and the outline

    ${(p) => p.selected && `
        outline: 2px solid rgba(0, 192, 255, 0.5); // blue
        `}
    `;
})(S || (S = {}));

export interface DefaultNodeProps {
    node: DefaultNodeModel;
    engine: DiagramEngine;
    app: JupyterFrontEnd;
    shell: ILabShell;
}

const CommentNode = ({ node, handleEditComment }) => (
    <S.CommentContainer onDoubleClick={handleEditComment} selected={node.isSelected()}>
        <S.TitleName><b>{node.getOptions().name}</b></S.TitleName>
        <div className='comment-component-content'>
            {node['extras']['commentInput']}
        </div>
    </S.CommentContainer>
);

const ParameterNode = ({ node, engine, handleEditLiteral }) => (
    <S.Node
        borderColor={node.getOptions().extras["borderColor"]}
        data-default-node-name={node.getOptions().name}
        selected={node.isSelected()}
        background={node.getOptions().color}
        onDoubleClick={handleEditLiteral}
    >
        <S.Title>
            <S.TitleName>{node.getOptions().name}</S.TitleName>
        </S.Title>
        <S.Ports>
            <S.PortsContainer>{_.map(node.getInPorts(), port => <CustomPortLabel engine={engine} port={port} key={port.getID()} node={node} />)}</S.PortsContainer>
            <S.PortsContainer>{_.map(node.getOutPorts(), port => <CustomPortLabel engine={engine} port={port} key={port.getID()} node={node} />)}</S.PortsContainer>
        </S.Ports>
    </S.Node>

);

const WorkflowNode = ({ node, engine, handleEditLiteral, handleDescription, showDescription, descriptionStr }) => (
    <div style={{ position: "relative" }}>
        {showDescription && <div className="description-tooltip">
            <div data-no-drag style={{ cursor: "default" }}>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleDescription}>
                    <span aria-hidden="true">&times;</span>
                </button>
                <S.DescriptionName color={node.getOptions().color}>{node.getOptions().name}</S.DescriptionName>
                <div className="scrollable" onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollBy(e.deltaX, e.deltaY); }}>
                    <p className="description-title">Description:</p>
                    <div className="description-container">
                        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked(descriptionStr ?? '') }} />
                    </div>
                </div>
            </div>
        </div>}
        <S.WorkflowNode
            borderColor={node.getOptions().extras["borderColor"]}
            data-default-node-name={node.getOptions().name}
            selected={node.isSelected()}
            background={node.getOptions().color}
            onDoubleClick={handleEditLiteral}
        >
            <S.Title>
                <S.TitleName>{node.getOptions().name}</S.TitleName>
                <label data-no-drag>
                    <Toggle className='lock' checked={node.isLocked()} onChange={() => handleDescription('nodeDeletable')} />
                    <Toggle className='description' name='Description' checked={showDescription} onChange={handleDescription} />
                </label>
            </S.Title>
            <S.Ports>
                <S.PortsContainer>{_.map(node.getInPorts(), port => <CustomPortLabel engine={engine} port={port} key={port.getID()} node={node} />)}</S.PortsContainer>
                <S.PortsContainer>{_.map(node.getOutPorts(), port => <CustomPortLabel engine={engine} port={port} key={port.getID()} node={node} />)}</S.PortsContainer>
            </S.Ports>
        </S.WorkflowNode>
    </div>
);

const ComponentLibraryNode = ({ node, engine, shell, handleEditLiteral, handleDescription, showDescription, descriptionStr, handleDeletableNode, hideErrorTooltip }) => {
    const elementRef = React.useRef<HTMLElement>(null);

    return (
        <div style={{ position: "relative" }}>
            {showDescription && <div className="description-tooltip">
                <div data-no-drag style={{ cursor: "default" }}>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleDescription}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <S.DescriptionName color={node.getOptions().color}>{node.getOptions().name}</S.DescriptionName>
                    <div className="scrollable" onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollBy(e.deltaX, e.deltaY); }}>
                        <p className="description-title">Description:</p>
                        <div className="description-container">
                            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked(descriptionStr ?? '') }} />
                        </div>
                    </div>
                </div>
            </div>}
            <S.Node
                ref={elementRef}
                data-tip data-for={node.getOptions().id}
                borderColor={node.getOptions().extras["borderColor"]}
                data-default-node-name={node.getOptions().name}
                selected={node.isSelected()}
                background={node.getOptions().color}
                onDoubleClick={handleEditLiteral}
            >
                <S.Title>
                    <S.TitleName>{node.getOptions().name}</S.TitleName>
                    <label data-no-drag>
                        <Toggle className='lock' checked={node.isLocked()} onChange={handleDeletableNode} />
                        <Toggle className='description' name='Description' checked={showDescription} onChange={handleDescription} />
                    </label>
                </S.Title>
                <S.Ports>
                    <S.PortsContainer>{_.map(node.getInPorts(), port => <CustomPortLabel engine={engine} port={port} key={port.getID()} node={node} />)}</S.PortsContainer>
                    <S.PortsContainer>{_.map(node.getOutPorts(), port => <CustomPortLabel engine={engine} port={port} key={port.getID()} node={node} />)}</S.PortsContainer>
                </S.Ports>
            </S.Node>
            {(node.getOptions().extras["tip"] != undefined && node.getOptions().extras["tip"] != "") ?
                <ReactTooltip
                    id={node.getOptions().id}
                    clickable
                    place="bottom"
                    className="error-tooltip"
                    arrowColor="rgba(255, 0, 0, .9)"
                    delayHide={100}
                    delayUpdate={50}
                    getContent={() =>
                        <div data-no-drag className="error-container">
                            <p className="error-title">Error</p>
                            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked(node.getOptions().extras["tip"] ?? '') }} />
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={hideErrorTooltip}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    }
                    overridePosition={({ left, top }) => {
                        const currentNode = node;
                        const nodeDimension = { x: currentNode.width, y: currentNode.height };
                        const nodePosition = { x: currentNode.getX(), y: currentNode.getY() };
                        let newPositionX = nodePosition.x;
                        let newPositionY = nodePosition.y;
                        let offset = 0;

                        if (!shell.leftCollapsed) {
                            let leftSidebar = document.getElementById('jp-left-stack');
                            offset = leftSidebar.clientWidth + 2;
                        }

                        newPositionX = newPositionX - 184 + offset + (nodeDimension.x / 2);
                        newPositionY = newPositionY + 90 + nodeDimension.y;

                        const tooltipPosition = engine.getRelativePoint(newPositionX, newPositionY);

                        left = tooltipPosition.x;
                        top = tooltipPosition.y;
                        return { top, left };
                    }}
                />
                : null}
        </div>
    );
};

export class CustomNodeWidget extends React.Component<DefaultNodeProps> {
    element: React.RefObject<HTMLElement>;
    state = {
        nodeDeletable: false,
        commentInput: this.props.node['extras']['commentInput'],
        showDescription: false,
        descriptionStr: "",
    };

    constructor(props: DefaultNodeProps) {
        super(props);
        this.element = React.createRef();
    }

    handleDeletableNode = (key, event) => {
        this.setState({
            [key]: event.target.checked ? this.props.node.setLocked(true) : this.props.node.setLocked(false),
        });
    };

    handleOnChangeCanvas = () => {
        this.props.engine.fireEvent({}, 'onChange');
    };

    handleEditLiteral = () => {
        if (!this.props.node.getOptions()["name"].startsWith("Literal")) {
            return;
        }
        this.props.app.commands.execute(commandIDs.editNode);
    };

    handleEditComment = async () => {
        let dialogResult = await showFormDialog({
            body: formDialogWidget(<CommentDialog commentInput={this.state.commentInput} />),
            buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Submit' })],
            focusNodeSelector: 'textarea'
        });

        if (dialogResult["button"]["label"] === 'Cancel') {
            return false;
        }

        const newVal = dialogResult["value"][''];
        this.setState({ commentInput: newVal });
        this.props.node['extras']['commentInput'] = newVal;
        this.handleOnChangeCanvas();
    };

    handleDescription = async () => {
        await this.setState({ showDescription: !this.state.showDescription });
        this.getDescriptionStr();
        if (this.element.current) {
            ReactTooltip.show(this.element.current);
        }
    };

    getDescriptionStr = () => {
        let dscrptStr = this.props.node['extras']['description'] ?? '***No description provided***';
        this.setState({ descriptionStr: dscrptStr });
    };

    hideErrorTooltip = () => {
        delete this.props.node.getOptions().extras["tip"];
        this.props.node.getOptions().extras["borderColor"] = "rgb(0,192,255)";
    };

    render() {
        const { node, engine, shell } = this.props;
        const { showDescription, descriptionStr } = this.state;

        if (node['extras']['type'] === 'comment') {
            return <CommentNode node={node} handleEditComment={this.handleEditComment} />;
        }

        if (node.getOptions()["name"].startsWith('Literal') || node.getOptions()["name"].startsWith('Argument')) {
            return <ParameterNode node={node} engine={engine} handleEditLiteral={this.handleEditLiteral} />;
        }

        if (node['extras']['type'] === 'xircuits_workflow') {
            return <WorkflowNode node={node} engine={engine} handleEditLiteral={this.handleEditLiteral} handleDescription={this.handleDescription} showDescription={showDescription} descriptionStr={descriptionStr} />;
        }

        return <ComponentLibraryNode node={node} engine={engine} shell={shell} handleEditLiteral={this.handleEditLiteral} handleDescription={this.handleDescription} showDescription={showDescription} descriptionStr={descriptionStr} handleDeletableNode={this.handleDeletableNode} hideErrorTooltip={this.hideErrorTooltip} />;
    }
}
