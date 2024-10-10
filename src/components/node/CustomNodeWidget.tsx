import * as React from 'react';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import Toggle from 'react-toggle';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { CustomPortLabel } from '../port/CustomPortLabel';
import { Dialog } from '@jupyterlab/apputils';
import { formDialogWidget } from '../../dialog/formDialogwidget';
import { showFormDialog } from '../../dialog/FormDialog';
import { CommentDialog } from '../../dialog/CommentDialog';
import ReactTooltip from 'react-tooltip';
import { marked } from 'marked';
import Color from 'colorjs.io';
import { commandIDs } from '../../commands/CommandIDs';
import { 
    componentLibIcon, 
    branchComponentIcon, 
    workflowComponentIcon, 
    functionComponentIcon, 
    startFinishComponentIcon, 
    variableComponentIcon, 
    setVariableComponentIcon, 
    getVariableComponentIcon } from '../../ui-components/icons';
import  circuitBoardSvg from '../../../style/icons/circuit-board-bg.svg';
import { LegacyRef, MutableRefObject } from "react";



export namespace S {
    export const Node = styled.div<{ borderColor: string, background: string; selected: boolean; }>`
        box-shadow: 1px 1px 10px ${(p) => p.selected ? '3px rgb(0 192 255 / 0.5)' : '0px rgb(0 0 0 / 0.5)'};
        cursor: grab;
        border-radius: 5px;
        font-family: sans-serif;
        color: white;
        overflow: visible;
        font-size: 11px;
        border: solid 1px ${(p) => (p.selected ? (p.borderColor == undefined ? 'rgb(0,192,255)' : p.borderColor) : 'black')};
        & .grabbing {
            cursor: grabbing;
        }
    `;

    export const Title = styled.div<{ background: string; }>`
        background-image: ${(p) => {
            const color = new Color(p.background);
            color.alpha = 0.75;
            color.oklch.c *= 1.2;
            const color1 = color.to('oklch').toString()
            color.oklch.c *= 1.2;
            color.oklch.l /= 2;
            const color2 = color.to('oklch').toString()
            return `linear-gradient(${color1}, ${color2})`
        }};
        font-weight: 500;
        letter-spacing: 0.025rem;
        display: flex;
        white-space: nowrap;
        justify-items: center;
        box-shadow: inset 0 -2px 4px 0 rgb(0 0 0 / 0.05);
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    `;

    export const TitleName = styled.div`
        flex-grow: 1;
        padding: 5px 5px 5px 5px;
    `;

    export const IconContainer = styled.div`
        padding: 5px 5px 5px 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        svg {
            width: 100%;
            height: 100%;
        }
    `;

    export const CommentContainer = styled.div<{ selected: boolean; }>`
        background: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        font-family: sans-serif;
        color: rgb(255, 255, 255);
        border: solid 2px black;
        font-size: 12px;
        border: solid 2px ${(p) => p.selected ? 'rgb(0,192,255)' : 'black'};
        padding: 5px;
    `;

    export const DescriptionName = styled.div<{ color: string }>`
        color: ${(p) => p.color ?? 'rgb(0, 0, 0)'};
        text-align: justify;
        font-family: 'Roboto', sans-serif;
        font-weight: 700;
        font-size: 13px;
    `;

    export const Ports = styled.div`
        display: flex;
        background-image: linear-gradient(oklch(10% 0 0 / 0.7), oklch(10% 0 0 / 0.9));
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        
        .workflow-node & {
            background: linear-gradient(oklch(10% 0 0 / 0.7), oklch(10% 0 0 / 0.9)), url("data:image/svg+xml;base64,${btoa(circuitBoardSvg)}") no-repeat right 10px;
        }
    `;

