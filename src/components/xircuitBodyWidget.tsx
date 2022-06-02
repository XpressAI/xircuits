import React, { FC, useState, useCallback, useEffect, useRef } from 'react';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from '../helpers/DemoCanvasWidget';
import { DefaultLinkModel, LinkModel } from '@projectstorm/react-diagrams';
import { NodeModel } from "@projectstorm/react-diagrams-core/src/entities/node/NodeModel";
import { Dialog, showDialog, showErrorMessage } from '@jupyterlab/apputils';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import {
	DocumentRegistry
} from '@jupyterlab/docregistry';
import styled from '@emotion/styled';
import { XPipePanel } from '../xircuitWidget';
import { Log } from '../log/LogPlugin';
import { ServiceManager } from '@jupyterlab/services';
import { formDialogWidget } from '../dialog/formDialogwidget';
import { showFormDialog } from '../dialog/FormDialog';
import { RunDialog } from '../dialog/RunDialog';
import 'rc-dialog/assets/bootstrap.css';
import { requestAPI } from '../server/handler';
import { XircuitsApplication } from './XircuitsApp';
import ComponentsPanel from '../context-menu/ComponentsPanel';
import { GeneralComponentLibrary } from '../tray_library/GeneralComponentLib';
import { NodeActionsPanel } from '../context-menu/NodeActionsPanel';
import { AdvancedComponentLibrary } from '../tray_library/AdvanceComponentLib';

export interface BodyWidgetProps {
	context: DocumentRegistry.Context;
	xircuitsApp: XircuitsApplication;
	app: JupyterFrontEnd;
	shell: ILabShell;
	commands: any;
	widgetId?: string;
	serviceManager: ServiceManager;
	fetchComponentsSignal: Signal<XPipePanel, any>;
	saveXircuitSignal: Signal<XPipePanel, any>;
	compileXircuitSignal: Signal<XPipePanel, any>;
	runXircuitSignal: Signal<XPipePanel, any>;
	runTypeXircuitSignal: Signal<XPipePanel, any>;
	debugXircuitSignal: Signal<XPipePanel, any>;
	lockNodeSignal: Signal<XPipePanel, any>;
	breakpointXircuitSignal: Signal<XPipePanel, any>;
	currentNodeSignal: Signal<XPipePanel, any>;
	testXircuitSignal: Signal<XPipePanel, any>;
	continueDebugSignal: Signal<XPipePanel, any>;
	nextNodeDebugSignal: Signal<XPipePanel, any>;
	stepOverDebugSignal: Signal<XPipePanel, any>;
	terminateDebugSignal: Signal<XPipePanel, any>;
	stepInDebugSignal: Signal<XPipePanel, any>;
	stepOutDebugSignal: Signal<XPipePanel, any>;
	evaluateDebugSignal: Signal<XPipePanel, any>;
	debugModeSignal: Signal<XPipePanel, any>;
}

