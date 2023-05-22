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
	lockNodeSignal: Signal<XPipePanel, any>;
	reloadAllNodesSignal: Signal<XPipePanel, any>;
}

export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
		height: 800px;
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
	openDocManager: 'docmanager:open',
	newDocManager: 'docmanager:new-untitled',
	saveDocManager: 'docmanager:save',
	reloadDocManager: 'docmanager:reload',
	createNewXircuit: 'Xircuit-editor:create-new',
	saveXircuit: 'Xircuit-editor:save-node',
	compileXircuit: 'Xircuit-editor:compile-node',
	runXircuit: 'Xircuit-editor:run-node',
	lockXircuit: 'Xircuit-editor:lock-node',
	openScript: 'Xircuit-editor:open-node-script',
	undo: 'Xircuit-editor:undo',
	redo: 'Xircuit-editor:redo',
	cutNode: 'Xircuit-editor:cut-node',
	copyNode: 'Xircuit-editor:copy-node',
	pasteNode: 'Xircuit-editor:paste-node',
	reloadNode: 'Xircuit-editor:reload-node',
	reloadAllNodes: 'Xircuit-editor:reload-all-nodes',
	editNode: 'Xircuit-editor:edit-node',
	deleteNode: 'Xircuit-editor:delete-node',
	addNodeGivenPosition: 'Xircuit-editor:add-node', 
	connectNodeByLink: 'Xircuit-editor:connect-node',
	connectLinkToObviousPorts: 'Xircuit-editor:connect-obvious-link',
	addCommentNode: 'Xircuit-editor:add-comment-node',
	compileFile: 'Xircuit-editor:compile-file',
	nextNode: 'Xircuit-editor:next-node',
	outputMsg: 'Xircuit-log:logOutputMessage',
	executeToOutputPanel: 'Xircuit-output-panel:execute'
};


