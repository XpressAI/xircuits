import React, { FC, useState, useCallback, useEffect } from 'react';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from '../helpers/DemoCanvasWidget';
import { LinkModel, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { NodeModel } from "@projectstorm/react-diagrams-core/src/entities/node/NodeModel";
import * as SRD from '@projectstorm/react-diagrams';
import axios, { AxiosResponse } from 'axios';
import { Dialog } from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import {
	DocumentRegistry,
	ABCWidgetFactory,
	DocumentWidget,
	Context
} from '@jupyterlab/docregistry';

import styled from '@emotion/styled';

import { CustomNodeModel } from "./CustomNodeModel";
import { XPipePanel } from '../xpipeWidget';
import { Log } from '../log/LogPlugin';
import { ServiceManager } from '@jupyterlab/services';
import ComponentList from '../components_xpipe/Component';
import { formDialogWidget } from '../dialog/formDialogwidget';
import { showFormDialog } from '../dialog/FormDialog';
import { RunDialog } from '../dialog/RunDialog';
import 'rc-dialog/assets/bootstrap.css';
import Draggable from 'react-draggable';
import RcDialog from 'rc-dialog';
import { requestAPI } from '../server/handler';

export interface BodyWidgetProps {
	context: any;
	browserFactory: IFileBrowserFactory;
	app: JupyterFrontEnd;
	shell: ILabShell;
	commands: any;
	widgetId?: string;
	activeModel: SRD.DiagramModel;
	diagramEngine: SRD.DiagramEngine;
	serviceManager: ServiceManager;
	postConstructorFlag: boolean;
	saveXpipeSignal: Signal<XPipePanel, any>;
	reloadXpipeSignal: Signal<XPipePanel, any>;
	revertXpipeSignal: Signal<XPipePanel, any>;
	compileXpipeSignal: Signal<XPipePanel, any>;
	runXpipeSignal: Signal<XPipePanel, any>;
	debugXpipeSignal: Signal<XPipePanel, any>;
	breakpointXpipeSignal: Signal<XPipePanel, any>;
	currentNodeSignal: Signal<XPipePanel, any>;
	testXpipeSignal: Signal<XPipePanel, any>;
	continueDebugSignal: Signal<XPipePanel, any>;
	nextNodeDebugSignal: Signal<XPipePanel, any>;
	stepOverDebugSignal: Signal<XPipePanel, any>;
	terminateDebugSignal: Signal<XPipePanel, any>;
	stepInDebugSignal: Signal<XPipePanel, any>;
	stepOutDebugSignal: Signal<XPipePanel, any>;
	evaluateDebugSignal: Signal<XPipePanel, any>;
	customDeserializeModel;
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
	openXpipeEditor: 'Xpipe-editor:open',
	openDocManager: 'docmanager:open',
	newDocManager: 'docmanager:new-untitled',
	saveDocManager: 'docmanager:save',
	reloadDocManager: 'docmanager:reload',
	revertDocManager: 'docmanager:restore-checkpoint',
	createNewXpipe: 'Xpipe-editor:create-new',
	saveXpipe: 'Xpipe-editor:save-node',
	reloadXpipe: 'Xpipe-editor:reload-node',
	revertXpipe: 'Xpipe-editor:revert-node',
	compileXpipe: 'Xpipe-editor:compile-node',
	runXpipe: 'Xpipe-editor:run-node',
	debugXpipe: 'Xpipe-editor:debug-node',
	createArbitraryFile: 'Xpipe-editor:create-arbitrary-file',
	openDebugger: 'Xpipe-debugger:open',
	breakpointXpipe: 'Xpipe-editor:breakpoint-node',
	nextNode: 'Xpipe-editor:next-node',
	testXpipe: 'Xpipe-editor:test-node',
	outputMsg: 'Xpipe-log:logOutputMessage',
	executeToOutputPanel: 'Xpipe-output-panel:execute'
};


//create your forceUpdate hook
function useForceUpdate() {
	const [value, setValue] = useState(0); // integer state
	return () => setValue(value => value + 1); // update the state to force render
}


export const BodyWidget: FC<BodyWidgetProps> = ({
	context,
	browserFactory,
	app,
	shell,
	commands,
	widgetId,
	activeModel,
	diagramEngine,
	serviceManager,
	postConstructorFlag,
	saveXpipeSignal,
	reloadXpipeSignal,
	revertXpipeSignal,
	compileXpipeSignal,
	runXpipeSignal,
	debugXpipeSignal,
	breakpointXpipeSignal,
	currentNodeSignal,
	testXpipeSignal,
	continueDebugSignal,
	nextNodeDebugSignal,
	stepOverDebugSignal,
	terminateDebugSignal,
	stepInDebugSignal,
	stepOutDebugSignal,
	evaluateDebugSignal,
	customDeserializeModel
}) => {

	const [prevState, updateState] = useState(0);
	const forceUpdate = useCallback(() => updateState(prevState => prevState + 1), []);
	const [saved, setSaved] = useState(false);
	const [compiled, setCompiled] = useState(false);
	const [initialize, setInitialize] = useState(false);
	const [nodesColor, setNodesColor] = useState([]);
	const [displaySavedAndCompiled, setDisplaySavedAndCompiled] = useState(false);
	const [displayDebug, setDisplayDebug] = useState(false);
	const [displayHyperparameter, setDisplayHyperparameter] = useState(false);
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
	const [debugMode, setDebugMode] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(-1);
	const xpipeLogger = new Log(app);

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
		let model = diagramEngine.getModel();
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

	const getPythonCompiler = (): string => {
		let component_task = componentList.map(x => x["task"]);
		let model = diagramEngine.getModel();
		let nodeModels = model.getNodes();
		let startNodeModel = getNodeModelByName(nodeModels, 'Start');
		let pythonCode = 'from argparse import ArgumentParser\n';
		pythonCode += 'from datetime import datetime\n';
		pythonCode += 'from time import sleep\n';
		pythonCode += 'from flask import Flask, request\n';
		pythonCode += 'from threading import Thread\n';

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

		for (let componentName in uniqueComponents) {
			let component_exist = component_task.indexOf(componentName);
			let current_node: any;
			let package_name: string = "components";

			if (component_exist != -1) {
				current_node = componentList[component_exist];
				if (current_node["path"] != "") {
					if (current_node["path"].indexOf("/") != -1) {
						package_name = current_node["path"].substring(0, current_node["path"].length - 3).replace("/", ".");
					} else {
						package_name = "." + current_node["path"].substring(0, current_node["path"].length - 3);
					}
				}
			}
			pythonCode += "from " + package_name + " import " + componentName + "\n";
		}

		pythonCode += "\napp = Flask(__name__)\n";
		pythonCode += "input_data = []\n";
		pythonCode += "continue_input_data = []\n";
		pythonCode += "inarg_output_data = []\n";
		pythonCode += "outarg_output_data = []\n";

		pythonCode += "\ndef main(args):\n";

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
					for (let port in allPort) {

						let portIn = allPort[port].getOptions().alignment == 'left';

						if (portIn) {
							let label = allPort[port].getOptions()["label"];
							label = label.replace(/\s+/g, "_");
							label = label.toLowerCase();

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

									if (port.startsWith("parameter")) {

										if (sourceNodeName.startsWith("Literal")) {

											if (sourceNodeType == 'string') {
												pythonCode += '    ' + bindingName + '.' + label + '.value = ' + "'" + sourcePortLabel + "'\n";
											}

											else if (sourceNodeType == 'list') {
												pythonCode += '    ' + bindingName + '.' + label + '.value = ' + "[" + sourcePortLabel + "]" + "\n";
											}

											else if (sourceNodeType == 'tuple') {
												pythonCode += '    ' + bindingName + '.' + label + '.value = ' + "(" + sourcePortLabel + ")" + "\n";
											}

											else if (sourceNodeType == 'dict') {
												pythonCode += '    ' + bindingName + '.' + label + '.value = ' + "{" + sourcePortLabel + "}" + "\n";
											}

											else {
												pythonCode += '    ' + bindingName + '.' + label + '.value = ' + sourcePortLabel + "\n";
											}

										} else {
											sourcePortLabel = sourcePortLabel.replace(/\s+/g, "_");
											sourcePortLabel = sourcePortLabel.toLowerCase();
											sourceNodeName = sourceNodeName.split(": ");
											let paramName = sourceNodeName[sourceNodeName.length - 1];
											paramName = paramName.replace(/\s+/g, "_");
											paramName = paramName.toLowerCase();
											pythonCode += '    ' + bindingName + '.' + label + '.value = args.' + paramName + '\n';
										}

									} else {
										pythonCode += '    ' + bindingName + '.' + label + ' = ' + preBindingName + '.' + sourcePortLabel + '\n';
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

		pythonCode += '    ' + 'debug_mode = args.debug_mode\n';

		if (allNodes.length > 2) {
			pythonCode += '\n';
			pythonCode += '    ' + 'next_component = c_1\n';
			pythonCode += '    ' + 'while next_component:\n';

			pythonCode += '        ' + 'if debug_mode:\n';
			pythonCode += '            ' + '# http://127.0.0.1:5000/continue?source=continue\n';
			pythonCode += '            ' + 'if len(continue_input_data) > 0 and continue_input_data[-1] == \'continue\':\n';
			pythonCode += '                ' + 'vars_dict = vars(next_component)\n';
			pythonCode += '                ' + 'new_dict = {}\n';
			pythonCode += '                ' + 'for i in vars_dict:\n';
			pythonCode += '                    ' + 'if not i in [\'next\']:\n';
			pythonCode += '                        ' + 'new_dict[i] = next_component.__getattribute__(i).value\n';
			pythonCode += '                        ' + 'print(next_component.__getattribute__(i).value)\n';
			pythonCode += '                        ' + 'if \'InArg\' in str(vars_dict[i]):\n';
			pythonCode += '                            ' + 'inarg_output_data.append(str(i) + \': \' + str(next_component.__getattribute__(i).value))\n';
			pythonCode += '                        ' + 'if \'OutArg\' in str(vars_dict[i]):\n';
			pythonCode += '                            ' + 'outarg_output_data.append(str(i) + \': \' + str(next_component.__getattribute__(i).value))\n';
			pythonCode += '                ' + 'continue_input_data.clear()\n';
			pythonCode += '\n';

			pythonCode += '            ' + '# http://127.0.0.1:5000/run?source=run\n';
			pythonCode += '            ' + 'if len(input_data) > 0 and input_data[-1] == \'run\':\n';
			pythonCode += '                ' + 'next_component = next_component.do()\n';
			pythonCode += '                ' + 'input_data.clear()\n';
			pythonCode += '\n';

			pythonCode += '            ' + '# http://127.0.0.1:5000/run?source=skip\n';
			pythonCode += '            ' + 'if len(input_data) > 0 and input_data[-1] == \'skip\':\n';
			pythonCode += '                ' + 'next_component = next_component.do()\n';
			pythonCode += '\n';

			pythonCode += '        ' + 'else:\n';
			pythonCode += '            ' + 'next_component = next_component.do()\n';
			pythonCode += '\n';

			pythonCode += 'def shutdown_server():\n';
			pythonCode += '    ' + 'func = request.environ.get(\'werkzeug.server.shutdown\')\n';
			pythonCode += '    ' + 'if func is None:\n';
			pythonCode += '        ' + 'raise RuntimeError(\'Not running with the Werkzeug Server\')\n';
			pythonCode += '    ' + 'func()\n\n';

			pythonCode += '@app.route(\'/stop\')\n';
			pythonCode += 'def shutdown():\n';
			pythonCode += '    ' + 'shutdown_server()\n';
			pythonCode += '    ' + 'return \'Server shutting down...\'\n\n';

			pythonCode += '@app.route(\'/run\')\n';
			pythonCode += 'def hello_world(input_data=input_data):\n';
			pythonCode += '    ' + 'source = request.args.get(\'source\')\n';
			pythonCode += '    ' + 'input_data.append(source)\n';
			pythonCode += '    ' + 'return \'run is executed\'\n\n';

			pythonCode += '@app.route(\'/continue\')\n';
			pythonCode += 'def continue_flask(continue_input_data=continue_input_data):\n';
			pythonCode += '    ' + 'source = request.args.get(\'source\')\n';
			pythonCode += '    ' + 'continue_input_data.append(source)\n';
			pythonCode += '    ' + 'return \'continue is executed\'\n\n';

			pythonCode += '@app.route(\'/clear\')\n';
			pythonCode += 'def clear_flask():\n';
			pythonCode += '    ' + 'inarg_output_data.clear()\n';
			pythonCode += '    ' + 'outarg_output_data.clear()\n';
			pythonCode += '    ' + 'return \'clear flask is executed\'\n\n';

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
			pythonCode += '    ' + "parser.add_argument('--debug_mode', default=False, type=bool)\n\n";
			pythonCode += '    ' + "debug_mode = parser.parse_args().debug_mode\n";
			pythonCode += '    ' + "if debug_mode:\n";
			pythonCode += '        ' + 'thread = Thread(target=app.run, daemon=True)\n';
			pythonCode += '        ' + 'thread.start()\n\n';

			pythonCode += '    ' + 'main(parser.parse_args())';
		}

		return pythonCode;
	}

	const checkAllNodesConnected = (): boolean | null => {
		let nodeModels = diagramEngine.getModel().getNodes();

		for (let i = 0; i < nodeModels.length; i++) {
			let inPorts = nodeModels[i]["portsIn"];
			let j = 0;
			if (inPorts != 0) {
				if (inPorts[j].getOptions()["label"] == '▶' && Object.keys(inPorts[0].getLinks()).length != 0) {
					continue
				} else {
					return false;
				}
			}
		}
		return true;
	}

	const handleSaveClick = () => {
		// Only save xpipe if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		setInitialize(true);
		setSaved(true);
		let currentModel = diagramEngine.getModel().serialize();
		context.model.setSerializedModel(currentModel);
		commands.execute(commandIDs.saveDocManager);
	}

	const handleReloadClick = () => {
		// Only reload xpipe if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		commands.execute(commandIDs.reloadDocManager);
		let model = context.model.getSharedObject();
		if (model.id == '') {
			console.log("No context available! Please save xpipe first.")
		}
		else {
			let deserializedModel = customDeserializeModel(model, diagramEngine);
			diagramEngine.setModel(deserializedModel);
		}
		forceUpdate();
	}

	const handleRevertClick = () => {
		// Only revert xpipe if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		commands.execute(commandIDs.revertDocManager);
		//todo: check behavior if user presses "cancel"
		let model = context.model.getSharedObject();

		if (model.id == '') {
			console.log("No context available! Please save xpipe first.")
		}
		else {
			let deserializedModel = customDeserializeModel(model, diagramEngine);
			diagramEngine.setModel(deserializedModel);
		}
		forceUpdate();
	}

	const handleCompileClick = () => {
		// Only compile xpipe if it is currently in focus
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

	const saveAndCompile = () => {
		// save
		setInitialize(true);
		setSaved(true);
		let currentModel = diagramEngine.getModel().serialize();
		context.model.setSerializedModel(currentModel);
		commands.execute(commandIDs.saveDocManager);

		// compile
		let allNodesConnected = checkAllNodesConnected();
		
		if (!allNodesConnected) {
			alert("Please connect all the nodes before debugging.");
			return;
		}

		let pythonCode = getPythonCompiler();
		let showOutput = false;
		setCompiled(true);
		commands.execute(commandIDs.createArbitraryFile, { pythonCode, showOutput });
	}

	const handleRunClick = async () => {
		// Only run xpipe if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		saveAndCompile();

		const runCommand = await handleRunDialog();

		if (runCommand) {
			commands.execute(commandIDs.executeToOutputPanel, { runCommand });
		}
	}

	const handleDebugClick = async () => {
		// Only debug xpipe if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		resetColorCodeOnStart(true);

		saveAndCompile();

		// let allNodes = diagramEngine.getModel().getNodes();
		// allNodes[1].getOptions().extras["imageGalleryItems"] = "xxx";

		const runCommand = await handleRunDialog();
		const debug_mode = "--debug_mode True";
		if (runCommand) {
			commands.execute(commandIDs.executeToOutputPanel, { runCommand, debug_mode });
			commands.execute(commandIDs.openDebugger);
			setDebugMode(true);
			let allNodes = getAllNodesFromStartToFinish();
			allNodes.forEach((node) => {
				node.setSelected(false);
			});

			setCurrentIndex(0);
			let currentNode = allNodes[0];
			currentNode.setSelected(true);
		}

		// if (saved && compiled) {

		// 	let allNodes = getAllNodesFromStartToFinish();
		// 	let isNodeSelected = false;

		// 	for (let i = 0; i < allNodes.length; i++) {

		// 		if (allNodes[i].getOptions()["name"].startsWith("🔴")) {
		// 			allNodes[i].setSelected(true);
		// 			isNodeSelected = true;
		// 			break;
		// 		} else {
		// 			allNodes[i].setSelected(false);
		// 		}
		// 	}

		// 	if (!isNodeSelected) {
		// 		let startNodeModel = getNodeModelByName(allNodes, 'Start');
		// 		startNodeModel.setSelected(true);
		// 	}
		// 	alert("Debug xpipe");
		// 	commands.execute(commandIDs.openDebugger);
		// } else {
		// 	alert("Please save and compile before debugging.")
		// }

		// if (compiled && saved) {
		// 	onClick('displayDebug');
		// }
		// else {
		// 	onClick('displaySavedAndCompiled');
		// }
	}

	const handleToggleBreakpoint = () => {
		// Only toggle breakpoint if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		diagramEngine.getModel().getNodes().forEach((item) => {
			if (item.getOptions()["selected"] == true) {
				let name = item.getOptions()["name"]
				currentNodeSignal.emit({
					item
				});
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
		let req_run_command4 = await sendingRunCommand("clear");
		console.log(req_run_command4);

		let req_run_command2 = await sendingRunCommand("continue");
		console.log(req_run_command2);

		let req_run_command3 = await sendingRunCommand("get/output");
		console.log(req_run_command3);
		
		return req_run_command3;
	};

	async function sendingRunCommand(command: string) {
		const dataToSend = { "command": command };

		try {
			const server_reply = await requestAPI<any>('debug/enable', {
				body: JSON.stringify(dataToSend),
				method: 'POST',
			});

			console.log(server_reply);
			console.log("server_reply");

			return server_reply;
		} catch (reason) {
			console.error(
				`Error on POST /xpipe/debug/enable ${dataToSend}.\n${reason}`
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
		let nextNode: NodeModel;

		let count = currentIndex;
		currentNode = allNodes[count];
		prevNode = allNodes[count];
		
		if (currentNode.getOptions()["name"].startsWith("🔴")) {
			prevNode.setSelected(false);
			currentNode = allNodes[count + 1];
			console.log("this");
			console.log(currentNode.getOptions()["name"]);

			if (currentNode.getOptions()["name"].startsWith("🔴")) {
				console.log("kk1");
				console.log(count);
				console.log(allNodes[count].getOptions()["name"]);
				console.log(currentNode.getOptions()["name"]);

				if (currentNode.getOptions()["name"] != "🔴Start" && currentNode.getOptions()["name"] != "Start") {
					await delay(1500);
					let req_run_command1 = await sendingRunCommand("run");
					console.log(req_run_command1);
				}

				console.log("run abc");
				console.log(currentNode.getOptions()["name"]);
				console.log(currentNode);
				currentNode.setSelected(true);
				currentNode.getOptions()["color"] = "rgb(150,150,150)";
				prevNode.setSelected(false);
				currentNode.getOptions()["color"] = "rgb(150,150,150)";

				if (currentNode.getOptions()["name"] != "Finish" && currentNode.getOptions()["name"] != "🔴Finish") {
					count = count + 1;
					currentNode = allNodes[count];

					console.log("run abcdefg");
					// console.log(currentNode.getOptions()["name"]);
					console.log(currentNode);

					// prevNode.getOptions()["color"] = "rgb(150,150,150)";
					setCurrentIndex(count);
					console.log("kk2");
					console.log(count);
				}
			}
		}

		while (!currentNode.getOptions()["name"].startsWith("🔴")) {
			console.log("kk1");
			console.log(count);
			console.log(currentNode.getOptions()["name"]);
			console.log(prevNode.getOptions()["name"]);
			if (prevNode.getOptions()["name"] != "🔴Start" && currentNode.getOptions()["name"] != "Start" && currentNode.getOptions()["name"] != "🔴Start") {
				await delay(1500);
				let req_run_command1 = await sendingRunCommand("run");
				console.log(req_run_command1);
			}

			console.log("run abc");
			console.log(currentNode.getOptions()["name"]);
			console.log(currentNode);

			prevNode = currentNode;
			// currentNode.setSelected(true);
			// currentNode.getOptions()["color"] = "rgb(150,150,150)";
			// currentNode.setSelected(false);
			prevNode.setSelected(true);
			count = count + 1;
			currentNode = allNodes[count];
			currentNode.setSelected(true);

			prevNode.getOptions()["color"] = "rgb(150,150,150)";
			prevNode.setSelected(false);
			// await delay(1000);
			// console.log(currentNode.getOptions()["name"]);
			if (currentNode.getOptions()["name"] == "Finish" || currentNode.getOptions()["name"] == "🔴Finish") {
				prevNode.setSelected(false);
				currentNode.setSelected(true);
				currentNode.getOptions()["color"] = "rgb(150,150,150)";

				setCurrentIndex(-1);
				setDebugMode(false);
				currentNode.setSelected(false);
				alert("Finish Execution.");
				console.log(currentNode);

				allNodes.forEach((node) => {
					console.log(node);
					node.setSelected(true);
					console.log("allnodes");
					node.getOptions()["color"] = node["color"];
				});
				return;
			}

			console.log(currentNode);
			// currentNode.setSelected(true);
			// currentNode.getOptions()["color"] = "rgb(150,150,150)";
			// prevNode.getOptions()["color"] = "rgb(150,150,150)";
			setCurrentIndex(count);
			console.log("kk2");
			console.log(count);
		}

		console.log("kk3");
		console.log(count);
		
		await getContinuePost();

		await delay(1000);
		let item2 = await sendingRunCommand("get/output");
		let runOnce = 0;
		console.log(item2);
		console.log("item3 from xpipe");

		// alert("Step Over");
		console.log("kk4");
		console.log(count);
		console.log(currentNode.getOptions()["name"]);

		if (currentNode.getOptions()["name"] == "Finish" || currentNode.getOptions()["name"] == "🔴Finish") {
			prevNode.setSelected(false);
			currentNode.setSelected(true);
			currentNode.getOptions()["color"] = "rgb(150,150,150)";

			setCurrentIndex(-1);
			setDebugMode(false);

			alert("Finish Execution.");
			console.log(currentNode);

			allNodes.forEach((node) => {
				console.log(node);
				node.setSelected(true);
				console.log("allnodes");
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
		console.log("currentIndex2");
		console.log(count);
		console.log(allNodes);

		currentNode = allNodes[count];
		prevNode = allNodes[count];

		if (currentNode.getOptions()["name"] == "Start" || currentNode.getOptions()["name"] == "🔴Start") {
			console.log(1243);

			console.log("currentIndex");
			console.log(count);

			// let output = await getContinuePost();
			// console.log(output);
			currentNode.setSelected(true);
			await getContinuePost();
			console.log("asd355");

			currentNode.getOptions()["color"] = "rgb(150,150,150)";
			currentNode.setSelected(false);
			// select
			count += 1;
			console.log(count);
			currentNode = allNodes[count];

			currentNode.setSelected(true);
			
			prevNode.setSelected(false);
			setCurrentIndex(count);

			await delay(1500);

			let item2 = await sendingRunCommand("get/output");
			let runOnce = 0;
			console.log(item2);
			console.log("item2 from xpipe")
			console.log(item2);
			// currentNodeSignal.emit({
			// 	currentNode, item2, runOnce
			// });


		} else {
			// not start
			// run
			// continue
			// get/output456456
			// clear
			console.log("run asd4");
			let req_run_command1 = await sendingRunCommand("run");
			console.log(req_run_command1);

			// await delay(1000);

			await getContinuePost();
			// alert(req_run_command3);
			// currentNodeSignal.emit({
			// 	currentNode
			// });
			// let output3 = await getRunPost();
			console.log("run asd4");
			// let output = await getContinuePost();
			// console.log(output);
			// console.log("asd4");
			prevNode.setSelected(true);
			count += 1;
			currentNode = allNodes[count];

			currentNode.setSelected(true);
			// currentNode.getOptions()["color"] = "rgb(150,150,150)";
			prevNode.getOptions()["color"] = "rgb(150,150,150)";
			prevNode.setSelected(false);
			setCurrentIndex(count);

			await delay(1000);
			let item2 = await sendingRunCommand("get/output");
			let runOnce = 0;
			console.log(item2);
			console.log("item3 from xpipe")

			// currentNodeSignal.emit({
			// 	currentNode, item2, runOnce
			// });
		}

		if (currentNode.getOptions()["name"] == "Finish") {
			currentNode.getOptions()["color"] = "rgb(150,150,150)";
			currentNode.setSelected(false);
			currentNode.setSelected(true);

			setCurrentIndex(-1);
			setDebugMode(false);

			allNodes.forEach((node) => {
				node.getOptions()["color"] = "rgb(150,150,150)";
				node.setSelected(false);
				node.setSelected(true);
				console.log("allnodes");
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
		
		resetColorCodeOnStart(false);

		setCurrentIndex(-1);
		setDebugMode(false);

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
		// Only test xpipe if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		debugger;

		//allNodes[i].getOptions().extras["imageGalleryItems"] = response;
		alert("Testing");
		//commands.execute('server:get-file');
	}

	const hideRcDialog = () => {
		setDisplayRcDialog(false);
	}

	useEffect(() => {

		if (initialize) {
			let allNodes = diagramEngine.getModel().getNodes();
			let nodesCount = allNodes.length;
			let nodeProperty = [];

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

				let nodeType, nodeColor, nodeObject;
				nodeType = allNodes[i].getOptions()["extras"]["type"];
				nodeColor = allNodes[i].getOptions()["color"];
				nodeObject = {
					type: nodeType,
					color: nodeColor
				}
				nodeProperty.push(nodeObject)
			}
			setNodesColor(nodeProperty);

		} else {
			setStringNodes(["experiment name"]);
			setIntNodes([]);
			setFloatNodes([]);
			setBoolNodes([]);
		}
	}, [initialize]);

	const handleRunDialog = async () => {
		let title = 'Run';
		const dialogOptions: Partial<Dialog.IOptions<any>> = {
			title,
			body: formDialogWidget(
				<RunDialog
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

		stringNodes.forEach((param) => {
			if (param == 'experiment name') {
				var dt = new Date();

				let dateTime = `${dt.getFullYear().toString().padStart(4, '0')}-${(
						dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`

				xpipeLogger.info(param + ": " + dateTime);
			}
			else {
				if (dialogResult["value"][param]) {
					xpipeLogger.info(param + ": " + dialogResult["value"][param]);
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			}
		});

		if (boolNodes) {
			boolNodes.forEach((param) => {
				xpipeLogger.info(param + ": " + dialogResult["value"][param]);
				if (dialogResult["value"][param]) {
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			});
		}

		if (intNodes) {
			intNodes.forEach((param) => {
				xpipeLogger.info(param + ": " + dialogResult["value"][param]);
				if (dialogResult["value"][param]) {
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			});
		}

		if (floatNodes) {
			floatNodes.forEach((param) => {
				xpipeLogger.info(param + ": " + dialogResult["value"][param]);
				if (dialogResult["value"][param]) {
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					commandStr += '--' + filteredParam + ' ' + dialogResult["value"][param] + ' ';
				}
			});
		}

		return commandStr;
	};

	useEffect(() => {
		const handleSaveSignal = (): void => {
			handleSaveClick();
		};
		saveXpipeSignal.connect(handleSaveSignal);
		return (): void => {
			saveXpipeSignal.disconnect(handleSaveSignal);
		};
	}, [saveXpipeSignal, handleSaveClick]);

	useEffect(() => {
		const handleReloadSignal = (): void => {
			handleReloadClick();
		};
		reloadXpipeSignal.connect(handleReloadSignal);
		return (): void => {
			reloadXpipeSignal.disconnect(handleReloadSignal);
		};
	}, [reloadXpipeSignal, handleReloadClick]);

	useEffect(() => {
		const handleRevertSignal = (): void => {
			handleRevertClick();
		};
		revertXpipeSignal.connect(handleRevertSignal);
		return (): void => {
			revertXpipeSignal.disconnect(handleRevertSignal);
		};
	}, [revertXpipeSignal, handleRevertClick]);

	useEffect(() => {
		const handleCompileSignal = (): void => {
			handleCompileClick();
		};
		compileXpipeSignal.connect(handleCompileSignal);
		return (): void => {
			compileXpipeSignal.disconnect(handleCompileSignal);
		};
	}, [compileXpipeSignal, handleCompileClick]);

	useEffect(() => {
		const handleRunSignal = (): void => {
			handleRunClick();
		};
		runXpipeSignal.connect(handleRunSignal);
		return (): void => {
			runXpipeSignal.disconnect(handleRunSignal);
		};
	}, [runXpipeSignal, handleRunClick]);

	useEffect(() => {
		const handleDebugSignal = (): void => {
			handleDebugClick();
		};
		debugXpipeSignal.connect(handleDebugSignal);
		return (): void => {
			debugXpipeSignal.disconnect(handleDebugSignal);
		};
	}, [debugXpipeSignal, handleDebugClick]);

	useEffect(() => {
		const handleBreakpointSignal = (): void => {
			handleToggleBreakpoint();
		};
		breakpointXpipeSignal.connect(handleBreakpointSignal);
		return (): void => {
			breakpointXpipeSignal.disconnect(handleBreakpointSignal);
		};
	}, [breakpointXpipeSignal, handleToggleBreakpoint]);

	useEffect(() => {
		const handleTestSignal = (): void => {
			handleTestClick();
		};
		testXpipeSignal.connect(handleTestSignal);
		return (): void => {
			testXpipeSignal.disconnect(handleTestSignal);
		};
	}, [testXpipeSignal, handleTestClick]);

	useEffect(() => {
		const handleContinueDebugSignal = (): void => {
			handleToggleContinueDebug();
		};
		continueDebugSignal.connect(handleContinueDebugSignal);
		return (): void => {
			continueDebugSignal.disconnect(handleContinueDebugSignal);
		};
	}, [continueDebugSignal, handleToggleContinueDebug]);

	useEffect(() => {
		const handleNextNodeSignal = (): void => {
			handleToggleNextNode();
		};
		nextNodeDebugSignal.connect(handleNextNodeSignal);
		return (): void => {
			nextNodeDebugSignal.disconnect(handleNextNodeSignal);
		};
	}, [nextNodeDebugSignal, handleToggleNextNode]);

	useEffect(() => {
		const handleStepOverSignal = (): void => {
			handleToggleStepOverDebug();
		};
		stepOverDebugSignal.connect(handleStepOverSignal);
		return (): void => {
			stepOverDebugSignal.disconnect(handleStepOverSignal);
		};
	}, [stepOverDebugSignal, handleToggleStepOverDebug]);

	useEffect(() => {
		const handleTerminateSignal = (): void => {
			handleToggleTerminateDebug();
		};
		terminateDebugSignal.connect(handleTerminateSignal);
		return (): void => {
			terminateDebugSignal.disconnect(handleTerminateSignal);
		};
	}, [terminateDebugSignal, handleToggleTerminateDebug]);

	useEffect(() => {
		const handleStepInSignal = (): void => {
			handleToggleStepInDebug();
		};
		stepInDebugSignal.connect(handleStepInSignal);
		return (): void => {
			stepInDebugSignal.disconnect(handleStepInSignal);
		};
	}, [stepInDebugSignal, handleToggleStepInDebug]);

	useEffect(() => {
		const handleStepOutSignal = (): void => {
			handleToggleStepOutDebug();
		};
		stepOutDebugSignal.connect(handleStepOutSignal);
		return (): void => {
			stepOutDebugSignal.disconnect(handleStepOutSignal);
		};
	}, [stepOutDebugSignal, handleToggleStepOutDebug]);

	useEffect(() => {
		const handleEvaluateSignal = (): void => {
			handleToggleEvaluateDebug();
		};
		evaluateDebugSignal.connect(handleEvaluateSignal);
		return (): void => {
			evaluateDebugSignal.disconnect(handleEvaluateSignal);
		};
	}, [evaluateDebugSignal, handleToggleEvaluateDebug]);

	const fetchComponentList = async () => {
		const response = await ComponentList(serviceManager, "");
		if (response.length > 0) {
			setComponentList([]);
		}
		setComponentList(response);
	}

	useEffect(() => {
		if (!runOnce) {
			fetchComponentList();
		}
	}, []);

	useEffect(() => {
		const intervalId = setInterval(() => {
			fetchComponentList();
		}, 5000);
		return () => clearInterval(intervalId);
	}, [componentList]);

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
								if (data.type === 'math') {

									node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });

									node.addInPortEnhance('▶', 'in-0');
									node.addInPortEnhance('A', 'in-1');
									node.addInPortEnhance('B', 'in-2');

									node.addOutPortEnhance('▶', 'out-0');
									node.addOutPortEnhance('value', 'out-1');

								} else if (data.type === 'convert') {

									node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });

									node.addInPortEnhance('▶', 'in-0');
									node.addInPortEnhance('model', 'parameter-string-in-1');

									node.addOutPortEnhance('▶', 'out-0');
									node.addOutPortEnhance('converted', 'out-1');

								} else if (data.type === 'string') {

									if ((data.name).startsWith("Literal")) {

										let theResponse = window.prompt('Enter String Value (Without Quotes):');
										node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance(theResponse, 'out-0');

									} else {

										let theResponse = window.prompt('notice', 'Enter String Name (Without Quotes):');
										node = new CustomNodeModel({ name: "Hyperparameter (String): " + theResponse, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance('▶', 'parameter-out-0');

									}

								} else if (data.type === 'int') {

									if ((data.name).startsWith("Literal")) {

										let theResponse = window.prompt('Enter Int Value (Without Quotes):');
										node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance(theResponse, 'out-0');

									} else {

										let theResponse = window.prompt('notice', 'Enter Int Name (Without Quotes):');
										node = new CustomNodeModel({ name: "Hyperparameter (Int): " + theResponse, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance('▶', 'parameter-out-0');

									}

								} else if (data.type === 'float') {

									if ((data.name).startsWith("Literal")) {

										let theResponse = window.prompt('Enter Float Value (Without Quotes):');
										node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance(theResponse, 'out-0');

									} else {

										let theResponse = window.prompt('notice', 'Enter Float Name (Without Quotes):');
										node = new CustomNodeModel({ name: "Hyperparameter (Float): " + theResponse, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance('▶', 'parameter-out-0');

									}

								} else if (data.type === 'boolean') {

									if ((data.name).startsWith("Literal")) {

										let portLabel = data.name.split(' ');
										portLabel = portLabel[portLabel.length - 1];

										node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance(portLabel, 'out-0');

									} else {

										let theResponse = window.prompt('notice', 'Enter Boolean Name (Without Quotes):');
										node = new CustomNodeModel({ name: "Hyperparameter (Boolean): " + theResponse, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance('▶', 'parameter-out-0');

									}

								} else if (data.type === 'list') {

									if ((data.name).startsWith("Literal")) {

										let theResponse = window.prompt('Enter List Values (Without [] Brackets):');
										node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance(theResponse, 'out-0');

									} else {

										let theResponse = window.prompt('notice', 'Enter List Name (Without Quotes):');
										node = new CustomNodeModel({ name: "Hyperparameter (List): " + theResponse, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance('▶', 'parameter-out-0');

									}

								} else if (data.type === 'tuple') {

									if ((data.name).startsWith("Literal")) {

										let theResponse = window.prompt('Enter Tuple Values (Without () Brackets):');
										node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance(theResponse, 'out-0');

									} else {

										let theResponse = window.prompt('notice', 'Enter Tuple Name (Without Quotes):');
										node = new CustomNodeModel({ name: "Hyperparameter (Tuple): " + theResponse, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance('▶', 'parameter-out-0');
									}

								} else if (data.type === 'dict') {

									if ((data.name).startsWith("Literal")) {

										let theResponse = window.prompt('Enter Dict Values (Without {} Brackets):');
										node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance(theResponse, 'out-0');

									} else {

										let theResponse = window.prompt('notice', 'Enter Dict Name (Without Quotes):');
										node = new CustomNodeModel({ name: "Hyperparameter (Dict): " + theResponse, color: current_node["color"], extras: { "type": data.type } });
										node.addOutPortEnhance('▶', 'parameter-out-0');

									}

								} else if (data.type === 'debug') {
									node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
									node.addInPortEnhance('▶', 'in-0');
									node.addInPortEnhance('Data Set', 'parameter-in-1');
									node.addOutPortEnhance('▶', 'out-0');

								} else if (data.type === 'enough') {

									node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });

									node.addInPortEnhance('▶', 'in-0');
									node.addInPortEnhance('Target Accuracy', 'parameter-float-in-1');
									node.addInPortEnhance('Max Retries', 'parameter-int-in-2');
									node.addInPortEnhance('Metrics', 'parameter-string-in-3');

									node.addOutPortEnhance('▶', 'out-0');
									node.addOutPortEnhance('Should Retrain', 'out-1');

								} else if (data.type === 'literal') {

									node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
									node.addOutPortEnhance('Value', 'out-0');
								}
							} else if (current_node.header == "ADVANCED") {
								node = new CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });

								node.addInPortEnhance('▶', 'in-0');
								let in_count = 1;
								let in_str = "";
								if (current_node["variable"].split(" - ").length > 1) {
									for (let node_index = 0; node_index < current_node["variable"].split(" - ").length; node_index++) {
										if (current_node["variable"].split(" - ")[node_index].includes('InArg')) {
											for (let variable_index = 0; variable_index < current_node["variable"].split(" - ")[node_index].split(" , ").length; variable_index++) {
												if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("InArg[str]")) {
													in_str = "parameter-string-in-" + in_count;
													in_count += 1;
												} else if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("InArg[int]")) {
													in_str = "parameter-int-in-" + in_count;
													in_count += 1;
												} else if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("InArg[bool]")) {
													in_str = "parameter-boolean-in-" + in_count;
													in_count += 1;
												} else if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("InArg[float]")) {
													in_str = "parameter-float-in-" + in_count;
													in_count += 1;
												} else if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("InArg[list]")) {
													in_str = "parameter-list-in-" + in_count;
													in_count += 1;
												} else if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("InArg[tuple]")) {
													in_str = "parameter-tuple-in-" + in_count;
													in_count += 1;
												} else if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("InArg[dict]")) {
													in_str = "parameter-dict-in-" + in_count;
													in_count += 1;
												} else {
													in_str = "in-" + in_count;
													in_count += 1;
												}
												node.addInPortEnhance(current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().split(":")[0], in_str);
											}
										}
									}
								} else if (current_node["variable"].includes('InArg')) {
									if (current_node["variable"].split(" , ").length > 0) {
										for (let variable_index = 0; variable_index < current_node["variable"].split(" , ").length; variable_index++) {
											if (current_node["variable"].split(" , ")[variable_index].trim().includes("InArg[str]")) {
												in_str = "parameter-string-in-" + in_count;
												in_count += 1;
											} else if (current_node["variable"].split(" , ")[variable_index].trim().includes("InArg[int]")) {
												in_str = "parameter-int-in-" + in_count;
												in_count += 1;
											} else if (current_node["variable"].split(" , ")[variable_index].trim().includes("InArg[bool]")) {
												in_str = "parameter-boolean-in-" + in_count;
												in_count += 1;
											} else if (current_node["variable"].split(" , ")[variable_index].trim().includes("InArg[float]")) {
												in_str = "parameter-float-in-" + in_count;
												in_count += 1;
											} else if (current_node["variable"].split(" , ")[variable_index].trim().includes("InArg[list]")) {
												in_str = "parameter-list-in-" + in_count;
												in_count += 1;
											} else if (current_node["variable"].split(" , ")[variable_index].trim().includes("InArg[tuple]")) {
												in_str = "parameter-tuple-in-" + in_count;
												in_count += 1;
											} else if (current_node["variable"].split(" , ")[variable_index].trim().includes("InArg[dict]")) {
												in_str = "parameter-dict-in-" + in_count;
												in_count += 1;
											} else {
												in_str = "in-" + in_count;
												in_count += 1;
											}
											node.addInPortEnhance(current_node["variable"].split(" , ")[variable_index].trim().split(":")[0], in_str);
										}
									}
								}

								node.addOutPortEnhance('▶', 'out-0');
								let count = 1;
								let out_str = "";
								if (current_node["variable"].split(" - ").length > 1) {
									for (let node_index = 0; node_index < current_node["variable"].split(" - ").length; node_index++) {
										if (current_node["variable"].split(" - ")[node_index].includes('OutArg')) {
											for (let variable_index = 0; variable_index < current_node["variable"].split(" - ")[node_index].split(" , ").length; variable_index++) {
												if (current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().includes("Dataset")) {
													out_str = "parameter-out-" + count;
													count += 1;
												} else {
													out_str = "out-" + count;
													count += 1;
												}
												node.addOutPortEnhance(current_node["variable"].split(" - ")[node_index].split(" , ")[variable_index].trim().split(":")[0], out_str);
											}
										}
									}
								} else if (current_node["variable"].includes('OutArg')) {
									if (current_node["variable"].split(" , ").length > 0) {
										for (let variable_index = 0; variable_index < current_node["variable"].split(" , ").length; variable_index++) {
											if (current_node["variable"].split(" , ")[variable_index].trim().includes("Dataset")) {
												out_str = "parameter-out-" + count;
												count += 1;
											} else {
												out_str = "out-" + count;
												count += 1;
											}
											node.addInPortEnhance(current_node["variable"].split(" , ")[variable_index].trim().split(":")[0], out_str);
										}
									}
								}
							}
						}

						// note:  can not use the same port name in the same node,or the same name port can not link to other ports
						// you can use shift + click and then use delete to delete link
						if (node != null) {
							let point = diagramEngine.getRelativeMousePoint(event);
							node.setPosition(point);
							diagramEngine.getModel().addNode(node);
							node.registerListener({
								entityRemoved: () => {
									setInitialize(false);
									setSaved(false);
									setCompiled(false);
								}
							});
							console.log("Updating doc context due to drop event!")
							let currentModel = diagramEngine.getModel().serialize();
							context.model.setSerializedModel(currentModel);
							setInitialize(false);
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
					}}>

					<DemoCanvasWidget>
						<CanvasWidget engine={diagramEngine} />
					</DemoCanvasWidget>
				</Layer>
			</Content>
		</Body>
	);
}