export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
		height: 800px;
	`;

export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;

export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;

export const commandIDs = {
	openXircuitEditor: 'Xircuit-editor:open',
	openDocManager: 'docmanager:open',
	newDocManager: 'docmanager:new-untitled',
	saveDocManager: 'docmanager:save',
	reloadDocManager: 'docmanager:reload',
	revertDocManager: 'docmanager:restore-checkpoint',
	createNewXircuit: 'Xircuit-editor:create-new',
	saveXircuit: 'Xircuit-editor:save-node',
	compileXircuit: 'Xircuit-editor:compile-node',
	runXircuit: 'Xircuit-editor:run-node',
	debugXircuit: 'Xircuit-editor:debug-node',
	lockXircuit: 'Xircuit-editor:lock-node',
	openScript: 'Xircuit-editor:open-node-script',
	undo: 'Xircuit-editor:undo',
	redo: 'Xircuit-editor:redo',
	cutNode: 'Xircuit-editor:cut-node',
	copyNode: 'Xircuit-editor:copy-node',
	pasteNode: 'Xircuit-editor:paste-node',
	reloadNode: 'Xircuit-editor:reload-node',
	editNode: 'Xircuit-editor:edit-node',
	deleteNode: 'Xircuit-editor:delete-node',
	addNodeGivenPosition: 'Xircuit-editor:add-node', 
	connectNodeByLink: 'Xircuit-editor:connect-node',
	connectLinkToObviousPorts: 'Xircuit-editor:connect-obvious-link',
	addCommentNode: 'Xircuit-editor:add-comment-node',
	createArbitraryFile: 'Xircuit-editor:create-arbitrary-file',
	openDebugger: 'Xircuit-debugger:open',
	breakpointXircuit: 'Xircuit-editor:breakpoint-node',
	nextNode: 'Xircuit-editor:next-node',
	testXircuit: 'Xircuit-editor:test-node',
	outputMsg: 'Xircuit-log:logOutputMessage',
	executeToOutputPanel: 'Xircuit-output-panel:execute'
};


//create your forceUpdate hook
function useForceUpdate() {
	const [value, setValue] = useState(0); // integer state
	return () => setValue(value => value + 1); // update the state to force render
}


export const BodyWidget: FC<BodyWidgetProps> = ({
	context,
	xircuitsApp,
	app,
	shell,
	commands,
	widgetId,
	serviceManager,
	fetchComponentsSignal,
	saveXircuitSignal,
	compileXircuitSignal,
	runXircuitSignal,
	runTypeXircuitSignal,
	debugXircuitSignal,
	lockNodeSignal,
	breakpointXircuitSignal,
	currentNodeSignal,
	testXircuitSignal,
	continueDebugSignal,
	nextNodeDebugSignal,
	stepOverDebugSignal,
	terminateDebugSignal,
	stepInDebugSignal,
	stepOutDebugSignal,
	evaluateDebugSignal,
	debugModeSignal
}) => {

	const [prevState, updateState] = useState(0);
	const forceUpdate = useCallback(() => updateState(prevState => prevState + 1), []);
	const [saved, setSaved] = useState(false);
	const [compiled, setCompiled] = useState(false);
	const [initialize, setInitialize] = useState(true);
	const [nodesColor, setNodesColor] = useState([]);
	const [displaySavedAndCompiled, setDisplaySavedAndCompiled] = useState(false);
	const [displayDebug, setDisplayDebug] = useState(false);
	const [displayHyperparameter, setDisplayHyperparameter] = useState(false);
	const [sparkSubmitNodes, setSparkSubmitkNodes] = useState<string>("");
	const [stringNodes, setStringNodes] = useState<string[]>(["experiment name"]);
	const [intNodes, setIntNodes] = useState<string[]>([]);
	const [floatNodes, setFloatNodes] = useState<string[]>([]);
	const [boolNodes, setBoolNodes] = useState<string[]>([]);
	const [stringNodesValue, setStringNodesValue] = useState<string[]>([""]);
	const [intNodesValue, setIntNodesValue] = useState<number[]>([0]);
	const [floatNodesValue, setFloatNodesValue] = useState<number[]>([0.00]);
	const [boolNodesValue, setBoolNodesValue] = useState<boolean[]>([false]);
	const [componentList, setComponentList] = useState([]);
	const [runOnce, setRunOnce] = useState(false);
	const [displayRcDialog, setDisplayRcDialog] = useState(false);
	const [disableRcDialog, setDisableRcDialog] = useState(false);
	const [debugMode, setDebugMode] = useState<boolean>(false);
	const [inDebugMode, setInDebugMode] = useState<boolean>(false);
	const [currentIndex, setCurrentIndex] = useState<number>(-1);
	const [runType, setRunType] = useState<string>("run");
	const [addedArgSparkSubmit, setAddedArgSparkSubmit] = useState<string>("");
	const xircuitLogger = new Log(app);
	const contextRef = useRef(context);
	const notInitialRender = useRef(false);
	const needAppend = useRef("");

	const onChange = useCallback(
		(): void => {
			if (contextRef.current.isReady) {
				let currentModel = xircuitsApp.getDiagramEngine().getModel().serialize();
				contextRef.current.model.fromString(
					JSON.stringify(currentModel, null, 4)
				);
				setSaved(false);
			}
		}, []);

	useEffect(() => {
		const currentContext = contextRef.current;

		const changeHandler = (): void => {
			const modelStr = currentContext.model.toString();
			if (!isJSON(modelStr)) {
				// When context can't be parsed, just return
				return
			}

			try {
				if (notInitialRender.current) {
					const model: any = currentContext.model.toJSON();
					let deserializedModel = xircuitsApp.customDeserializeModel(model, xircuitsApp.getDiagramEngine());
					deserializedModel.registerListener({
						// Detect changes when node is dropped or deleted
						nodesUpdated: () => {
							// Add delay for links to disappear 
							const timeout = setTimeout(() => {
								onChange();
								setInitialize(false);
							}, 10)
							return () => clearTimeout(timeout)
						},
						linksUpdated: function (event) {
							event.link.registerListener({
								/**
								 * sourcePortChanged
								 * Detect changes when link is connected
								 */
								sourcePortChanged: e => {
									onChange();
								},
								/**
								 * targetPortChanged
								 * Detect changes when link is connected
								 */
								targetPortChanged: e => {
									const sourceLink = e.entity as any;
									app.commands.execute(commandIDs.connectLinkToObviousPorts, { sourceLink });
									onChange();
								},
								/**
								 * entityRemoved
								 * Detect changes when new link is removed
								 */
								entityRemoved: e => {
									onChange();
								}
							});
						}
					})
					xircuitsApp.getDiagramEngine().setModel(deserializedModel);
				} else {
					// Clear undo history when first time rendering
					notInitialRender.current = true;
					currentContext.model.sharedModel.clearUndoHistory();
					// Register engine listener just once
					xircuitsApp.getDiagramEngine().registerListener({
						droppedLink: event => showComponentPanelFromLink(event),
						hidePanel: () => hidePanel(),
						onChange: () => onChange()
					})
				}
			} catch (e) {
				showErrorMessage('Error', <pre>{e}</pre>)
			}
		};

		currentContext.ready.then(changeHandler);
		currentContext.model.contentChanged.connect(changeHandler);

		return (): void => {
			currentContext.model.contentChanged.disconnect(changeHandler);
		};
	}, []);

	const isJSON = (str) => {
		try {
			return (JSON.parse(str) && !!str);
		} catch (e) {
			return false;
		}
	}

	const getBindingIndexById = (nodeModels: any[], id: string): number | null => {
		for (let i = 0; i < nodeModels.length; i++) {
			let nodeModel = nodeModels[i];

			if (nodeModel.getID() === id) {
				return i;
			}
		}
		return null;
	}

	const getTargetNodeModelId = (linkModels: LinkModel[], sourceId: string): string | null => {
		for (let i = 0; i < linkModels.length; i++) {
			let linkModel = linkModels[i];

			if (linkModel.getSourcePort().getNode().getID() === sourceId && linkModel.getTargetPort().getOptions()["label"] == '▶') {
				return linkModel.getTargetPort().getNode().getID();
			}
		}
		return null;
	}

	const getTargetTrueBranchNodeModelId = (linkModels: LinkModel[], sourceId: string): string | null => {
		for (let i = 0; i < linkModels.length; i++) {
			let linkModel = linkModels[i];
			if (linkModel.getSourcePort().getNode().getID() === sourceId && linkModel.getSourcePort().getOptions()["label"] == 'If True  ▶') {
				return linkModel.getTargetPort().getNode().getID();
			}
		}
		return null;
	}

	const getTargetFalseBranchNodeModelId = (linkModels: LinkModel[], sourceId: string): string | null => {
		for (let i = 0; i < linkModels.length; i++) {
			let linkModel = linkModels[i];
			if (linkModel.getSourcePort().getNode().getID() === sourceId && linkModel.getSourcePort().getOptions()["label"] == 'If False ▶') {
				return linkModel.getTargetPort().getNode().getID();
			}
		}
		return null;
	}

	const getTargetFinishedBranchNodeModelId = (linkModels: LinkModel[], sourceId: string): string | null => {
		for (let i = 0; i < linkModels.length; i++) {
			let linkModel = linkModels[i];
			if (linkModel.getSourcePort().getNode().getID() === sourceId && linkModel.getSourcePort().getOptions()["label"] == 'Finished ▶') {
				return linkModel.getTargetPort().getNode().getID();
			}
		}
		return null;
	}

	const getNodeModelByName = (nodeModels: any[], name: string): NodeModel | null => {
		for (let i = 0; i < nodeModels.length; i++) {
			let nodeModel = nodeModels[i];

			if (nodeModel.getOptions()["name"] === name) {
				return nodeModel;
			}
		}
		return null;
	}

	const getNodeModelById = (nodeModels: any[], id: string): NodeModel | null => {
		for (let i = 0; i < nodeModels.length; i++) {
			let nodeModel = nodeModels[i];

			if (nodeModel.getID() === id) {
				return nodeModel;
			}
		}
		return null;
	}

	const getTargetNodeFromBranch = (nodeModel) => {
		let model = xircuitsApp.getDiagramEngine().getModel();
		let nodeModels = model.getNodes();
		const trueBranchLink = nodeModel['ports']['out-1']['links'] as any;
		const falseBranchLink = nodeModel['ports']['out-2']['links'] as any;
		const getTrueBranchNodeId = getTargetTrueBranchNodeModelId(model.getLinks(), nodeModel.getID());
		const getFalseBranchNodeId = getTargetFalseBranchNodeModelId(model.getLinks(), nodeModel.getID());
		const getFinishedBranchNodeId = getTargetFinishedBranchNodeModelId(model.getLinks(), nodeModel.getID());
		const trueNodeModel = getNodeModelById(nodeModels, getTrueBranchNodeId);
		const falseNodeModel = getNodeModelById(nodeModels, getFalseBranchNodeId);
		const finishedNodeModel = getNodeModelById(nodeModels, getFinishedBranchNodeId);
		let nodeId : string;
		let tempNodeModel;
		let falseBranchWorkflow: boolean = false;
		let onlyFinishedWorkflow: boolean = false;

		if (Object.keys(trueBranchLink).length != 0) {
			// Set initial node when If True port has nodes
			nodeId = getTrueBranchNodeId;
			tempNodeModel = trueNodeModel;
		}
		else if (Object.keys(falseBranchLink).length != 0) {
			// Start If False connection when If True port has no nodes
			nodeId = getFalseBranchNodeId;
			tempNodeModel = falseNodeModel;
			falseBranchWorkflow = true;
		} else {
			// When there's no nodes from If True and False port, just run finished port
			nodeId = getFinishedBranchNodeId;
			tempNodeModel = finishedNodeModel;
			onlyFinishedWorkflow = true;
		}
		return {nodeId, tempNodeModel, falseBranchWorkflow, onlyFinishedWorkflow}
	}

	const getAllNodesFromStartToFinish = (): NodeModel[] | null => {
		let model = xircuitsApp.getDiagramEngine().getModel();
		let nodeModels = model.getNodes();
		let branchNodeIds: string[] = [];
		let falseBranchWorkflow: boolean = false;
		let onlyFinishedWorkflow: boolean = false;
		let branchTargetNode: {
			nodeId: string, 
			tempNodeModel: any, 
			falseBranchWorkflow: boolean, 
			onlyFinishedWorkflow: boolean
		}
		let startNodeModel = getNodeModelByName(nodeModels, 'Start');
		if (startNodeModel == null) {
			startNodeModel = getNodeModelByName(nodeModels, '🔴Start');
		}

		if (startNodeModel) {
			let sourceNodeModelId = startNodeModel.getID();
			let retNodeModels: NodeModel[] = [];
			retNodeModels.push(startNodeModel);

			// Iterate through each node 
			while (getTargetNodeModelId(model.getLinks(), sourceNodeModelId) != null || branchNodeIds.length != 0) {
				let getTargetNode = getTargetNodeModelId(model.getLinks(), sourceNodeModelId);
				let getFalseBranchNode = getTargetFalseBranchNodeModelId(model.getLinks(), branchNodeIds[branchNodeIds.length - 1]);
				let getFinishedBranchNode = getTargetFinishedBranchNodeModelId(model.getLinks(), branchNodeIds[branchNodeIds.length - 1]);
				let falseBranchNodeModel = getNodeModelById(nodeModels, getFalseBranchNode);
				let finishBranchNodeModel = getNodeModelById(nodeModels, getFinishedBranchNode);

				const finishedWorkflow = () => {
					// Remove the last added branch Ids from list
					branchNodeIds.pop();

					if (finishBranchNodeModel['name'] == 'Branch') {
						// When the first node at Finished port is Branch, add its Id
						branchNodeIds.push(finishBranchNodeModel.getID());
					}

					retNodeModels.push(finishBranchNodeModel);
					sourceNodeModelId = getFinishedBranchNode;
					falseBranchWorkflow = false;
					onlyFinishedWorkflow = false;
				}

				if (getTargetNode == null && onlyFinishedWorkflow) {
					// When both If True/False ▶ have no node, just skip
					branchNodeIds.pop();
					onlyFinishedWorkflow = false;
					continue;
				}

				// False branch
				if (getTargetNode == null) {
					if (falseBranchWorkflow || falseBranchNodeModel == null) {
						// When already when through False branch, go to Finished workflow
						// When If False ▶ have no node, just skip to Finished
						finishedWorkflow();
						continue;
					}
					retNodeModels.push(falseBranchNodeModel);
					sourceNodeModelId = getFalseBranchNode;
					falseBranchWorkflow = true;
					continue;
				}

				if (getTargetNode) {
					const nodeModel = getNodeModelById(nodeModels, getTargetNode);
					let nodeId : string;
					let tempNodeModel;

					if (nodeModel['extras']['type'] == 'Branch') {
						branchNodeIds.push(nodeModel.getID());
						retNodeModels.push(nodeModel);

						branchTargetNode = getTargetNodeFromBranch(nodeModel);
						nodeId = branchTargetNode.nodeId;
						tempNodeModel = branchTargetNode.tempNodeModel;
						falseBranchWorkflow = branchTargetNode.falseBranchWorkflow;
						onlyFinishedWorkflow = branchTargetNode.onlyFinishedWorkflow;
						sourceNodeModelId = nodeId;
						retNodeModels.push(tempNodeModel);
						continue;
					}

					if (nodeModel) {
						sourceNodeModelId = nodeModel.getID();
						retNodeModels.push(nodeModel);
					}
				}
			}
			return retNodeModels;
		}

		return null;
	}

	const getPythonCompiler = (debuggerMode?): string => {
		let componentDB = new Map(componentList.map(x => [x["task"], x]))
		let component_task = componentList.map(x => x["task"]);
		let model = xircuitsApp.getDiagramEngine().getModel();
		let nodeModels = model.getNodes();
		let startNodeModel = getNodeModelByName(nodeModels, 'Start');
		let pythonCode = 'from argparse import ArgumentParser\n';
		pythonCode += 'from distutils.util import strtobool\n';
		pythonCode += 'from datetime import datetime\n';
		pythonCode += 'from time import sleep\n';
		if (debuggerMode == true) {
			pythonCode += 'import json, os, signal\n';
			pythonCode += 'from flask import Flask, jsonify, request\n';
			pythonCode += 'from threading import Thread\n';
		}

		let uniqueComponents = {};

		let allNodes = getAllNodesFromStartToFinish();

		for (let node in allNodes) {
			let nodeType = allNodes[node]["extras"]["type"];
			let componentName = allNodes[node]["name"];
			componentName = componentName.replace(/\s+/g, "");

			if (nodeType == 'Start' ||
				nodeType == 'Finish' ||
				nodeType === 'boolean' ||
				nodeType === 'int' ||
				nodeType === 'float' ||
				nodeType === 'string') { }
			else {
				uniqueComponents[componentName] = componentName;
			}
		}

		let python_paths = new Set();
		for (let key in uniqueComponents) {
			let component = componentDB.get(key) || { "python_path": null };
			if (component["python_path"] != null) python_paths.add(component["python_path"]);
		}
		if (python_paths.size > 0) {
			pythonCode += "import sys\n"
		}
		python_paths.forEach((path: string) => {
			pythonCode += `sys.path.append("${path.replace(/\\/gi, "\\\\")}")\n`
		})

		for (let componentName in uniqueComponents) {
			let component_exist = component_task.indexOf(componentName);
			let current_node: any;
			let package_name: string = "components";

			const addImportNode = getNodeModelByName(nodeModels, 'AddImport');
			if (componentName == 'AddImport') {
				const importPortName = addImportNode['portsIn'][1].getOptions()['name']
				const getImportPortLinks = addImportNode.getPorts()[importPortName].getLinks();
				for (let portLink in getImportPortLinks) {
					// Add value of import_str port for importing
					const importLabel = getImportPortLinks[portLink].getSourcePort().getOptions()["label"];
					pythonCode += importLabel + "\n";
				}
			}

			if (component_exist != -1) {
				current_node = componentList[component_exist];
				package_name = current_node["package_name"];
			}
			pythonCode += "from " + package_name + " import " + componentName + "\n";

		}

		if (debuggerMode == true) {
			pythonCode += "\napp = Flask(__name__)\n";
			pythonCode += "input_data = []\n";
			pythonCode += "continue_input_data = []\n";
			pythonCode += "inarg_output_data = []\n";
			pythonCode += "outarg_output_data = []\n";
			pythonCode += "is_done_list = []\n";
		}

		pythonCode += "\ndef main(args):\n\n";
		pythonCode += '    ' + 'ctx = {}\n';
		pythonCode += '    ' + "ctx['args'] = args\n\n";

		let actualNodesNum = 0;
		for (let i = 0; i < allNodes.length; i++) {
			actualNodesNum++;
			let nodeType = allNodes[i]["extras"]["type"];
			
			if (nodeType == 'Start' ||
				nodeType == 'Finish' ||
				nodeType === 'boolean' ||
				nodeType === 'int' ||
				nodeType === 'float' ||
				nodeType === 'string') {
				// Skip these type of node
				actualNodesNum--;
			}
			else {
				let bindingName = 'c_' + actualNodesNum;
				let componentName = allNodes[i]["name"];
				componentName = componentName.replace(/\s+/g, "");
				pythonCode += '    ' + bindingName + ' = ' + componentName + '()\n';
			}
		}

		pythonCode += '\n';

		if (startNodeModel) {
			let j = 0;

			for (let i = 0; i < allNodes.length; i++) {
				j++;
				let nodeType = allNodes[i]["extras"]["type"];

				if (nodeType == 'Start' ||
					nodeType == 'Finish' ||
					nodeType === 'boolean' ||
					nodeType === 'int' ||
					nodeType === 'float' ||
					nodeType === 'string') {
					// Skip these type of node
					j--;
					continue;
				}

				let bindingName = 'c_' + j;
				let targetNodeId = allNodes[i].getOptions()['id'];
				let currentNodeModel = getNodeModelById(nodeModels, targetNodeId);
				let allPort = currentNodeModel.getPorts();
				// Reset appending values
				needAppend.current = "";

				for (let port in allPort) {

					let portIn = allPort[port].getOptions().alignment == 'left';

					if (portIn) {
						let label = allPort[port].getOptions()["label"];
						label = label.replace(/\s+/g, "_");
						label = label.toLowerCase();

						if (label.startsWith("★")) {
							const newLabel = label.split("★")[1];
							label = newLabel;
						}

						if (label == '▶') {
						} else {
							let portLinks = allPort[port].getLinks();

							for (let portLink in portLinks) {
								let sourceNodeName = portLinks[portLink].getSourcePort().getNode()["name"];
								let sourceNodeType = portLinks[portLink].getSourcePort().getNode().getOptions()["extras"]["type"];
								let sourceNodeId = portLinks[portLink].getSourcePort().getNode().getOptions()["id"];
								let sourcePortLabel = portLinks[portLink].getSourcePort().getOptions()["label"];
								let k = getBindingIndexById(allNodes, sourceNodeId);
								let preBindingName = 'c_' + k;

								//Get the id of the node of the connected link
								let linkSourceNodeId = allPort[port]["links"][portLink]["sourcePort"]["parent"]["options"]["id"];
								let equalSign = ' = ';
								let sourcePortLabelStructure;

								// When port is 'string', 'list' and 'dict' type 
								// append values if there's multiple link connected
								if (port.includes('string') ||
									port.includes('list') ||
									port.includes('dict')
								) {
									if (needAppend.current == label) {
										switch (sourceNodeType) {
											case "dict":
												equalSign = ' |= '
												break;
											default:
												equalSign = ' += '
												break;
										}
									}
									needAppend.current = label;
								}

								if (port.startsWith("parameter")) {

									if (sourceNodeName.startsWith("Literal")) {
										switch (sourceNodeType) {
											case "string":
												sourcePortLabelStructure = "'" + sourcePortLabel + "'";
												break;
											case "list":
												sourcePortLabelStructure = "[" + sourcePortLabel + "]";
												break;
											case "tuple":
												sourcePortLabelStructure = "(" + sourcePortLabel + ")";
												break;
											case "dict":
												sourcePortLabelStructure = "{" + sourcePortLabel + "}";
												break;
											default:
												sourcePortLabelStructure = sourcePortLabel;
												break;
										}
										pythonCode += '    ' + bindingName + '.' + label + '.value' + equalSign + sourcePortLabelStructure + "\n";
									} else if (linkSourceNodeId == sourceNodeId && !sourceNodeName.startsWith("Hyperparameter")) {
										// Make sure the node id match between connected link and source node
										// Skip Hyperparameter Components
										pythonCode += '    ' + bindingName + '.' + label + equalSign + preBindingName + '.' + sourcePortLabel + '\n';
									} else {
										sourcePortLabel = sourcePortLabel.replace(/\s+/g, "_");
										sourcePortLabel = sourcePortLabel.toLowerCase();
										sourceNodeName = sourceNodeName.split(": ");
										let paramName = sourceNodeName[sourceNodeName.length - 1];
										paramName = paramName.replace(/\s+/g, "_");
										paramName = paramName.toLowerCase();
										pythonCode += '    ' + bindingName + '.' + label + '.value' + equalSign + 'args.' + paramName + '\n';
									}

								} else {
									pythonCode += '    ' + bindingName + '.' + label + equalSign + preBindingName + '.' + sourcePortLabel + '\n';
								}
							}
						}
					}
				}
			}
		}

		pythonCode += '\n';

		for (let i = 1; i < allNodes.length; i++) {
			let nodeType = allNodes[i]["extras"]["type"];
			let bindingName = 'c_' + i;
			let nextBindingName = 'c_' + (i + 1);

			if (nodeType == 'Start') {
			} else if (nodeType == 'Finish') {
				bindingName = 'c_' + (i - 1);
				pythonCode += '    ' + bindingName + '.next = ' + 'None\n';
			}
			else if (nodeType == 'Branch') {
				let trueBranchLink = allNodes[i]['ports']['out-1']['links'] as any;
				let falseBranchLink = allNodes[i]['ports']['out-2']['links'] as any;
				let finishedBranchLink = allNodes[i]['ports']['out-0']['links'] as any;

				const finishedBranchBindingIndex = (finishedBranch?: boolean) => {
					let branchTargetNodeIndex;
					let branchBindingName;

					for (let j = 0; j < allNodes.length; j++) {
						if (!finishedBranch) {
							for (let linkID in falseBranchLink) {
								let falseLink = falseBranchLink[linkID];
								if (falseLink['targetPort']['parent'].getID() == allNodes[j].getID()) {
									branchTargetNodeIndex = j;
								}
							}
						} else {
							for (let linkID in finishedBranchLink) {
								let finishedLink = finishedBranchLink[linkID];
								if (finishedLink['targetPort']['parent'].getID() == allNodes[j].getID()) {
									branchTargetNodeIndex = j;
								}
							}
						}
					}
					branchBindingName = 'c_' + branchTargetNodeIndex;
					return branchBindingName;
				}
				
				let finishedBranchBindingName = finishedBranchBindingIndex(true);
				let falseBranchBindingName = finishedBranchBindingIndex(false);

				if (Object.keys(falseBranchLink).length == 0 && Object.keys(trueBranchLink).length == 0) {
					// When both If True/False not connected
					pythonCode += '    ' + bindingName + '.when_true = ' + nextBindingName + '\n';
					pythonCode += '    ' + bindingName + '.when_false = ' + nextBindingName + '\n';
				} else if (Object.keys(trueBranchLink).length == 0) {
					// When If True have no nodes but If False is connected
					pythonCode += '    ' + bindingName + '.when_true = ' + finishedBranchBindingName + '\n';
					pythonCode += '    ' + bindingName + '.when_false = ' + nextBindingName + '\n';
				} else if (Object.keys(falseBranchLink).length == 0) {
					// When If False have no nodes but If True is connected
					pythonCode += '    ' + bindingName + '.when_true = ' + nextBindingName + '\n';
					pythonCode += '    ' + bindingName + '.when_false = ' + finishedBranchBindingName + '\n';
				} 
				else {
					pythonCode += '    ' + bindingName + '.when_true = ' + nextBindingName + '\n';
					pythonCode += '    ' + bindingName + '.when_false = ' + falseBranchBindingName + '\n';
				}
			}
			else {
				let nodeLink = allNodes[i]['ports']['out-0']['links'];
				let nextNodeSourceLinks = allNodes[i + 1]['ports']['in-0']['links']
					
				// When next node is Finish, just skip
				if (allNodes[i + 1]['extras']['type'] == 'Finish') continue;

				// Check whether next node is empty
				if (Object.keys(nodeLink).length == 0) {
					for (let linkID in nextNodeSourceLinks) {
						let link = nextNodeSourceLinks[linkID];
						// Check whether source link is from If False ▶ port
						if (link['sourcePort'].getOptions()['label'] == 'If False ▶') {
							let finishedBranchNodeIndex = i;
							let finishedBranchBindingName;
							for (let j = i + 1; j < allNodes.length; j++) {
								let falseBranchNodeLink = allNodes[j]['ports']['out-0']['links'];
								finishedBranchNodeIndex++;
								if (Object.keys(falseBranchNodeLink).length == 0) {
									// Stop counting node after port If False ▶ lost connection
									finishedBranchNodeIndex++;
									finishedBranchBindingName = 'c_' + finishedBranchNodeIndex;
									pythonCode += '    ' + bindingName + '.next = ' + finishedBranchBindingName + '\n';
								break;
							}
						}
						} else if (link['sourcePort'].getOptions()['label'] == 'Finished ▶') {
							pythonCode += '    ' + bindingName + '.next = ' + nextBindingName + '\n';
					}
				}
					continue;
			}
				pythonCode += '    ' + bindingName + '.next = ' + nextBindingName + '\n';
			}
		}

		if (debuggerMode == true) pythonCode += '    ' + 'debug_mode = args.debug_mode\n';

		if (allNodes.length > 2) {

			pythonCode += '\n';
			pythonCode += '    ' + 'next_component = c_1\n';
			pythonCode += '    ' + 'while next_component:\n';

			if (debuggerMode == true) {
				pythonCode += '        ' + 'if debug_mode:\n';
				pythonCode += '            ' + 'if len(continue_input_data) > 0 and continue_input_data[-1] == \'continue\':\n';
				pythonCode += '                ' + 'vars_dict = vars(next_component)\n';
				pythonCode += '                ' + 'new_dict = {}\n';
				pythonCode += '                ' + 'for i in vars_dict:\n';
				pythonCode += '                    ' + 'if not i in [\'next\', \'done\']:\n';
				pythonCode += '                        ' + 'new_dict[i] = next_component.__getattribute__(i).value\n';
				pythonCode += '                        ' + 'if \'InArg\' in str(vars_dict[i]):\n';
				pythonCode += '                            ' + 'inarg_output_data.append(str(i) + \': \' + str(next_component.__getattribute__(i).value))\n';
				pythonCode += '                        ' + 'if \'OutArg\' in str(vars_dict[i]):\n';
				pythonCode += '                            ' + 'outarg_output_data.append(str(i) + \': \' + str(next_component.__getattribute__(i).value))\n';
				pythonCode += '                ' + 'continue_input_data.clear()\n';
				pythonCode += '\n';

				pythonCode += '            ' + 'if len(input_data) > 0 and input_data[-1] == \'run\':\n';
				pythonCode += '                ' + 'is_done, next_component = next_component.do(ctx)\n';
				pythonCode += '                ' + 'input_data.clear()\n';
				pythonCode += '                ' + 'is_done_list.append(is_done)\n';
				pythonCode += '\n';

				pythonCode += '            ' + 'if len(input_data) > 0 and input_data[-1] == \'skip\':\n';
				pythonCode += '                ' + 'is_done, next_component = next_component.do(ctx)\n';
				pythonCode += '\n';

				pythonCode += '        ' + 'else:\n';
				pythonCode += '            ' + 'is_done, next_component = next_component.do(ctx)\n';
				pythonCode += '\n';

				pythonCode += '@app.route(\'/terminate\')\n';
				pythonCode += 'def shutdown():\n';
				pythonCode += '    ' + 'os.kill(os.getpid(), signal.SIGINT)\n';
				pythonCode += '    ' + 'return jsonify({ "success": True, "message": "Server is shutting down..." })\n\n';

				pythonCode += '@app.route(\'/run\')\n';
				pythonCode += 'def next_node(input_data=input_data):\n';
				pythonCode += '    ' + 'input_data.append("run")\n';
				pythonCode += '    ' + 'return jsonify({ "success": True, "message": "Run is executed" })\n\n';

				pythonCode += '@app.route(\'/execute\')\n';
				pythonCode += 'def get_execution_output():\n';
				pythonCode += '    ' + 'return str(is_done_list)\n\n';

				pythonCode += '@app.route(\'/clear_execution\')\n';
				pythonCode += 'def clear_execution_output():\n';
				pythonCode += '    ' + 'is_done_list.clear()\n';
				pythonCode += '    ' + 'return jsonify({ "success": True, "message": "Clearing execution" })\n\n';

				pythonCode += '@app.route(\'/continue\')\n';
				pythonCode += 'def continue_node(continue_input_data=continue_input_data):\n';
				pythonCode += '    ' + 'continue_input_data.append("continue")\n';
				pythonCode += '    ' + 'return jsonify({ "success": True, "message": "Continue is executed" })\n\n';

				pythonCode += '@app.route(\'/clear\')\n';
				pythonCode += 'def clear_node():\n';
				pythonCode += '    ' + 'inarg_output_data.clear()\n';
				pythonCode += '    ' + 'outarg_output_data.clear()\n';
				pythonCode += '    ' + 'return jsonify({ "success": True, "message": "Clearing input/output args" })\n\n';

				pythonCode += '@app.route(\'/get/output\')\n';
				pythonCode += 'def get_output_data():\n';
				pythonCode += '    ' + 'inarg_output = \'\'\n';
				pythonCode += '    ' + 'if inarg_output_data != []:\n';
				pythonCode += '        ' + 'inarg_output = \'InArg -> \'\n';
				pythonCode += '        ' + 'inarg_output += \'\t\'.join(inarg_output_data)\n\n';
				pythonCode += '    ' + 'outarg_output = \'\'\n';
				pythonCode += '    ' + 'if outarg_output_data != []:\n';
				pythonCode += '        ' + 'outarg_output = \'OutArg -> \'\n';
				pythonCode += '        ' + 'outarg_output += \'\t\'.join(outarg_output_data)\n\n';
				pythonCode += '    ' + 'return (str(inarg_output) + \' \' + str(outarg_output)).strip()\n\n';
			} else {
				pythonCode += '        ' + 'is_done, next_component = next_component.do(ctx)\n';
				pythonCode += '\n';
			}

			pythonCode += "if __name__ == '__main__':\n";
			pythonCode += '    ' + 'parser = ArgumentParser()\n';

			if (stringNodes) {
				for (let i = 0; i < stringNodes.length; i++) {
					let stringParam = stringNodes[i].replace(/\s+/g, "_");
					stringParam = stringParam.toLowerCase();

					if (stringParam == 'experiment_name') {
						let dateTimeStr = "\'\%Y-\%m-\%d \%H:\%M:\%S\'"
						pythonCode += '    ' + "parser.add_argument('--" + stringParam + "', default=datetime.now().strftime(" + dateTimeStr + "), type=str)\n";
					} else {
						pythonCode += '    ' + "parser.add_argument('--" + stringParam + "', default='test', type=str)\n";
					}
				}
			}

			if (intNodes) {

				for (let i = 0; i < intNodes.length; i++) {
					let intParam = intNodes[i].replace(/\s+/g, "_");
					intParam = intParam.toLowerCase();
					pythonCode += '    ' + "parser.add_argument('--" + intParam + "', default='1', type=int)\n";
				}
			}

			if (floatNodes) {

				for (let i = 0; i < floatNodes.length; i++) {
					let floatParam = floatNodes[i].replace(/\s+/g, "_");
					floatParam = floatParam.toLowerCase();
					pythonCode += '    ' + "parser.add_argument('--" + floatParam + "', default='1.0', type=float)\n";
				}
			}

			if (boolNodes) {

				for (let i = 0; i < boolNodes.length; i++) {
					let boolParam = boolNodes[i].replace(/\s+/g, "_");
					boolParam = boolParam.toLowerCase();
					pythonCode += '    ' + "parser.add_argument('--" + boolParam + "', dest='" + boolParam + "', type=lambda x: bool(strtobool(x)))\n";
				}
			}
			if (debuggerMode == true) {
				pythonCode += '    ' + "parser.add_argument('--debug_mode', default=False, type=bool)\n\n";
				pythonCode += '    ' + "debug_mode = parser.parse_args().debug_mode\n";
				pythonCode += '    ' + "if debug_mode:\n";
				pythonCode += '        ' + 'thread = Thread(target=app.run, daemon=True)\n';
				pythonCode += '        ' + 'thread.start()\n\n';
			}

			pythonCode += '    ' + 'main(parser.parse_args())\n';
			pythonCode += '    ' + 'print("\\nFinish Executing")';
		}

		return pythonCode;
	}

	const checkBranchFinishedPortConnected = (): boolean | null => {
		let nodeModels = xircuitsApp.getDiagramEngine().getModel().getNodes();
		for (let i = 0; i < nodeModels.length; i++) {
			let outPorts = nodeModels[i]["portsOut"];
			let branchNodeType = nodeModels[i]['extras']['type']
			if (branchNodeType == 'Branch') {
				if (outPorts[2].getOptions()["label"] == 'Finished ▶' && Object.keys(outPorts[2].getLinks()).length == 0) {
					// When Finished ▶ has no link, show error tooltip
						nodeModels[i].getOptions().extras["borderColor"] = "red";
					nodeModels[i].getOptions().extras["tip"] = "Please make sure this Branch Finished ▶ is properly connected ";
						nodeModels[i].setSelected(true);
						return false;
					}
				}
			}
		return true;
	}

	const checkAllNodesConnected = (): boolean | null => {
		let allNodes = getAllNodesFromStartToFinish();
		let lastNode = allNodes[allNodes.length - 1];
		
		if (lastNode['name'] != 'Finish') {
			// When last node is not Finish node, check failed and show error tooltip
			lastNode.getOptions().extras["borderColor"] = "red";
			lastNode.getOptions().extras["tip"] = `Please make sure this ${lastNode['name']} node end with Finish node`;
			lastNode.setSelected(true);
			return false;
		}
		return true;
	}

	const checkAllCompulsoryInPortsConnected = (): boolean | null => {
		let allNodes = getAllNodesFromStartToFinish();
		for (let i = 0; i < allNodes.length; i++) {
			for (let k = 0; k < allNodes[i]["portsIn"].length; k++) {
				let node = allNodes[i]["portsIn"][k]
				if (node.getOptions()["label"].startsWith("★") && Object.keys(node.getLinks()).length == 0) {
					allNodes[i].getOptions().extras["borderColor"] = "red";
					allNodes[i].getOptions().extras["tip"] = "Please make sure the [★]COMPULSORY InPorts are connected ";
					allNodes[i].setSelected(true);
					return false;
				}
			}
		}
		return true;
	}

	const handleSaveClick = () => {
		// Only save xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		onChange()
		setInitialize(true);
		setSaved(true);
		commands.execute(commandIDs.saveDocManager);
	}

	const handleCompileClick = () => {
		// Only compile xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		if (!saved) {
			alert("Please save before compiling.");
			return;
		}

		let finishedPortConnected = checkBranchFinishedPortConnected();
		if (!finishedPortConnected) {
			alert("Please connect all Branch's Finished port.");
			return;
		}

		let allNodesConnected = checkAllNodesConnected();

		if (!allNodesConnected) {
			alert("Please connect all the nodes before compiling.");
			return;
		}

		let pythonCode = getPythonCompiler();
		let showOutput = true;
		setCompiled(true);
		commands.execute(commandIDs.createArbitraryFile, { pythonCode, showOutput });
	}

	const handleUnsaved = () => {

		onHide('displaySavedAndCompiled');
		handleSaveClick();
		handleCompileClick();
	}

	const saveAndCompileAndRun = async (debuggerMode: boolean) => {

		//This is to avoid running xircuits while in dirty state
		if (contextRef.current.model.dirty) {
			const dialogResult = await showDialog({
				title:
					'This xircuits contains unsaved changes.',
				body:
					'To run the xircuits the changes need to be saved.',
				buttons: [
					Dialog.cancelButton(),
					Dialog.okButton({ label: 'Save and Run' })
				]
			});
			if (dialogResult.button && dialogResult.button.accept === true) {
				await handleSaveClick();
			} else {
				// Don't proceed if cancel button pressed
				return;
			}
		}

		// compile
		let finishedPortConnected = checkBranchFinishedPortConnected();
		if (!finishedPortConnected) {
			alert("Please connect all Branch's Finished port.");
			return;
		} 

		let allNodesConnected = checkAllNodesConnected();
		let allCompulsoryNodesConnected = checkAllCompulsoryInPortsConnected();

		if (!allNodesConnected) {
			if (!debugMode) {
				alert("Please connect all the nodes before running.");
				return;
			}
			alert("Please connect all the nodes before debugging.");
			return;
		}
		if (!allCompulsoryNodesConnected) {
			alert("Please connect all [★]COMPULSORY InPorts.");
			return;
		}

		let pythonCode = getPythonCompiler(debuggerMode);
		let showOutput = false;

		// Only compile when 'Run' is chosen
		if (runType == 'run') {
			commands.execute(commandIDs.createArbitraryFile, { pythonCode, showOutput });
			setCompiled(true);
		}

		// Compile Mode
		if (debuggerMode) {
			const runCommand = await handleRunDialog();
			const debug_mode = "--debug_mode True";
			if (runCommand) {
				commands.execute(commandIDs.executeToOutputPanel, { runCommand, debug_mode });
				commands.execute(commandIDs.openDebugger);
				setDebugMode(true);
				setInDebugMode(false);
				let allNodes = getAllNodesFromStartToFinish();
				allNodes.forEach((node) => {
					node.setSelected(false);
				});

				setCurrentIndex(0);
				let currentNode = allNodes[0];
				currentNode.setSelected(true);
			}
			return;
		}

		// Run Mode
		context.ready.then(async () => {
			let runArgs = await handleRunDialog();
			let runCommand = runArgs["commandStr"];
			let addArgsSparkSubmit = runArgs["addArgs"];

			if (runArgs) {
				commands.execute(commandIDs.executeToOutputPanel, { runCommand, runType, addArgsSparkSubmit });
			}
		})
	}

	const handleRunClick = async () => {
		// Only run xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		saveAndCompileAndRun(false);
	}

	const handleDebugClick = async () => {
		// Only debug xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		resetColorCodeOnStart(true);

		saveAndCompileAndRun(true);

		// let allNodes = diagramEngine.getModel().getNodes();
		// allNodes[1].getOptions().extras["imageGalleryItems"] = "xxx";
	}

	const handleLockClick = () => {
		// Only lock node if xircuits is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		let allNodes = getAllNodesFromStartToFinish();
		allNodes.forEach((node) => {
			const compulsaryNodes = node.getOptions()["name"];
			if (!node.isLocked()) {
				if (compulsaryNodes !== 'Start' && compulsaryNodes !== 'Finish') {
					node.setSelected(true);
					node.setLocked(true);
				}
			}
		});
	}

	const handleToggleBreakpoint = () => {
		// Only toggle breakpoint if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		xircuitsApp.getDiagramEngine().getModel().getNodes().forEach((item) => {
			if (item.getOptions()["selected"] == true) {
				let name = item.getOptions()["name"];

				if (name.startsWith("🔴")) {
					item.getOptions()["name"] = name.split("🔴")[1]
				}
				else {
					item.getOptions()["name"] = "🔴" + name
				}
				item.setSelected(true);
				item.setSelected(false);
			}
		});
	}

	function delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	const getContinuePost = async () => {
		await sendingRunCommand("clear");

		await sendingRunCommand("continue");

		return await sendingRunCommand("get/output");
	};

	const terminateExecution = async () => {
		return await sendingRunCommand("terminate");
	};

	async function sendingRunCommand(command: string) {
		const dataToSend = { "command": command };

		try {
			const server_reply = await requestAPI<any>('debug/enable', {
				body: JSON.stringify(dataToSend),
				method: 'POST',
			});

			return server_reply;
		} catch (reason) {
			console.error(
				`Error on POST /xircuit/debug/enable ${dataToSend}.\n${reason}`
			);
		}
	};

	async function getConfig(request: string) {
		const dataToSend = { "config_request": request };

		try {
			const server_reply = await requestAPI<any>('get/config', {
				body: JSON.stringify(dataToSend),
				method: 'POST',
			});

			return server_reply;
		} catch (reason) {
			console.error(
				`Error on POST get/config ${dataToSend}.\n${reason}`
			);
		}
	};

	const runFromNodeToNode = async () => {
		if (!debugMode) {
			alert("Not in debug mode");
			return;
		}

		let allNodes = getAllNodesFromStartToFinish();
		let prevNode: NodeModel;
		let currentNode: NodeModel;

		let count = currentIndex;
		currentNode = allNodes[count];
		prevNode = allNodes[count];

		if (currentNode.getOptions()["name"].startsWith("🔴")) {
			prevNode.setSelected(true);
			prevNode.getOptions()["color"] = "rgb(150,150,150)";
			currentNode = allNodes[count + 1];

			if (currentNode.getOptions()["name"].startsWith("🔴")) {
				if (currentNode.getOptions()["name"] != "🔴Start" && currentNode.getOptions()["name"] != "Start") {
					await sendingRunCommand("run");

					let req_run_command = await sendingRunCommand("get_run");
					let output_req = req_run_command["output"] === undefined ? '' : req_run_command["output"];
					while (output_req.split(",").length != count) {
						await delay(1500);
						req_run_command = await sendingRunCommand("get_run");
						output_req = req_run_command["output"] === undefined ? '' : req_run_command["output"];
					}

					await getContinuePost();
					await delay(1000);

					let item2 = await sendingRunCommand("get/output");
					let item = currentNode;

					currentNodeSignal.emit({
						item, item2
					});
				}
				await delay(1000);
				prevNode.setSelected(false);
				currentNode.setSelected(true);

				if (currentNode.getOptions()["name"] != "Finish" && currentNode.getOptions()["name"] != "🔴Finish") {
					count = count + 1;
					currentNode = allNodes[count];
					setCurrentIndex(count);
				}
			}
			await delay(1000);
			prevNode.setSelected(false);
		}

		while (!currentNode.getOptions()["name"].startsWith("🔴")) {
			prevNode = currentNode;
			prevNode.setSelected(true);
			prevNode.getOptions()["color"] = "rgb(150,150,150)";
			if (currentNode.getOptions()["name"] != "Start" && currentNode.getOptions()["name"] != "🔴Start") {
				await delay(1000);

				prevNode.setSelected(false);
				currentNode.setSelected(true);

				await sendingRunCommand("run");

				let req_run_command = await sendingRunCommand("get_run");
				let output_req = req_run_command["output"] === undefined ? '' : req_run_command["output"];
				while (output_req.split(",").length != count) {
					await delay(1500);
					req_run_command = await sendingRunCommand("get_run");
					output_req = req_run_command["output"] === undefined ? '' : req_run_command["output"];
				}
			}
			await delay(1000);
			prevNode.setSelected(false);

			prevNode = currentNode;
			count = count + 1;
			currentNode = allNodes[count];

			currentNode.setSelected(true);

			setInDebugMode(true);

			if (currentNode.getOptions()["name"] == "Finish" || currentNode.getOptions()["name"] == "🔴Finish") {
				prevNode.setSelected(false);
				currentNode.setSelected(true);
				currentNode.getOptions()["color"] = "rgb(150,150,150)";

				await delay(1000);

				currentNode.setSelected(false);

				alert("Finish Execution.");

				setCurrentIndex(-1);
				setDebugMode(false);
				setInDebugMode(false);

				allNodes.forEach((node) => {
					node.setSelected(true);
					node.getOptions()["color"] = node["color"];
				});
				return;
			}

			setCurrentIndex(count);

			await getContinuePost();
			await delay(1000);

			let item2 = await sendingRunCommand("get/output");
			let item = currentNode;

			currentNodeSignal.emit({
				item, item2
			});
		}

		if (currentNode.getOptions()["name"] == "Finish" || currentNode.getOptions()["name"] == "🔴Finish") {
			await delay(1000);
			prevNode.setSelected(false);
			currentNode.setSelected(true);
			currentNode.getOptions()["color"] = "rgb(150,150,150)";

			setCurrentIndex(-1);
			setDebugMode(false);
			setInDebugMode(false);

			alert("Finish Execution.");

			allNodes.forEach((node) => {
				node.setSelected(true);
				node.getOptions()["color"] = node["color"];
			});
		}
	}

	const handleToggleContinueDebug = async () => {
		// Only toggle continue if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		if (currentIndex == 0) {
			resetColorCodeOnStart(true);
		}

		await runFromNodeToNode();
	}

	const handleToggleNextNode = async () => {
		// Only toggle next node if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		if (!debugMode) {
			alert("Not in debug mode");
			return;
		}

		let allNodes = getAllNodesFromStartToFinish();
		let currentNode: NodeModel;
		let prevNode: NodeModel;
		let count = currentIndex;

		currentNode = allNodes[count];
		prevNode = allNodes[count];

		if (currentNode.getOptions()["name"] == "Start" || currentNode.getOptions()["name"] == "🔴Start") {
			currentNode.setSelected(true);
			await getContinuePost();

			currentNode.getOptions()["color"] = "rgb(150,150,150)";
			currentNode.setSelected(false);

			count += 1;
			currentNode = allNodes[count];
			currentNode.setSelected(true);
			prevNode.setSelected(false);
			setCurrentIndex(count);
			await delay(1500);
			let item2 = await sendingRunCommand("get/output");
			await delay(1000);

			let item = currentNode;
			currentNodeSignal.emit({
				item, item2
			});

		} else {
			await sendingRunCommand("run");

			let req_run_command = await sendingRunCommand("get_run");
			let output_req = req_run_command["output"] === undefined ? '' : req_run_command["output"];

			while (output_req.split(",").length != count) {
				await delay(1500);
				req_run_command = await sendingRunCommand("get_run");
				output_req = req_run_command["output"] === undefined ? '' : req_run_command["output"];
			}

			await getContinuePost();
			prevNode.setSelected(true);
			count += 1;
			currentNode = allNodes[count];

			currentNode.setSelected(true);
			prevNode.getOptions()["color"] = "rgb(150,150,150)";
			prevNode.setSelected(false);
			setCurrentIndex(count);

			await delay(1500);
			let item2 = await sendingRunCommand("get/output");
			let item = currentNode;

			currentNodeSignal.emit({
				item, item2
			});
		}

		if (currentNode.getOptions()["name"] == "Finish") {
			currentNode.getOptions()["color"] = "rgb(150,150,150)";
			currentNode.setSelected(false);
			currentNode.setSelected(true);

			setCurrentIndex(-1);
			setDebugMode(false);
			setInDebugMode(false);

			allNodes.forEach((node) => {
				node.getOptions()["color"] = "rgb(150,150,150)";
				node.setSelected(false);
				node.setSelected(true);
				node.getOptions()["color"] = node["color"];
			});

			alert("Finish Execution.");
		}
	}

	const handleToggleStepOverDebug = async () => {
		// Only toggle step over if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		if (currentIndex == 0) {
			resetColorCodeOnStart(true);
		}

		await runFromNodeToNode();
	}

	const resetColorCodeOnStart = (onStart: boolean) => {
		let allNodes = getAllNodesFromStartToFinish();
		if (onStart) {
			allNodes.forEach((node) => {
				node.setSelected(true);
				node.getOptions()["color"] = node["color"];
				node.setSelected(false);
			});

			allNodes[0].setSelected(true);
			return;
		}

		allNodes.forEach((node) => {
			node.setSelected(true);
			node.getOptions()["color"] = node["color"];
		});
	}

	const handleToggleTerminateDebug = () => {
		// Only toggle continue if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		if (!debugMode) {
			return
		}

		resetColorCodeOnStart(false);

		terminateExecution();

		setCurrentIndex(-1);
		setDebugMode(false);
		setInDebugMode(false);
		alert("Execution has been terminated.");
	}

	const handleToggleStepInDebug = () => {
		// Only toggle step in if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		alert("Step In");
	}

	const handleToggleStepOutDebug = () => {
		// Only toggle step out if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		alert("Step Out");
	}

	const handleToggleEvaluateDebug = () => {
		// Only toggle continue if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		alert("Evaluate Code");
	}

	const handleTestClick = () => {
		// Only test xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		alert("Testing");
	}

	const hideRcDialog = () => {
		setDisplayRcDialog(false);
	}

	useEffect(() => {
		// Only enable added arguments when in 'Spark Submit' mode
		if (runType == 'spark-submit') {
			setSparkSubmitkNodes("Added Arguments")
		} else {
			setSparkSubmitkNodes("")
		}

		context.ready.then(() => {
			if (initialize) {
				let allNodes = xircuitsApp.getDiagramEngine().getModel().getNodes();
				let nodesCount = allNodes.length;

				for (let i = 0; i < nodesCount; i++) {
					let nodeName = allNodes[i].getOptions()["name"];
					if (nodeName.startsWith("Hyperparameter")) {
						let regEx = /\(([^)]+)\)/;
						let result = nodeName.match(regEx);
						let nodeText = nodeName.split(": ");
						if (result[1] == 'String') {
							setStringNodes(stringNodes => ([...stringNodes, nodeText[nodeText.length - 1]].sort()));
						} else if (result[1] == 'Int') {
							setIntNodes(intNodes => ([...intNodes, nodeText[nodeText.length - 1]].sort()));
						} else if (result[1] == 'Float') {
							setFloatNodes(floatNodes => ([...floatNodes, nodeText[nodeText.length - 1]].sort()));
						} else if (result[1] == 'Boolean') {
							setBoolNodes(boolNodes => ([...boolNodes, nodeText[nodeText.length - 1]].sort()));
						}
					}
				}
			}
			else {
				setStringNodes(["experiment name"]);
				setIntNodes([]);
				setFloatNodes([]);
				setBoolNodes([]);
			}
		})
	}, [initialize, runType]);

	const handleRunDialog = async () => {
		let title = 'Run';
		const dialogOptions: Partial<Dialog.IOptions<any>> = {
			title,
			body: formDialogWidget(
				<RunDialog
					lastAddedArgsSparkSubmit={addedArgSparkSubmit}
					childSparkSubmitNodes={sparkSubmitNodes}
					childStringNodes={stringNodes}
					childBoolNodes={boolNodes}
					childIntNodes={intNodes}
					childFloatNodes={floatNodes}
				/>
			),
			buttons: [Dialog.cancelButton(), Dialog.okButton({ label: ('Start') })],
			defaultButton: 1,
			focusNodeSelector: '#name'
		};
		const dialogResult = await showFormDialog(dialogOptions);

		if (dialogResult["button"]["label"] == 'Cancel') {
			// When Cancel is clicked on the dialog, just return
			return false;
		}

		let commandStr = ' ';
		// Added arguments for spark submit
		let addArgs = dialogResult["value"][sparkSubmitNodes] ?? "";
		setAddedArgSparkSubmit(addArgs);

		stringNodes.forEach((param) => {
			if (param == 'experiment name') {
				var dt = new Date();

				let dateTime = `${dt.getFullYear().toString().padStart(4, '0')}-${(
					dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`

				xircuitLogger.info(param + ": " + dateTime);
			}
			else {
				if (dialogResult["value"][param]) {
					xircuitLogger.info(param + ": " + dialogResult["value"][param]);
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			}
		});

		if (boolNodes) {
			boolNodes.forEach((param) => {
				xircuitLogger.info(param + ": " + dialogResult["value"][param]);
				if (dialogResult["value"][param] != null) {
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			});
		}

		if (intNodes) {
			intNodes.forEach((param) => {
				xircuitLogger.info(param + ": " + dialogResult["value"][param]);
				if (dialogResult["value"][param]) {
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			});
		}

		if (floatNodes) {
			floatNodes.forEach((param) => {
				xircuitLogger.info(param + ": " + dialogResult["value"][param]);
				if (dialogResult["value"][param]) {
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			});
		}

		return { commandStr, addArgs };
	};


	const connectSignal = ([signal, handler]) => {
		useEffect(() => {
			signal.connect(handler);
			return () => {
				signal.disconnect(handler);
			}
		}, [signal, handler]);
	}

	const signalConnections = [
		[saveXircuitSignal, handleSaveClick],
		[compileXircuitSignal, handleCompileClick],
		[runXircuitSignal, handleRunClick],
		[debugXircuitSignal, handleDebugClick],
		[lockNodeSignal, handleLockClick],
		[breakpointXircuitSignal, handleToggleBreakpoint],
		[testXircuitSignal, handleTestClick],
		[continueDebugSignal, handleToggleContinueDebug],
		[nextNodeDebugSignal, handleToggleNextNode],
		[stepOverDebugSignal, handleToggleStepOverDebug],
		[terminateDebugSignal, handleToggleTerminateDebug],
		[stepInDebugSignal, handleToggleStepInDebug],
		[stepOutDebugSignal, handleToggleStepOutDebug],
		[evaluateDebugSignal, handleToggleEvaluateDebug]
	];

	signalConnections.forEach(connectSignal);

	useEffect(() => {
		fetchComponentsSignal.connect((_, args) => {
			setComponentList(args)
		});
	}, [fetchComponentsSignal])

	useEffect(() => {
		let runType;
		runTypeXircuitSignal.connect((_, args) => {
			runType = args["runType"];
			setRunType(runType)
		});
	}, [runTypeXircuitSignal])

	useEffect(() => {
		debugModeSignal.emit({
			debugMode,
			inDebugMode
		});
	}, [debugMode, inDebugMode])

	const dialogFuncMap = {
		'displayDebug': setDisplayDebug,
		'displayHyperparameter': setDisplayHyperparameter,
		'displaySavedAndCompiled': setDisplaySavedAndCompiled
	}

	const onClick = (name: string) => {
		dialogFuncMap[`${name}`](true);
	}

	const onHide = (name: string) => {
		dialogFuncMap[`${name}`](false);
		if (name == "displayHyperparameter") {
			setStringNodes(["name"]);
			setIntNodes([]);
			setFloatNodes([]);
			setBoolNodes([]);
		}
	}

	/**Component Panel & Node Action Panel Context Menu */
	const [isComponentPanelShown, setIsComponentPanelShown] = useState(false);
	const [actionPanelShown, setActionPanelShown] = useState(false);
	const [isPanelAtTop, setIsPanelAtTop] = useState<boolean>(true);
	const [isPanelAtLeft, setIsPanelAtLeft] = useState<boolean>(true);
	const [componentPanelPosition, setComponentPanelPosition] = useState({ x: 0, y: 0 });
	const [actionPanelPosition, setActionPanelPosition] = useState({ x: 0, y: 0 });
	const [nodePosition, setNodePosition] = useState({ x: 0, y: 0 });
	const [looseLinkData, setLooseLinkData] = useState<any>();
	const [isParameterLink, setIsParameterLink] = useState<boolean>(false);

	// Component & Action panel position
	const panelPosition = (event) => {
		let newPanelPosition = {
			x: event.pageX,
			y: event.pageY,
		};
		let newActionPanelPosition = {
			x: event.pageX,
			y: event.pageY,
		};
		const canvas = event.view as any;
		const newCenterPosition = {
			x: canvas.innerWidth / 2,
			y: canvas.innerHeight / 2,
		}
		if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
			// Bottom right
			setIsPanelAtTop(false);
			setIsPanelAtLeft(false);
			newPanelPosition.y = canvas.innerHeight - newPanelPosition.y;
			newPanelPosition.x = canvas.innerWidth - newPanelPosition.x;
		} else if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y < newCenterPosition.y) {
			// Top right
			setIsPanelAtTop(true);
			setIsPanelAtLeft(false);
			newPanelPosition.x = canvas.innerWidth - newPanelPosition.x;
		} else if (newPanelPosition.x < newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
			// Bottom left
			setIsPanelAtTop(false);
			setIsPanelAtLeft(true);
			newPanelPosition.y = canvas.innerHeight - newPanelPosition.y;
		} else {
			// Top left
			setIsPanelAtTop(true);
			setIsPanelAtLeft(true);
		}
		setComponentPanelPosition(newPanelPosition);
		setActionPanelPosition(newPanelPosition);
	}

	// Show the component panel context menu
	const showComponentPanel = (event: React.MouseEvent<HTMLDivElement>) => {
		setActionPanelShown(false);
		setIsComponentPanelShown(false);

		const node_position = xircuitsApp.getDiagramEngine().getRelativeMousePoint(event);
		setNodePosition(node_position);
		panelPosition(event);
		setIsComponentPanelShown(true);
	};

	// Show the component panel from dropped link
	const showComponentPanelFromLink = (event) => {
		setActionPanelShown(false);
		setIsComponentPanelShown(false);
		const linkName = event.link.sourcePort.options.name;

		if (linkName.startsWith("parameter")) {
			setIsParameterLink(true)
			// Don't show panel when loose link from parameter outPort
			if (linkName.includes("parameter-out")) {
				return
			}
		}

		const newNodePosition = {
			x: event.link.points[1].position.x,
			y: event.link.points[1].position.y,
		};

		setLooseLinkData(event.link);
		setNodePosition(newNodePosition);
		panelPosition(event.linkEvent);
		setIsComponentPanelShown(true);
	};

	// Hide component and node action panel
	const hidePanel = () => {
		setIsComponentPanelShown(false);
		setActionPanelShown(false);
		setLooseLinkData(null);
		setIsParameterLink(false);
	};

	// Show the nodeActionPanel context menu
	const showNodeActionPanel = (event: React.MouseEvent<HTMLDivElement>) => {
		// Disable the default context menu
		event.preventDefault();

		setActionPanelShown(false);
		setIsComponentPanelShown(false);

		const node_position = xircuitsApp.getDiagramEngine().getRelativeMousePoint(event);
		setNodePosition(node_position);
		panelPosition(event)
		setActionPanelShown(true);
	};

	return (
		<Body>
			{/* <Header>
				<RcDialog
					visible={displayRcDialog}
					animation="slide-fade"
					maskAnimation="fade"
					onClose={hideRcDialog}
					style={{ width: 600 }}
					title={(
						<div
							style={{
								width: '100%',
								cursor: 'pointer',
							}}
							onMouseOver={() => {
								if (disableRcDialog){
									setDisableRcDialog(false)
								}
							}}
							onMouseOut={() => {
								setDisableRcDialog(true)
							}}
							onFocus={ () => {} }
							onBlur={ () => {}}
							// end
						>Image Viewer</div>
					)}
					modalRender={modal => <Draggable disabled={disableRcDialog}>{modal}</Draggable>}>
				</RcDialog>
			</Header> */}
			<Content>
				<Layer
					onDrop={(event) => {
						var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));

						let component_task = componentList.map(x => x["task"]);
						let drop_node = component_task.indexOf(data.name);
						let current_node: any;
						let node = null;

						if (drop_node != -1) {
							current_node = componentList[drop_node];
						}

						if (current_node != undefined) {
							if (current_node.header == "GENERAL") {
								node = GeneralComponentLibrary({ model: current_node });
							} else if (current_node.header == "ADVANCED") {
								node = AdvancedComponentLibrary({ model: current_node });
							}
						}

						// note:  can not use the same port name in the same node,or the same name port can not link to other ports
						// you can use shift + click and then use delete to delete link
						if (node != null) {
							let point = xircuitsApp.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							xircuitsApp.getDiagramEngine().getModel().addNode(node);
							if (node["name"].startsWith("Hyperparameter")) {
								setInitialize(true);
							}
							setSaved(false);
							setCompiled(false);
							forceUpdate();
						}
					}}

					onDragOver={(event) => {
						event.preventDefault();
					}}

					onMouseOver={(event) => {
						event.preventDefault();
					}}

					onMouseUp={(event) => {
						event.preventDefault();
					}}

					onMouseDown={(event) => {
						event.preventDefault();
					}}
					onContextMenu={showNodeActionPanel}
					onClick={(event) => {
						hidePanel();
						if (event.ctrlKey || event.metaKey) {
							showComponentPanel(event);
						}
					}}>
					<DemoCanvasWidget>
						<CanvasWidget engine={xircuitsApp.getDiagramEngine()} />
					</DemoCanvasWidget>
				</Layer>
				{/**Add Component Panel(right-click)*/}
				{isComponentPanelShown && (
					<div
						style={{ 
							top: isPanelAtTop ? componentPanelPosition.y : null, 
							bottom: !isPanelAtTop? componentPanelPosition.y : null, 
							right: !isPanelAtLeft? componentPanelPosition.x : null, 
							left: isPanelAtLeft? componentPanelPosition.x : null 
						}}
						className="add-component-panel">
						<ComponentsPanel
							lab={app}
							eng={xircuitsApp.getDiagramEngine()}
							nodePosition={nodePosition}
							linkData={looseLinkData}
							isParameter={isParameterLink}
							key="component-panel"
						></ComponentsPanel>
					</div>
				)}
				{/**Node Action Panel(ctrl + left-click)*/}
				{actionPanelShown && (
					<div
						style={{ 
							top: isPanelAtTop? actionPanelPosition.y : null,
							bottom: !isPanelAtTop? actionPanelPosition.y : null, 
							right: !isPanelAtLeft? actionPanelPosition.x : null,  
							left: isPanelAtLeft? actionPanelPosition.x : null 
						}}
						className="node-action-context-menu">
						<NodeActionsPanel
							app={app}
							eng={xircuitsApp.getDiagramEngine()}
							nodePosition={nodePosition}
						></NodeActionsPanel>
					</div>
				)}
			</Content>
		</Body>
	);
}