export const BodyWidget: FC<BodyWidgetProps> = ({
	context,
	xircuitsApp,
	app,
	shell,
	commands,
	widgetId,
	fetchComponentsSignal,
	saveXircuitSignal,
	compileXircuitSignal,
	runXircuitSignal,
	runTypeXircuitSignal,
	lockNodeSignal,
	reloadAllNodesSignal,
}) => {
	const xircuitLogger = new Log(app);

	const [saved, setSaved] = useState(false);
	const [compiled, setCompiled] = useState(false);
	const [initialize, setInitialize] = useState(true);
	const [runConfigs, setRunConfigs] = useState<any>("");
	const [lastConfig, setLastConfigs] = useState<any>("");
	const [stringNodes, setStringNodes] = useState<string[]>([]);
	const [intNodes, setIntNodes] = useState<string[]>([]);
	const [floatNodes, setFloatNodes] = useState<string[]>([]);
	const [boolNodes, setBoolNodes] = useState<string[]>([]);
	const [componentList, setComponentList] = useState([]);
	const [inDebugMode, setInDebugMode] = useState<boolean>(false);
	const [currentIndex, setCurrentIndex] = useState<number>(-1);
	const [runType, setRunType] = useState<string>("run");
	const [runTypesCfg, setRunTypesCfg] = useState<string>("");
	const initialRender = useRef(true);
	const contextRef = useRef(context);
	const notInitialRender = useRef(false);

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
		let branchNodes = [];
		let finishedNodes = [];
		let startNodeModel = getNodeModelByName(nodeModels, 'Start');
		if (startNodeModel == null) {
			startNodeModel = getNodeModelByName(nodeModels, '🔴Start');
		}

		if (startNodeModel) {
			let sourceNodeModelId = startNodeModel.getID();
			let retNodeModels: NodeModel[] = [];
			retNodeModels.push(startNodeModel);

			while (getTargetNodeModelId(model.getLinks(), sourceNodeModelId) != null || finishedNodes.length != 0) {
				let getTargetNode = getTargetNodeModelId(model.getLinks(), sourceNodeModelId);
				const nodeModel = getNodeModelById(nodeModels, getTargetNode);

				// When the next node is Finish, set its previous node extras's nextNode properties as null
				if (getTargetNode != null && nodeModel.getOptions()['name'] == 'Finish') {
					const beforeFinishNode = getNodeModelById(nodeModels, sourceNodeModelId);
					beforeFinishNode['extras']['nextNode'] = 'None';
				}

				// This will go to the next node of branch node given its source branch node ID
				const branchWorkflow = (nodeId?: string) => {
					let branchNode = branchNodes.find(x => x.currentNode.getID() == nodeId);
					if (branchNode == undefined) {
						//When no flowPorts connected, skip to finish port's Node
						finishedNodes.forEach((node) => {
							if (nodeId === node.currentNode.getID()) finishWorkflow(node);
						})
					} else {
						let checkIfNodeIsBranchNode = checkIfNodeHasBranchFlowport(branchNode.nextNode);
						if (checkIfNodeIsBranchNode) {
							// This will check if the next node of the branch node is another branch node
							checkIfNextNodeHasBranchFlowport(branchNode.nextNode);
						} else {
							sourceNodeModelId = branchNode.nextNode.getID();
						}
						retNodeModels.push(branchNode.nextNode);
						branchNodes.forEach((node, index) => {
							// Remove it from the the list to indicate we already go through its workflow
							if (branchNode.nextNode === node.nextNode) branchNodes.splice(index, 1);
						})
					}
				}

				// This will go to the next node of finish workflow's node given its source branch node ID
				const finishWorkflow = (latestFinishedNode?) => {
					let checkIfNodeIsBranchNode = checkIfNodeHasBranchFlowport(latestFinishedNode?.finishNode);
					if (checkIfNodeIsBranchNode) {
						// This will check if the finish node of the branch node is another branch node
						checkIfNextNodeHasBranchFlowport(latestFinishedNode?.finishNode); 
					}else {
						sourceNodeModelId = latestFinishedNode?.finishNode?.getID();
					}
					retNodeModels.push(latestFinishedNode?.finishNode);
					finishedNodes.forEach((node, index) => {
						// Remove it from the the list 
						// to indicate we already finish going through all of this branch node's workflow
						if (latestFinishedNode?.finishNode === node.finishNode) finishedNodes.splice(index, 1);
					})
				}

				// This will check if the next node of the branch node is another branch node
				const checkIfNextNodeHasBranchFlowport = (branchNode?) => {
					let tempNextNodeOfBranch = branchNodes.find(x => x.currentNode.getID() == branchNode.getID()).nextNode;
					checkIfNodeHasBranchFlowport(tempNextNodeOfBranch);
					sourceNodeModelId = tempNextNodeOfBranch.getID();
					retNodeModels.push(tempNextNodeOfBranch);
					branchNodes.forEach((node, index) => {
						// Remove it from the the list to indicate we already go through its workflow
						if (tempNextNodeOfBranch === node.nextNode) branchNodes.splice(index, 1);
					})
				}

				// This will check if the node have branch flowports
				const checkIfNodeHasBranchFlowport = (currentNode) => {
					const currentBranchNodesLength = branchNodes.length;
					if (currentNode == undefined || currentNode == null){
						return
					}
					currentNode['portsOut']?.map((p) => {
						if (p.getName().includes('out-flow')) {
							const branchFlowportLinks = p.links;
							const sameBranchNode = finishedNodes.find(x => x.currentNode.getID() == currentNode.getID());
							const finishedLink = currentNode.getPorts()['out-0'].links;
							let getFinishNode;

							if (Object.keys(finishedLink).length != 0) {
								for (let linkID in finishedLink) {
										let link = finishedLink[linkID];
										if (Object.keys(finishedLink).length != 0) {
											getFinishNode = link.getTargetPort().getParent();
											currentNode['extras']['finishNodeId'] = getFinishNode.getID();
										}
									}
							} else {
								// When there is no finish node, set finishNodeId to None
								getFinishNode = null;
								currentNode['extras']['finishNodeId'] = 'None';
							}
							if (finishedNodes.length == 0 || !sameBranchNode) {
								// When there is no branch node or the same branch node,
								// Get the branch node and its next node of finish port
								finishedNodes.push({
									'currentNode': currentNode,
									'finishNode': getFinishNode
								});
								currentNode['extras']['isBranchNode'] = true; // To indicate it's a branch component
							}

							for (let linkID in branchFlowportLinks) {
								let link = branchFlowportLinks[linkID];
								if (Object.keys(link).length != 0) {
									const nextBranchFlowportNode = link.getTargetPort().getParent();
									branchNodes.push({
										// Get the branch node and its next node of its branch flowports
										'currentNode': currentNode,
										'nextNode': nextBranchFlowportNode
									});
									// Save the source branch Id and its port Id at each next node of the branch node
									nextBranchFlowportNode['extras']['sourceBranchId'] = currentNode.getID();
									nextBranchFlowportNode['extras']['portId'] = p.getID();
								}
							}
						}
					})
					if (currentBranchNodesLength !== branchNodes.length) {
						// If the next node is branch node, return true
						return true;
					}
					return false;
				}

				// When next node is empty check if there's any branch component,
				// continue to finish port where its branches using the saved node Id.
				if (getTargetNode == null) {
					const getCurrentNode = getNodeModelById(nodeModels, sourceNodeModelId);
					getCurrentNode['extras']['nextNode'] = 'None';

					if (branchNodes.length != 0) {
						// When there still a branch flowports, iterate through branch workflow again
						let latestBranchNode = branchNodes[branchNodes.length - 1];
						branchWorkflow(latestBranchNode.currentNode.getID());
						continue;
					}

					// When there is no more branch workflow to iterate, continue with the finish port workflow
					const latestFinishedNode = finishedNodes[finishedNodes.length - 1];
					if (latestFinishedNode.finishNode == null) {
						// When there's no next node, remove from list
						finishedNodes.forEach((node, index) => {
							// Remove it from the the list 
							// to indicate we already finish going through all of this branch node's workflow
							if (latestFinishedNode?.currentNode === node.currentNode) finishedNodes.splice(index, 1);
						})
						continue;
					}
					finishWorkflow(latestFinishedNode); // Every finish node branch workflow
					continue;
				}

				if (getTargetNode) {
					checkIfNodeHasBranchFlowport(nodeModel); // This will check if the node have branch flowports
					if (nodeModel) {
						// If there are branch flowports, get its node Id.
						if (finishedNodes.length != 0) {
							const latestBranchNode = finishedNodes[finishedNodes.length - 1].currentNode;
							if (latestBranchNode.getID() == nodeModel.getID()) {
								// Get the branch node's Id and iterate through it branch workflow.
								retNodeModels.push(nodeModel);
								branchWorkflow(nodeModel.getID());
								continue;
							}
						}
						sourceNodeModelId = nodeModel.getID();
						retNodeModels.push(nodeModel);
					}
				}
			}
			return retNodeModels;
		}

		return null;
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
		let allNodes = getAllNodesFromStartToFinish();
		let lastNode = allNodes[allNodes.length - 1];

		if (lastNode['name'] != 'Finish') {
			// When last node is not Finish node, check failed and show error tooltip
			lastNode.getOptions().extras["borderColor"] = "red";
			lastNode.getOptions().extras["tip"] = `Please make sure this **${lastNode['name']}** node end with **Finish** node`;
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

	const handleSaveClick = async () => {
		// Only save xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		onChange()
		setInitialize(true);
		setSaved(true);
		await commands.execute(commandIDs.saveDocManager);
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

		let showOutput = true;
		setCompiled(true);
		commands.execute(commandIDs.compileFile, { showOutput, componentList });
	}

	const saveAndCompileAndRun = async () => {

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
			alert("Please connect all the nodes before running.");
		}
		if (!allCompulsoryNodesConnected) {
			alert("Please connect all [★]COMPULSORY InPorts.");
			return;
		}

		let showOutput = false;

		// Only compile when 'Run' is chosen
		if (runType == 'run') {
			commands.execute(commandIDs.compileFile, { showOutput, componentList });
			setCompiled(true);
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
		saveAndCompileAndRun();
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

	const handleReloadAll = () => {
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		let allNodes = xircuitsApp.getDiagramEngine().getModel().getNodes()
		allNodes.forEach(node => node.setSelected(true));
		app.commands.execute(commandIDs.reloadNode);
		
	}

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

	useEffect(() => {
		// Get run configuration when in 'Remote Run' mode only
		if (runType == 'remote-run') {
			getRunTypeFromConfig();
		} else {
			setRunConfigs("")
		}

		context.ready.then(() => {
			const setterByType = {
				'String': setStringNodes,
				'Int': setIntNodes,
				'Float': setFloatNodes,
				'Boolean': setBoolNodes
			}


			if (initialize) {
				let allNodes = xircuitsApp.getDiagramEngine().getModel().getNodes();
				let nodesCount = allNodes.length;

				for (let i = 0; i < nodesCount; i++) {
					let nodeName = allNodes[i].getOptions()["name"];
					if (nodeName.startsWith("Argument")) {
						let regEx = /\(([^)]+)\)/;
						let result = nodeName.match(regEx);
						let nodeText = nodeName.split(": ");
						setterByType[result[1]](nodes => ([...nodes, nodeText[nodeText.length -1]].sort()));
					}
				}
			}
			else {
				Object.values(setterByType).forEach(set => set([]));
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

		const date = new Date();
		xircuitLogger.info(`experiment name: ${date.toLocaleString()}`)

		const commandStr = [
			stringNodes.filter(param => param != "experiment name"),
			boolNodes, intNodes, floatNodes
		].filter(it => !!it).reduce((s, nodes) => {
			return nodes
				.filter(param => !!dialogResult.value[param])
				.reduce((cmd, param) => {
					xircuitLogger.info(param + ": " + dialogResult.value[param]);
					let filteredParam = param.replace(/\s+/g, "_");
					filteredParam = filteredParam.toLowerCase();
					return `${cmd} --${filteredParam} ${dialogResult.value[param]}`;
				}, s);
		}, "");

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
		[lockNodeSignal, handleLockClick],
		[reloadAllNodesSignal, handleReloadAll]
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


	const connectLinkToItsLiteral = async (linkName, event) => {
		let portType = linkName.split("-")[1];
		// if multiple types provided, Use the first type.
		if (portType.includes(',')) {
			portType = portType.replace('Union', '');
			portType = portType.replace(/[\[\]]/g, '');
			portType = portType.split(',')[0];
		}

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
				break;
			default:
				nodeType = portType.charAt(0).toUpperCase() + portType.slice(1);
				break;
		}

		let current_node = await fetchNodeByName('Literal ' + nodeType);
		let node = await GeneralComponentLibrary({ model: current_node, variableValue: varInput });
		if (node == undefined) return;
		let nodePosition = event.linkEvent;
		let sourceLink = { link: event.link, sourcePort: event.sourcePort };
		await app.commands.execute(commandIDs.addNodeGivenPosition, { node, nodePosition });
		await app.commands.execute(commandIDs.connectNodeByLink, { targetNode: node, sourceLink, isParameterLink: true });
	}

	/**Component Panel & Node Action Panel Context Menu */
	const [isComponentPanelShown, setIsComponentPanelShown] = useState(false);
	const [actionPanelShown, setActionPanelShown] = useState(false);
	const [dontHidePanel, setDontHidePanel] = useState(false);
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
		console.log(newCenterPosition.x,newPanelPosition.x,newCenterPosition.y,newPanelPosition.y)
		const menuDimension = {
			x: 105,
			y: 290
		}
		const fileBrowserWidth = document.getElementsByClassName("p-SplitPanel-child")[1].clientWidth;
		const tabWidth = document.getElementsByClassName("lm-TabBar")[0].clientWidth;
		const yOffset = 84
		if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
			// Bottom right
			newPanelPosition.x = newPanelPosition.x - fileBrowserWidth - tabWidth - menuDimension.x;
			newPanelPosition.y = newPanelPosition.y - menuDimension.y - yOffset;
		} else if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y < newCenterPosition.y) {
			// Top right
			newPanelPosition.x = newPanelPosition.x - fileBrowserWidth - tabWidth - menuDimension.x;
			newPanelPosition.y = newPanelPosition.y - yOffset;
		} else if (newPanelPosition.x < newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
			// Bottom left
			newPanelPosition.x = newPanelPosition.x - fileBrowserWidth - tabWidth;
			newPanelPosition.y = newPanelPosition.y - menuDimension.y - yOffset;
		} else {
			// Top left
			newPanelPosition.x = newPanelPosition.x - fileBrowserWidth - tabWidth;
			newPanelPosition.y = newPanelPosition.y - yOffset;
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

	const preventDefault = (event) => {
		event.preventDefault();
	}

	const handleDropEvent = async (event) => {
		let data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));

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
			if (node["name"].startsWith("Argument")) {
				setInitialize(true);
			}
			setSaved(false);
			setCompiled(false);
		}
	};

	const handleClick = (event) => {
		if (event.ctrlKey || event.metaKey) {
			showComponentPanel(event);
			return;
		}
		if (dontHidePanel) {
			return;
		}
		hidePanel();
	};

	return (
		<Body>
			<Content>
				<Layer
					onDrop={handleDropEvent}
					onDragOver={preventDefault}
					onMouseOver={preventDefault}
					onMouseUp={preventDefault}
					onMouseDown={preventDefault}
					onContextMenu={showNodeActionPanel}
					onClick={handleClick}>
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
									left:componentPanelPosition.x
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
									left: actionPanelPosition.x
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