    export const PortsContainer = styled.div`
        max-width: 640px;
        min-width: 0;
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

    export const WorkflowNode = styled(S.Node)`
    `;
}
export interface DefaultNodeProps {
    node: DefaultNodeModel;
    engine: DiagramEngine;
    app: JupyterFrontEnd;
    shell: ILabShell;
}

export const getNodeIcon = (type) => {
    switch (type) {
        case 'Start':
        case 'startFinish':
            return <startFinishComponentIcon.react />;
        case 'workflow':
        case 'xircuits_workflow':
            return <workflowComponentIcon.react />;
        case 'branch':
            return <branchComponentIcon.react />;
        case 'function':
            return <functionComponentIcon.react />;
        case 'context_set':
            return <setVariableComponentIcon.react />;
        case 'context_get':
            return <getVariableComponentIcon.react />;
        case 'variable':
            return <variableComponentIcon.react />;
        // component libraries were typed as 'debug' before v1.12.
        case 'debug':
        case 'library_component':
            return <componentLibIcon.react />;
        default:
            return null;
    }
};

function addGrabbing(e){
  e.target.classList.add('grabbing');
}

function removeGrabbing(e){
  e.target.classList.remove('grabbing');
}

const CommentNode = ({ node }) => {
    const [commentInput, setCommentInput] = React.useState(node['extras']['commentInput']);

    const handleEditComment = async () => {
        let dialogResult = await showFormDialog({
            body: formDialogWidget(<CommentDialog commentInput={commentInput} />),
            buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Submit' })],
            focusNodeSelector: 'textarea'
        });

        if (dialogResult["button"]["label"] === 'Cancel') {
            return false;
        }

        const newVal = dialogResult["value"][''];
        setCommentInput(newVal);
        node['extras']['commentInput'] = newVal;
    };

    return (
        <S.CommentContainer onDoubleClick={handleEditComment} selected={node.isSelected()} onMouseDown={addGrabbing} onMouseUp={removeGrabbing}>
            <S.TitleName><b>{node.getOptions().name}</b></S.TitleName>
            <div className='comment-component-content'>
                {commentInput}
            </div>
        </S.CommentContainer>
    );
};

const PortsComponent = ({node, engine, app}) => {
  const renderPort = (port) => {
    return <CustomPortLabel engine={engine} port={port} key={port.getID()} node={node} app={app}  />
  };
  return (
    <S.Ports>
      <S.PortsContainer>{_.map(node.getInPorts(), renderPort)}</S.PortsContainer>
      <S.PortsContainer>{_.map(node.getOutPorts(), renderPort)}</S.PortsContainer>
    </S.Ports>
  )
}

const ParameterNode = ({ node, engine, app }) => {
    const handleEditParameter = () => {
        const nodeName = node.getOptions()["name"];
        if (!nodeName.startsWith("Literal ") && !nodeName.startsWith("Argument ")) {
            return;
        }
        app.commands.execute(commandIDs.editNode);
    };

    if(node.getOptions().extras['attached']){
      return <></>;
    }

    return (
        <S.Node
            onMouseDown={addGrabbing} onMouseUp={removeGrabbing}
            borderColor={node.getOptions().extras["borderColor"]}
            data-default-node-name={node.getOptions().name}
            selected={node.isSelected()}
            background={node.getOptions().color}
            onDoubleClick={handleEditParameter}
        >
            <S.Title background={node.getOptions().color}
>
                {/* <S.IconContainer>{getNodeIcon('parameter')}</S.IconContainer> */}
                <S.TitleName>{node.getOptions().name}</S.TitleName>
            </S.Title>
            <PortsComponent node={node} engine={engine} app={app}/>
        </S.Node>
    );
};

const StartFinishNode = ({ node, engine, handleDeletableNode, app }) => (
    <S.Node
        onMouseDown={addGrabbing} onMouseUp={removeGrabbing}
        borderColor={node.getOptions().extras["borderColor"]}
        data-default-node-name={node.getOptions().name}
        selected={node.isSelected()}
        background={node.getOptions().color}
    >
        <S.Title background={node.getOptions().color}
>
            <S.IconContainer>{getNodeIcon('startFinish')}</S.IconContainer>
            <S.TitleName>{node.getOptions().name}</S.TitleName>
            <label data-no-drag>
                <Toggle className='lock' checked={node.isLocked() ?? false} onChange={event => handleDeletableNode('nodeDeletable', event)} />
            </label>
        </S.Title>
        <PortsComponent node={node} engine={engine} app={app}/>
    </S.Node>
);

const WorkflowNode = ({ node, engine, app, handleDeletableNode }) => {
    return (
        <div style={{ position: "relative" }}>
            <S.WorkflowNode
                onMouseDown={addGrabbing} onMouseUp={removeGrabbing}
                data-tip data-for={node.getOptions().id}
                borderColor={node.getOptions().extras["borderColor"]}
                data-default-node-name={node.getOptions().name}
                selected={node.isSelected()}
                background={node.getOptions().color}
                className="workflow-node"
            >
                <S.Title background={node.getOptions().color}
>
                    <S.IconContainer>{getNodeIcon('workflow')}</S.IconContainer>
                    <S.TitleName>{node.getOptions().name}</S.TitleName>
                    <label data-no-drag>
                        <Toggle className='lock' checked={node.isLocked() ?? false} onChange={event => handleDeletableNode('nodeDeletable', event)} />
                    </label>
                </S.Title>
                <PortsComponent node={node} engine={engine}  app={app}/>
            </S.WorkflowNode>
        </div>
    );
};

const ComponentLibraryNode = ({ node, engine, shell, app, handleDeletableNode }) => {
    const [showDescription, setShowDescription] = React.useState(false);
    const [descriptionStr, setDescriptionStr] = React.useState("");
    const elementRef = React.useRef<HTMLElement>(null);

    const handleDescription = async () => {
        setShowDescription(!showDescription);
        getDescriptionStr();
        if (elementRef.current) {
            ReactTooltip.show(elementRef.current);
        }
    };

    const getDescriptionStr = () => {
        let dscrptStr = node['extras']['description'] ?? '***No description provided***';
        setDescriptionStr(dscrptStr);
    };

    const hideErrorTooltip = () => {
        delete node.getOptions().extras["tip"];
        node.getOptions().extras["borderColor"] = "rgb(0,192,255)";
    };

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
                onMouseDown={addGrabbing} onMouseUp={removeGrabbing}
                ref={(elementRef as LegacyRef<HTMLDivElement>)}
                data-tip data-for={node.getOptions().id}
                borderColor={node.getOptions().extras["borderColor"]}
                data-default-node-name={node.getOptions().name}
                selected={node.isSelected()}
                background={node.getOptions().color}
            >
                <S.Title background={node.getOptions().color}
>
                    <S.IconContainer>{getNodeIcon(node['extras']['type'])}</S.IconContainer>
                    <S.TitleName>{node.getOptions().name}</S.TitleName>
                    <label data-no-drag>
                        <Toggle className='lock' checked={node.isLocked() ?? false} onChange={event => handleDeletableNode('nodeDeletable', event)} />
                        <Toggle className='description' name='Description' checked={showDescription ?? false} onChange={handleDescription} />
                    </label>
                </S.Title>
                <PortsComponent node={node} engine={engine} app={app}/>
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
    handleDeletableNode = (key, event) => {
        this.setState({
            [key]: event.target.checked ? this.props.node.setLocked(true) : this.props.node.setLocked(false),
        });
    };

    handleOnChangeCanvas = () => {
        this.props.engine.fireEvent({}, 'onChange');
    };

    render() {
        const { node, engine, app, shell } = this.props;

        if (node['extras']['type'] === 'comment') {
            return <CommentNode node={node} />;
        }

        if (node.getOptions()["name"]?.startsWith('Literal') || node.getOptions()["name"]?.startsWith('Argument')) {
            return <ParameterNode node={node} engine={engine} app={app} />;
        }

        if (node['extras']['type'] === 'xircuits_workflow') {
            return <WorkflowNode
                node={node}
                engine={engine}
                app={app}
                handleDeletableNode={this.handleDeletableNode}
            />;
        }

        if (node.getOptions()["name"] === 'Start' || node.getOptions()["name"] === 'Finish') {
            return <StartFinishNode
                node={node}
                engine={engine}
                app={app}
                handleDeletableNode={this.handleDeletableNode}
            />;
        }

        return <ComponentLibraryNode
            node={node}
            engine={engine}
            shell={shell}
            app={app}
            handleDeletableNode={this.handleDeletableNode}
        />;
    }
}
