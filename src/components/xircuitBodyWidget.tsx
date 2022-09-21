import React, { FC, useState, useCallback, useEffect, useRef } from 'react';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from '../helpers/DemoCanvasWidget';
import { LinkModel } from '@projectstorm/react-diagrams';
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
import { cancelDialog, GeneralComponentLibrary } from '../tray_library/GeneralComponentLib';
import { NodeActionsPanel } from '../context-menu/NodeActionsPanel';
import { AdvancedComponentLibrary, fetchNodeByName } from '../tray_library/AdvanceComponentLib';
import { inputDialog, getItsLiteralType } from '../dialog/LiteralInputDialog';

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
	const [runConfigs, setRunConfigs] = useState<any>("");
	const [lastConfig, setLastConfigs] = useState<any>("");
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
	const [runTypesCfg, setRunTypesCfg] = useState<string>("");
	const initialRender = useRef(true);
	const xircuitLogger = new Log(app);
	const contextRef = useRef(context);
	const notInitialRender = useRef(false);
	const needAppend = useRef("");

	const onChange = useCallback(
		(): void => {
			if (contextRef.current.isReady) {
				let currentModel = xircuitsApp.getDiagramEngine().getModel().serialize();
				contextRef.current.model.fromString(
					JSON.stringify(currentModel, replacer, 4)
				);
				setSaved(false);
			}
		}, []);

	function replacer(key, value) {
		if (key == "x" || key == "y") return Math.round((value + Number.EPSILON) * 1000) / 1000;
		return value;
	}

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
					let deserializedModel = xircuitsApp.customDeserializeModel(model, initialRender.current);
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
									app.commands.execute(commandIDs.connectLinkToObviousPorts, { draggedLink: sourceLink });
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
					initialRender.current = false;
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

	const getAllNodesFromStartToFinish = (): NodeModel[] | null => {
		let model = xircuitsApp.getDiagramEngine().getModel();
		let nodeModels = model.getNodes();
		let startNodeModel = getNodeModelByName(nodeModels, 'Start');
		if (startNodeModel == null) {
			startNodeModel = getNodeModelByName(nodeModels, '🔴Start');
		}

		if (startNodeModel) {
			let sourceNodeModelId = startNodeModel.getID();
			let retNodeModels: NodeModel[] = [];
			retNodeModels.push(startNodeModel);

			while (getTargetNodeModelId(model.getLinks(), sourceNodeModelId) != null) {
				let getTargetNode = getTargetNodeModelId(model.getLinks(), sourceNodeModelId)

				if (getTargetNode) {
					let nodeModel = getNodeModelById(nodeModels, getTargetNode);

					if (nodeModel) {
						sourceNodeModelId = nodeModel.getID();
						retNodeModels.push(nodeModel)
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

		for (let i = 0; i < allNodes.length; i++) {

			let nodeType = allNodes[i]["extras"]["type"];

			if (nodeType == 'Start' ||
				nodeType == 'Finish' ||
				nodeType === 'boolean' ||
				nodeType === 'int' ||
				nodeType === 'float' ||
				nodeType === 'string') {
			} else {
				let bindingName = 'c_' + i;
				let componentName = allNodes[i]["name"];
				componentName = componentName.replace(/\s+/g, "");
				pythonCode += '    ' + bindingName + ' = ' + componentName + '()\n';
			}

		}

		pythonCode += '\n';

		if (startNodeModel) {
			let sourceNodeModelId = startNodeModel.getID();
			let j = 0;

			while (getTargetNodeModelId(model.getLinks(), sourceNodeModelId) != null) {
				let targetNodeId = getTargetNodeModelId(model.getLinks(), sourceNodeModelId)

				if (targetNodeId) {

					let bindingName = 'c_' + ++j;
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
													sourcePortLabelStructure = '"""' + sourcePortLabel + '"""';
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
						} else {
						}

					}

					if (currentNodeModel) {
						sourceNodeModelId = currentNodeModel.getID();
					}
				}

			}
		}

		pythonCode += '\n';

		for (let i = 0; i < allNodes.length; i++) {

			let nodeType = allNodes[i]["extras"]["type"];
			let bindingName = 'c_' + i;
			let nextBindingName = 'c_' + (i + 1);

			if (nodeType == 'Start' || nodeType == 'Finish') {
			} else if (i == (allNodes.length - 2)) {
				pythonCode += '    ' + bindingName + '.next = ' + 'None\n';
			} else {
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
					pythonCode += '    ' + "parser.add_argument('--" + boolParam + "', default=True, type=bool)\n";
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

	const showErrorDialog = (title: string, errorMsg: string) => {
		showDialog({
			title,
			body: (
				<pre>{errorMsg}</pre>
			),
			buttons: [Dialog.warnButton({ label: 'OK' })]
		});
	}

	const checkAllNodesConnected = (): boolean | null => {
		let nodeModels = xircuitsApp.getDiagramEngine().getModel().getNodes();

		for (let i = 0; i < nodeModels.length; i++) {
			let inPorts = nodeModels[i]["portsIn"];
			let j = 0;
			if (inPorts != 0) {
				if (inPorts[j].getOptions()["label"] == '▶' && Object.keys(inPorts[0].getLinks()).length != 0) {
					continue
				} else {
					nodeModels[i].getOptions().extras["borderColor"] = "red";
					nodeModels[i].getOptions().extras["tip"] = "Please make sure this node ▶ is properly connected ";
					nodeModels[i].setSelected(true);
					return false;
				}
			}
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

		let allNodesConnected = checkAllNodesConnected();

		if (!saved) {
			alert("Please save before compiling.");
			return;
		}

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
			let config = runArgs["config"];

			if (runArgs) {
				commands.execute(commandIDs.executeToOutputPanel, { runCommand, runType, config });
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

	async function getRunTypesFromConfig(request: string) {
		const dataToSend = { "config_request": request };
	
		try {
			const server_reply = await requestAPI<any>('config/run', {
				body: JSON.stringify(dataToSend),
				method: 'POST',
			});
	
			return server_reply;
		} catch (reason) {
			console.error(
				`Error on POST config/run ${dataToSend}.\n${reason}`
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

	const getRunTypeFromConfig = async () => {
		const configuration = await getRunTypesFromConfig("RUN_TYPES");
		const error_msg = configuration["err_msg"];
		if (error_msg) {
			showDialog({
				title: 'Failed parsing data from config.ini',
				body: (
					<pre>{error_msg}</pre>
				),
				buttons: [Dialog.warnButton({ label: 'OK' })]
			});
		}
		setRunTypesCfg(configuration["run_types"])
		setRunConfigs(configuration["run_types_config"]);
	}

	const hideRcDialog = () => {
		setDisplayRcDialog(false);
	}

	useEffect(() => {
		// Get run configuration when in 'Remote Run' mode only
		if (runType == 'remote-run') {
			getRunTypeFromConfig();
		} else {
			setRunConfigs("")
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
					runTypes={runTypesCfg}
					runConfigs={runConfigs}
					lastConfig={lastConfig}
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
		// Remember the last config chose and set the chosen config to output
		let config;
		let runType = dialogResult["value"]['runType'] ?? "";
		let runConfig = dialogResult["value"]['runConfig'] ?? "";
		if (runConfigs.length != 0) {
			runConfigs.map(cfg => {
				if (cfg.run_type == runType && cfg.run_config_name == runConfig) {
					config = cfg;
					setLastConfigs(cfg);
				}
			})
		}

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
				if (dialogResult["value"][param]) {
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
		return { commandStr, config };
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

	const connectLinkToItsLiteral = async (linkName, event) => {
		let portType = linkName.split("-")[1];
		let nodeType: string = portType;
		let varInput: string = '';
		let errorMsg: string;
		switch (portType) {
			case 'int':
				nodeType = 'Integer';
				break;
			case 'boolean':
				let boolTitle = 'Enter boolean value: ';
				const dialogOptions = inputDialog(boolTitle, "", 'Boolean');
				const dialogResult = await showFormDialog(dialogOptions);
				if (cancelDialog(dialogResult)) return;
				let boolValue = dialogResult["value"][boolTitle];
				if (boolValue == false) {
					nodeType = 'False'
				} else {
					nodeType = 'True'
				}
				break;
			case 'any':
				// When inPort is 'any' type, get the correct literal type based on the first character inputed
				let portAnyType = await getItsLiteralType();
				if (portAnyType == undefined) return;
				nodeType = portAnyType.nodeType;
				varInput = portAnyType.varInput;
				errorMsg = portAnyType.errorMsg;
				break;
			default:
				nodeType = portType.charAt(0).toUpperCase() + portType.slice(1);
				break;
		}
		if (errorMsg != undefined) {
			if (nodeType == ('Float' || 'Integer')) {
				showErrorDialog('Error : Input have non-numeric values', errorMsg);
			} else {
				showErrorDialog('Error : Type undefined', errorMsg);
			}
			return;
		}
		let current_node = await fetchNodeByName('Literal ' + nodeType);
		let node = await GeneralComponentLibrary({ model: current_node, variableValue: varInput });
		if (node == undefined) return;
		let nodePosition = event.linkEvent;
		let sourceLink = { link: event.link, sourcePort: event.sourcePort };
		app.commands.execute(commandIDs.addNodeGivenPosition, { node, nodePosition });
		app.commands.execute(commandIDs.connectNodeByLink, { targetNode: node, sourceLink, isParameterLink: true });
	}

	/**Component Panel & Node Action Panel Context Menu */
	const [isComponentPanelShown, setIsComponentPanelShown] = useState(false);
	const [actionPanelShown, setActionPanelShown] = useState(false);
	const [dontHidePanel, setDontHidePanel] = useState(false);
	const [isPanelAtLeft, setIsPanelAtLeft] = useState<boolean>(true);
	const [componentPanelPosition, setComponentPanelPosition] = useState({ x: 0, y: 0 });
	const [actionPanelPosition, setActionPanelPosition] = useState({ x: 0, y: 0 });
	const [nodePosition, setNodePosition] = useState<any>();
	const [looseLinkData, setLooseLinkData] = useState<any>({});
	const [isParameterLink, setIsParameterLink] = useState<boolean>(false);

	// Component & Action panel position
	const panelPosition = (event) => {
		let newPanelPosition = {
			x: event.pageX,
			y: event.pageY,
		};
		const canvas = event.view as any;
		const newCenterPosition = {
			x: canvas.innerWidth / 2,
			y: canvas.innerHeight / 2,
		}
		const menuDimension = {
			x: 95,
			y: 290
		}
		const fileBrowserWidth = document.getElementsByClassName("p-SplitPanel-child")[1].clientWidth;
		const tabWidth = document.getElementsByClassName("lm-TabBar")[0].clientWidth;
		if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
			// Bottom right
			setIsPanelAtLeft(false);
			newPanelPosition.x = canvas.innerWidth - newPanelPosition.x - tabWidth;
			newPanelPosition.y = newPanelPosition.y - menuDimension.y - 84;
		} else if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y < newCenterPosition.y) {
			// Top right
			setIsPanelAtLeft(false);
			newPanelPosition.x = canvas.innerWidth - newPanelPosition.x - tabWidth;
			newPanelPosition.y = newPanelPosition.y - 84;
		} else if (newPanelPosition.x < newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
			// Bottom left
			setIsPanelAtLeft(true);
			newPanelPosition.x = newPanelPosition.x - fileBrowserWidth - tabWidth;
			newPanelPosition.y = newPanelPosition.y - menuDimension.y - 84;
		} else {
			// Top left
			setIsPanelAtLeft(true);
			newPanelPosition.x = newPanelPosition.x - fileBrowserWidth - tabWidth;
			newPanelPosition.y = newPanelPosition.y - 84;
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
	const showComponentPanelFromLink = async (event) => {
		setActionPanelShown(false);
		setIsComponentPanelShown(false);
		const linkName:string = event.link.sourcePort.options.name;

		if (linkName.startsWith("parameter")) {
			// Don't show panel when loose link from parameter outPorts
			if (linkName.includes("parameter-out")) {
				return
			}
			// When loose link from type InPort, connect to its respective literal node
			connectLinkToItsLiteral(linkName, event);
			return;
		}

		setLooseLinkData({link: event.link, sourcePort: event.sourcePort});
		setNodePosition(event.linkEvent);
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
					onDrop={async (event) => {
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
								node = await GeneralComponentLibrary({ model: current_node });
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
						if (event.ctrlKey || event.metaKey) {
							showComponentPanel(event);
							return;
						}
						if(dontHidePanel){
							return;
						}
						hidePanel();
					}}>
					<DemoCanvasWidget>
						<CanvasWidget engine={xircuitsApp.getDiagramEngine()} />
						{/**Add Component Panel(ctrl + left-click, dropped link)*/}
						{isComponentPanelShown && (
							<div
								onMouseEnter={()=>setDontHidePanel(true)}
								onMouseLeave={()=>setDontHidePanel(false)}
								id='component-panel'
								style={{
									top: componentPanelPosition.y,
									right: !isPanelAtLeft ? componentPanelPosition.x : null,
									left: isPanelAtLeft ? componentPanelPosition.x : null
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
						{/**Node Action Panel(left-click)*/}
						{actionPanelShown && (
							<div
								id='context-menu'
								style={{
									top: actionPanelPosition.y,
									right: !isPanelAtLeft ? actionPanelPosition.x : null,
									left: isPanelAtLeft ? actionPanelPosition.x : null
								}}
								className="node-action-context-menu">
								<NodeActionsPanel
									app={app}
									eng={xircuitsApp.getDiagramEngine()}
									nodePosition={nodePosition}
								></NodeActionsPanel>
							</div>
						)}
					</DemoCanvasWidget>
				</Layer>
			</Content>
		</Body>
	);
}
