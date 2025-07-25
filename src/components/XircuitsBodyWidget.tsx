import React, { FC, useCallback, useEffect, useRef, useState } from "react";

import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { LinkModel, NodeModel } from "@projectstorm/react-diagrams";

import { Dialog, showDialog, showErrorMessage } from "@jupyterlab/apputils";
import { ILabShell, JupyterFrontEnd } from "@jupyterlab/application";
import { DocumentRegistry } from "@jupyterlab/docregistry";
import { ServiceManager } from "@jupyterlab/services";
import { Signal } from "@lumino/signaling";

import { XircuitsPanel } from "../XircuitsWidget";
import { XircuitsApplication } from "./XircuitsApp";
import { XircuitsCanvasWidget } from "../helpers/XircuitsCanvasWidget";
import { Log } from "../log/LogPlugin";
import { formDialogWidget } from "../dialog/formDialogwidget";
import { showFormDialog } from "../dialog/FormDialog";
import { inputDialog } from "../dialog/LiteralInputDialog";
import { getItsLiteralType } from "../dialog/input-dialogues/VariableInput";
import { LocalRunDialog } from "../dialog/LocalRunDialog";
import { RemoteRunDialog } from "../dialog/RemoteRunDialog";
import { requestAPI } from "../server/handler";
import ComponentsPanel from "../context-menu/ComponentsPanel";
import {
	CanvasContextMenu,
	countVisibleMenuOptions,
	getMenuOptionsVisibility,
} from "../context-menu/CanvasContextMenu";
import { delayedZoomToFit, zoomIn, zoomOut, centerNodeInView } from '../helpers/zoom';
import { searchModel, SearchResult } from '../helpers/search';
import { cancelDialog, GeneralComponentLibrary } from "../tray_library/GeneralComponentLib";
import { AdvancedComponentLibrary, fetchNodeByName } from "../tray_library/AdvanceComponentLib";
import { lowPowerMode, setLowPowerMode } from "./state/powerModeState";
import { lightMode, setLightMode } from "./state/lightModeState";
import { startRunOutputStr } from "./runner/RunOutput";
import { buildRemoteRunCommand } from "./runner/RemoteRun";

import styled from "@emotion/styled";
import { commandIDs } from "../commands/CommandIDs";
import { Notification } from '@jupyterlab/apputils';
import { SplitLinkCommand } from './link/SplitLinkCommand';
import { LinkSplitManager } from './link/LinkSplitManager';
import { fitIcon, zoomInIcon, zoomOutIcon } from '../ui-components/icons';
import { CustomPortModel } from "./port/CustomPortModel";
import { showNodeCenteringNotification } from '../helpers/notificationEffects';

export interface BodyWidgetProps {
	context: DocumentRegistry.Context;
	xircuitsApp: XircuitsApplication;
	app: JupyterFrontEnd;
	shell: ILabShell;
	commands: any;
	widgetId?: string;
	serviceManager: ServiceManager;
	fetchComponentsSignal: Signal<XircuitsPanel, any>;
	fetchRemoteRunConfigSignal: Signal<XircuitsPanel, any>;
	saveXircuitSignal: Signal<XircuitsPanel, any>;
	compileXircuitSignal: Signal<XircuitsPanel, any>;
	runXircuitSignal: Signal<XircuitsPanel, any>;
	runTypeXircuitSignal: Signal<XircuitsPanel, any>;
	lockNodeSignal: Signal<XircuitsPanel, any>;
	triggerCanvasUpdateSignal: Signal<XircuitsPanel, any>;
	triggerLoadingAnimationSignal: Signal<XircuitsPanel, any>;
	reloadAllNodesSignal: Signal<XircuitsPanel, any>;
	toggleAllLinkAnimationSignal: Signal<XircuitsPanel, any>;
	toggleLightModeSignal: Signal<XircuitsPanel, any>;
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

export const FixedZoomButton = styled.button`
	background: rgba(255, 255, 255, 0.1);        
	border: 1px solid rgba(255,255,255,0.2);
	width: 26px;
	height: 26px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	cursor: pointer;
	color: white;
	line-height: 0;

	box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
	transition: all .3s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	svg { display: block; width: 12px; height: 12px; color: inherit; }

	/* Light theme override */
	body.light-mode & {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
		color: black;

		&:hover {
			background: rgba(0, 0, 0, 0.1);
			border-color: black;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		}
	}
	`;

const ZoomControls = styled.div<{visible: boolean}>`
	position: fixed;
	bottom: 12px;
	right: 12px;
	z-index: 9999;
	display: flex;
	gap: 0px;
	flex-direction: column;
	opacity: ${({visible}) => (visible ? 1 : 0)};
	pointer-events: ${({visible}) => (visible ? 'auto' : 'none')};
	transition: opacity 0.5s ease;
	
	`;

	const SearchOverlay = styled.div<{visible: boolean}>`
	position: fixed;
	top: 10px;
	right: 10px;
	background: rgba(0,0,0,0.8);
  	padding: 8px;    /* ← extra right padding for the close button */
	border-radius: 4px;
	display: ${({visible}) => visible ? 'flex' : 'none'};
	align-items: center;
	gap: 4px;
	z-index: 10000;
  
	input {
	  padding: 4px 6px;
	  border-radius: 2px;
	  border: none;
	  outline: none;
	  width: 140px;
	}
  
	button:not(.close-search) {
	  background: none;
	  border: none;
	  color: white;
	  cursor: pointer;
	  padding: 4px;
	  font-size: 14px;
	}
  
  	span {
	  margin-left: auto;
	  color: white;
	  font-size: 12px;
	}
  
	.close-search {
		top: 4px;
		left: 50%;
		background: none;
		border: none;
		color: white;
		font-size: 24px;
		cursor: pointer;
		line-height: 1;
	}

	/* Light theme override */
	body.light-mode & {
	  background: rgba(255,255,255,0.9);
	  border: 1px solid rgba(0,0,0,0.1);
  
	  input {
		color: black;
		background: rgba(0,0,0,0.05);
	  }
  
	  button:not(.close-search) {
		color: black;
	  }
  
	  span {
		color: black;
	  }
  
	  .close-search {
		color: black;
	  }
	}
`;

export const BodyWidget: FC<BodyWidgetProps> = ({
	context,
	xircuitsApp,
	app,
	shell,
	commands,
	widgetId,
	fetchComponentsSignal,
	fetchRemoteRunConfigSignal,
	saveXircuitSignal,
	compileXircuitSignal,
	runXircuitSignal,
	runTypeXircuitSignal,
	lockNodeSignal,
	triggerCanvasUpdateSignal,
	triggerLoadingAnimationSignal,
	reloadAllNodesSignal,
	toggleAllLinkAnimationSignal,
	toggleLightModeSignal
}) => {
	const xircuitLogger = new Log(app);

	const [canvasLoaded, setCanvasLoaded] = useState(false);
	const [saved, setSaved] = useState(false);
	const [compiled, setCompiled] = useState(false);
	const [initialize, setInitialize] = useState(true);
	const [remoteRunConfigs, setRemoteRunConfigs] = useState<any>("");
	const [lastConfig, setLastConfigs] = useState<any>("");
	const [componentList, setComponentList] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState('Xircuits loading...');
	const [inDebugMode, setInDebugMode] = useState<boolean>(false);
	const [currentIndex, setCurrentIndex] = useState<number>(-1);
	const [runType, setRunType] = useState<string>("run");
	const [prevRemoteConfiguration, setPrevRemoteConfiguration] = useState(null);
	const [remoteRunTypesCfg, setRemoteRunTypesCfg] = useState<string>("");
	const initialRender = useRef(true);
	const contextRef = useRef(context);
	const notInitialRender = useRef(false);
	const [showZoom, setShowZoom] = useState(true);
	const hideTimeout = useRef<ReturnType<typeof setTimeout>>();
	const [isHoveringControls, setIsHoveringControls] = useState(false);

	const engine = xircuitsApp.getDiagramEngine();
	const isHoveringControlsRef = useRef(false);
	const [showSearch, setShowSearch] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [matchCount, setMatchCount] = useState(0);
	const [currentMatch, setCurrentMatch] = useState(0);
	const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
	const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);

	const clearSearchFlags = () => {
		const engine = xircuitsApp.getDiagramEngine();
		engine.getModel().getNodes().forEach(node => {
		  node.getOptions().extras.isMatch = false;
		  node.getOptions().extras.isSelectedMatch = false;
		});
		engine.repaintCanvas();
	  };

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
		const key = e.key.toLowerCase();
		  // only handle in the active Xircuits canvas
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		if ((e.ctrlKey || e.metaKey) && key === 'f') {
			e.preventDefault();
			setShowSearch(s => !s);
		}
		if (e.key === 'Escape') {
			setShowSearch(false);
		}
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [shell, widgetId]);

	// Execute search command
	const searchInputRef = useRef<HTMLInputElement>(null);

	const executeSearch = useCallback((text: string) => {
		const engine = xircuitsApp.getDiagramEngine();
		const model = engine.getModel();
		const nodes = model.getNodes();
	
		// Deselect all
		nodes.forEach(node => {
			node.setSelected(false);
			node.getOptions().extras.isMatch = false;
			node.getOptions().extras.isSelectedMatch = false;
		});
	
		const query = text.trim();
		if (!query) {
		setMatchCount(0);
		setCurrentMatch(0);
		setMatchedIndices([]);
		setCurrentMatchIndex(-1);
		engine.repaintCanvas();
		return;
		}
	
		const result: SearchResult = searchModel(model, query);
		setMatchCount(result.count);
		setMatchedIndices(result.indices);
	
		if (result.indices.length > 0) {
			result.indices.forEach((index, i) => {
			const matchNode = nodes[index];
			matchNode.getOptions().extras.isMatch = true;
			matchNode.getOptions().extras.isSelectedMatch = i === 0;
			});
		
			const first = nodes[result.indices[0]];
			first.setSelected(true);
			centerNodeInView(engine, first);
			engine.repaintCanvas();
			setCurrentMatch(1);
			setCurrentMatchIndex(0);
		} else {
		setCurrentMatch(0);
		setCurrentMatchIndex(-1);
		}
	
		searchInputRef.current?.focus();
	}, [xircuitsApp]);
	
	const navigateMatch = (direction: 'next' | 'prev') => {
		const engine = xircuitsApp.getDiagramEngine();
		const model = engine.getModel();
		const nodes = model.getNodes();
	
		if (matchedIndices.length === 0) return;
	
		let newIndex = currentMatchIndex;
		if (direction === 'next') {
		newIndex = (currentMatchIndex + 1) % matchedIndices.length;
		} else {
		newIndex = (currentMatchIndex - 1 + matchedIndices.length) % matchedIndices.length;
		}
	
		const matchedIndex = matchedIndices[newIndex];
		const matchedNode = nodes.find((_, idx) => idx === matchedIndex);
	
		nodes.forEach(node => {
			node.setSelected(false);
			node.getOptions().extras.isSelectedMatch = false;
		});
		matchedNode.setSelected(true);
		matchedNode.getOptions().extras.isSelectedMatch = true;
		centerNodeInView(xircuitsApp.getDiagramEngine(), matchedNode);
		engine.repaintCanvas();
	
		setCurrentMatch(newIndex + 1);
		setCurrentMatchIndex(newIndex);
	};
	
	// On input change
	const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};
	
	useEffect(() => {
		if (!showSearch) { return; }
		const handle = setTimeout(() => {
			executeSearch(searchText);
		}, 0);
		return () => clearTimeout(handle);
		}, [searchText, showSearch, executeSearch]);
		
		// whenever we open the search, force-focus the input
		useEffect(() => {
		if (showSearch) {
		searchInputRef.current?.focus();
		}
			}, [showSearch]);

		useEffect(() => {
		isHoveringControlsRef.current = isHoveringControls;
		}, [isHoveringControls]);
	
	useEffect(() => {
	if (!showSearch) {
    const engine = xircuitsApp.getDiagramEngine();
    const nodes = engine.getModel().getNodes();
    nodes.forEach(node => {
	node.getOptions().extras.isMatch = false;
	node.getOptions().extras.isSelectedMatch = false;
    });
    engine.repaintCanvas();
}
}, [showSearch]);

	const handleMouseMoveCanvas = useCallback(() => {
	setShowZoom(true);
	if (hideTimeout.current) clearTimeout(hideTimeout.current);

	hideTimeout.current = setTimeout(() => {
		if (!isHoveringControlsRef.current) {
		setShowZoom(false);
		}
	}, 1500);
	}, []);
  
	// handler to trigger the zoom functions
	const handleZoomToFit = useCallback(() => {
	delayedZoomToFit(xircuitsApp.getDiagramEngine(), /* optional padding */);
	}, [xircuitsApp]);

	const handleZoomIn = useCallback(() => {
		zoomIn(xircuitsApp.getDiagramEngine());
	}, [xircuitsApp]);
	
	const handleZoomOut = useCallback(() => {
		zoomOut(xircuitsApp.getDiagramEngine());
		}, [xircuitsApp]);
	
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
				return;
			}

			try {
				// Deserialize the raw JSON, passing whether this is the first render
				const model: any = currentContext.model.toJSON();
				let deserializedModel = xircuitsApp.customDeserializeModel(model, initialRender.current);
		
				// Re-attach your node/link change listeners *before* setting the model
				deserializedModel.registerListener({
				nodesUpdated: () => {
					// Delay so links can settle before serializing
					const timeout = setTimeout(() => {
						onChange();
						setInitialize(false);
					}, 10);
					return () => clearTimeout(timeout);
				},
				linksUpdated: (event) => {
					const timeout = setTimeout(() => {
					event.link.registerListener({
						sourcePortChanged: () => {
						onChange();
						},
						targetPortChanged: (e) => {
							const sourceLink = e.entity as any;
							app.commands.execute(commandIDs.connectLinkToObviousPorts, { draggedLink: sourceLink });
							onChange();
						},
						entityRemoved: () => {
						onChange();
						}

					});
					}, 100);
					return () => clearTimeout(timeout);
				}
				});
		
				xircuitsApp.getDiagramEngine().setModel(deserializedModel);
				clearSearchFlags();
				CustomPortModel.attachEngine(deserializedModel, engine);

				// On the first load, clear undo history and register global engine listeners
				if (initialRender.current) {
					currentContext.model.sharedModel.clearUndoHistory();
					xircuitsApp.getDiagramEngine().registerListener({
						droppedLink: (event) => showComponentPanelFromLink(event),
						hidePanel: () => hidePanel(),
						onChange: () => onChange()
					});
				initialRender.current = false;
				setCanvasLoaded(true);
			}
			} catch (e) {
				showErrorMessage('Error', `An error occurred: ${e.message}`);
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

	const getNodesConnectedOnAtLeastOneSide = (): NodeModel[] => {
		const nodes = engine.getModel().getNodes();

		return nodes.filter((node: any) => {
			const inPorts  = node.portsIn  ?? [];
			const outPorts = node.portsOut ?? [];

			const allPorts = (inPorts.length || outPorts.length)
			? [...inPorts, ...outPorts]
			: Object.values(node.getPorts?.() ?? {});

			const hasAny = allPorts.some((p: any) => Object.keys(p.getLinks()).length > 0);
			return hasAny;
		});
		};
		
	const checkAllNodesConnected = (): boolean | null => {
		let allNodes = getAllNodesFromStartToFinish();
		let lastNode = allNodes[allNodes.length - 1];

		if (lastNode['name'] != 'Finish') {
			// When last node is not Finish node, check failed and show error tooltip
			lastNode.getOptions().extras["borderColor"] = "red";
			lastNode.setSelected(true);
			const message = `Please make sure this "${lastNode['name']}" node ends with a "Finish" node.`;
			showNodeCenteringNotification(message, lastNode.getID(), engine);
			return false;
		}
		return true;
	}

	const checkAllCompulsoryInPortsConnected = (): boolean | null => {
		let allNodes = getNodesConnectedOnAtLeastOneSide();
		for (let i = 0; i < allNodes.length; i++) {
			for (let k = 0; k < allNodes[i]["portsIn"].length; k++) {
				let node = allNodes[i]["portsIn"][k]
				if (node.getOptions()["label"].startsWith("★") && Object.keys(node.getLinks()).length == 0) {
					allNodes[i].getOptions().extras["borderColor"] = "red";
					allNodes[i].setSelected(true);
					const message = "Please make sure the [★]COMPULSORY InPorts are connected.";
					showNodeCenteringNotification(message, allNodes[i].getID(), engine);
					return false;
				}
			}
		}
		return true;
	}

	const triggerLoadingAnimation = async (
		operationPromise, 
		{ 	loadingMessage = 'Xircuits loading...', 
			loadingDisplayDuration = 1000, 
			showLoadingAfter = 100 } = {}
	  ) => {
		if (shell.currentWidget?.id !== widgetId) {
		  return;
		}
	  
		let shouldSetLoading = false;
	  
		setLoadingMessage(loadingMessage);
	  
		// Start a timer that will check if the operation exceeds showLoadingAfter
		const startTimer = setTimeout(() => {
		  shouldSetLoading = true;
		  setIsLoading(true);
		}, showLoadingAfter);
	  
		await operationPromise;
	  
		// Clear the start timer as the operation has completed
		clearTimeout(startTimer);
	  
		if (shouldSetLoading) {
		  // If loading was started, ensure it stays for the minimum loading time
		  const minTimer = setTimeout(() => setIsLoading(false), loadingDisplayDuration);
		  // Clear the minimum timer to prevent memory leaks in case the component unmounts
		  return () => clearTimeout(minTimer);
		} else {
		  // If loading was not started, just ensure loading state is set to false
		  setIsLoading(false);
		}
	};

	const handleSaveClick = async () => {
		// Only save xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		checkAllCompulsoryInPortsConnected();  
		onChange()
		setInitialize(true);
		setSaved(true);
		await commands.execute(commandIDs.saveDocManager);
		Notification.success("Workflow saved successfully.", { autoClose: 3000 });
	}

	const handleCompileClick = async() => {
		// Only compile xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		let allNodesConnected = checkAllNodesConnected();

		if (!allNodesConnected) {
			const allNodes = getAllNodesFromStartToFinish();
			const lastNode = allNodes[allNodes.length - 1];
			const message = "Please connect all the nodes before compiling.";
			showNodeCenteringNotification(message, lastNode.getID(), engine);
			return;
		}
		checkAllCompulsoryInPortsConnected();  
		const success = await commands.execute(commandIDs.compileFile, { componentList });

		if (success) {
			setCompiled(true);
			Notification.success("Workflow compiled successfully.", { autoClose: 3000 });
		} else {
			Notification.error("Failed to generate compiled code. Please check console logs for more details.", { autoClose: 5000 });
		}
	};

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
			const all = getAllNodesFromStartToFinish();
			const last = all[all.length - 1];
			const message = "Please connect all the nodes before running.";
			showNodeCenteringNotification(message, last.getID(), engine);
			return;
		}
		if (!allCompulsoryNodesConnected) {
			return;
		}

		// Only compile when 'Run' is chosen
		if (runType == 'run') {
			commands.execute(commandIDs.compileFile, { componentList });
			setCompiled(true);
		}

		// Run Mode
		context.ready.then(async () => {
			const workflow_path = context.path;
			const model_path = workflow_path.split(".xircuits")[0] + ".py";
			let code = startRunOutputStr();
	
			let result;
	
			if (runType == 'run') {
				result = await handleLocalRunDialog();
				if (result.status === 'ok') {
				code += "%run " + model_path + result.args;
				commands.execute(commandIDs.executeToOutputPanel, { code });
				}
				else if (result.status === 'cancelled') {
				console.log("Run operation cancelled by user.");
				}
			}
			
			else if (runType == 'remote-run') {
				result = await handleRemoteRunDialog();
				if (result.status === 'ok') {
				code += buildRemoteRunCommand(model_path, result.args);
				commands.execute(commandIDs.executeToOutputPanel, { code });
				}
			}
			
			else if (runType === 'terminal-run') {
				commands.execute(commandIDs.executeToTerminal, {
					command: `xircuits run ${workflow_path}`
				});
			}
			
			else {
				console.log("Unknown runType or user cancelled.");
			}
		})
	}

	const handleRunClick = async () => {
		// Only run xircuit if it is currently in focus
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}
		if(runType == 'remote-run'){
			await getRemoteRunTypeFromConfig();
		}
		await saveAndCompileAndRun();
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
	const handleTriggerCanvasUpdate = async () => {
		if (shell.currentWidget?.id !== widgetId) {
		  return;
		}
		onChange();
	};

	const handleReloadAll = async () => {
		if (shell.currentWidget?.id !== widgetId) {
		  return;
		}

		await app.commands.execute(commandIDs.refreshComponentList);
		let allNodes = xircuitsApp.getDiagramEngine().getModel().getNodes();
		allNodes.forEach(node => node.setSelected(true));
		const reloadPromise = app.commands.execute(commandIDs.reloadNode);
	
		// Trigger loading animation
		await triggerLoadingAnimation(reloadPromise, { loadingMessage: 'Reloading all nodes...'});
		clearSearchFlags();
		console.log("Reload all complete.");
	};

	const handleToggleAllLinkAnimation = () => {
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		let powerMode = lowPowerMode;
		setLowPowerMode(!powerMode)
	}

	const handleToggleLightMode = () => {
		// This must be first to avoid unnecessary complication
		if (shell.currentWidget?.id !== widgetId) {
			return;
		}

		const newLightMode = !lightMode;

		const desiredTheme = newLightMode ? 'JupyterLab Light' : 'JupyterLab Dark';
		void app.commands.execute('apputils:change-theme', { theme: desiredTheme });
		// Delay to avoid visual mismatch while JupyterLab updates theme
		setTimeout(() => {
		setLightMode(newLightMode);
		}, 120);
	}

	// Helper function to compute argument nodes on demand
	const getArgumentNodes = (): {
		string: string[];
		int: string[];
		float: string[];
		boolean: string[];
		secret: string[];
		any: string[];
	} => {
		const nodesByType = {
		string: [] as string[],
		int: [] as string[],
		float: [] as string[],
		boolean: [] as string[],
		secret: [] as string[],
		any: [] as string[]
		};
	
		const allNodes = xircuitsApp.getDiagramEngine().getModel().getNodes();
		allNodes.forEach((node) => {
		const nodeName = node.getOptions()["name"];
		if (nodeName.startsWith("Argument ")) {
			const regEx = /\(([^)]+)\)/;
			const match = nodeName.match(regEx);
			if (!match) return;
			const argType = match[1];
			const parts = nodeName.split(": ");
			// Use the last part as the argument name (trim if needed)
			const argValue = parts[parts.length - 1].trim();
			// Make sure the type exists in our map
			if (nodesByType[argType] !== undefined) {
			nodesByType[argType].push(argValue);
			nodesByType[argType].sort();
			}
		}
		});
		return nodesByType;
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
	}

	const getRemoteRunTypeFromConfig = async () => {
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
	
		// Compare new configuration with previous
		if (JSON.stringify(configuration) !== JSON.stringify(prevRemoteConfiguration)) {
			// Configuration has changed, reset lastConfig
			setLastConfigs("");
			setPrevRemoteConfiguration(configuration);
		}
	
		setRemoteRunTypesCfg(configuration["run_types"]);
		setRemoteRunConfigs(configuration["run_types_config"]);
	};

	// fetch remote run config when toggling to remote run
	useEffect(() => {
			getRemoteRunTypeFromConfig();
	}, [runType]);


	const handleLocalRunDialog = async () => {
		// Recalculate argument nodes before showing the dialog
		const argNodes = getArgumentNodes();

		let title = 'Execute Workflow';
		const dialogOptions: Partial<Dialog.IOptions<any>> = {
			title,
			body: formDialogWidget(
			<LocalRunDialog
				childStringNodes={argNodes.string}
				childBoolNodes={argNodes.boolean}
				childIntNodes={argNodes.int}
				childFloatNodes={argNodes.float}
				childSecretNodes={argNodes.secret}
				childAnyNodes={argNodes.any}
			/>
			),
			buttons: [Dialog.cancelButton(), Dialog.okButton({ label: ('Start') })],
			focusNodeSelector: '#name'
		};
		const dialogResult = await showFormDialog(dialogOptions);
	
		if (dialogResult.button.label === 'Cancel') {
			// When Cancel is clicked on the dialog, just return
			return { status: 'cancelled' };
		}

		const date = new Date();
		xircuitLogger.info(`experiment name: ${date.toLocaleString()}`);

		const runCommand = [
			argNodes.string.filter(param => param !== "experiment name"),
			argNodes.boolean, argNodes.int, argNodes.float, argNodes.secret, argNodes.any
		].filter(it => !!it).reduce((s, nodes) => {
			return nodes
				.filter(param => !!dialogResult.value[param])
				.reduce((cmd, param) => {
					xircuitLogger.info(param + ": " + dialogResult.value[param]);
					let filteredParam = param.replace(/\s+/g, "_");
					return `${cmd} --${filteredParam} ${dialogResult.value[param]}`;
				}, s);
		}, "");

		return { status: 'ok', args: runCommand };
	};

	const handleRemoteRunDialog = async () => {
		// Recalculate argument nodes before showing the dialog
		const argNodes = getArgumentNodes();

		let title = 'Execute Workflow';
		const dialogOptions: Partial<Dialog.IOptions<any>> = {
			title,
			body: formDialogWidget(
			<RemoteRunDialog
				remoteRunTypes={remoteRunTypesCfg}
				remoteRunConfigs={remoteRunConfigs}
				lastConfig={lastConfig}
				childStringNodes={argNodes.string}
				childBoolNodes={argNodes.boolean}
				childIntNodes={argNodes.int}
				childFloatNodes={argNodes.float}
				childSecretNodes={argNodes.secret}
				childAnyNodes={argNodes.any}
			/>
			),
			buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Start' })],
			defaultButton: 1,
			focusNodeSelector: '#name'
		};
		const dialogResult = await showFormDialog(dialogOptions);

		if (dialogResult.button.label === 'Cancel') {
			// When Cancel is clicked on the dialog, just return
			return { status: 'cancelled' };
		}
		
		// Remember the last config chosen and set the chosen config to output
		let config;
		let remoteRunType = dialogResult["value"]['remoteRunType'] ?? "";
		let runConfig = dialogResult["value"]['remoteRunConfig'] ?? "";
		if (remoteRunConfigs.length !== 0) {
			remoteRunConfigs.forEach(cfg => {
				if (cfg.run_type === remoteRunType && cfg.run_config_name === runConfig) {
					config = { ...cfg, ...dialogResult["value"] };
					setLastConfigs(config);
				}
			});
		}

		return { status: 'ok', args: config };
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
		[fetchRemoteRunConfigSignal, getRemoteRunTypeFromConfig],
		[lockNodeSignal, handleLockClick],
		[triggerCanvasUpdateSignal, handleTriggerCanvasUpdate],
		[triggerLoadingAnimationSignal, triggerLoadingAnimation],
		[reloadAllNodesSignal, handleReloadAll],
		[toggleAllLinkAnimationSignal, handleToggleAllLinkAnimation],
		[toggleLightModeSignal, handleToggleLightMode],
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
				const dialogOptions = inputDialog({ title:boolTitle, oldValue:"", type:'boolean'});
				const dialogResult = await showFormDialog(dialogOptions);
				if (cancelDialog(dialogResult)) return;
				let boolValue = dialogResult["value"][boolTitle].toLowerCase();
				nodeType = boolValue === 'false' ? 'False' : 'True';
				break;
			case 'any':
			case 'dynalist':
			case 'dynatuple':
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
	const [contextMenuShown, setContextMenuShown] = useState(false);
	const [dontHidePanel, setDontHidePanel] = useState(false);
	const [componentPanelPosition, setComponentPanelPosition] = useState({ x: 0, y: 0 });
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
	const [nodePosition, setNodePosition] = useState<any>();
	const [looseLinkData, setLooseLinkData] = useState<any>({});
	const [isParameterLink, setIsParameterLink] = useState<boolean>(false);

	// Component & Action panel position
	const getPanelPosition = (event, caller) => {
		
		let menuDimension;

		if (caller === "ContextMenu") {
			// For context menu, calculate dimension based on visible options
			const menuOptionHeight = 30;
			let visibleOptions = getMenuOptionsVisibility(xircuitsApp.getDiagramEngine().getModel().getSelectedEntities());
			let numVisibleOptions = countVisibleMenuOptions(visibleOptions);
			menuDimension = {
				x: 105,
				y: menuOptionHeight * numVisibleOptions,
			};
		} else {
			// For other callers, set a fixed dimension
			menuDimension = {
				x: 105,
				y: 290,
			};
		}
	
		let newPanelPosition = calculatePanelSpawn(event, menuDimension);
	
		return newPanelPosition;
	}

	function clampToViewport(
		position: { x: number; y: number },
		menuDimension: { x: number; y: number }
	) {
		const padding = 8; // Some optional padding from the edges
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
	
		// If the menu extends beyond the right edge, shift it left
		if (position.x + menuDimension.x > viewportWidth) {
		position.x = viewportWidth - menuDimension.x - padding;
		}
	
		// If the menu extends beyond the bottom edge, shift it upward
		if (position.y + menuDimension.y > viewportHeight) {
		position.y = viewportHeight - menuDimension.y - padding;
		}
	
		// If the menu goes past the left edge, clamp to 0
		if (position.x < 0) {
		position.x = padding;
		}
	
		// If the menu goes past the top edge, clamp to 0
		if (position.y < 0) {
		position.y = padding;
		}
	
		return position;
	}
  
	const calculatePanelSpawn = (event, menuDimension) => {

		let newPanelPosition = {
		  x: event.pageX,
		  y: event.pageY
		};
	  
		const canvas = event.view;
		const newCenterPosition = {
		  x: canvas.innerWidth / 2,
		  y: canvas.innerHeight / 2
		};
	  
		let fileBrowserWidth = document.getElementsByClassName("jp-SidePanel")[0].parentElement.clientWidth;
		const tabWidth = document.getElementsByClassName("lm-TabBar")[0].clientWidth;
		const yOffset = 84;
	  
		// Quadrant-based shift
		if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
		  // Bottom right
		  newPanelPosition.x -= (fileBrowserWidth + tabWidth + menuDimension.x);
		  newPanelPosition.y -= (menuDimension.y + yOffset);
		} else if (newPanelPosition.x > newCenterPosition.x && newPanelPosition.y < newCenterPosition.y) {
		  // Top right
		  newPanelPosition.x -= (fileBrowserWidth + tabWidth + menuDimension.x);
		  newPanelPosition.y -= yOffset;
		} else if (newPanelPosition.x < newCenterPosition.x && newPanelPosition.y > newCenterPosition.y) {
		  // Bottom left
		  newPanelPosition.x -= (fileBrowserWidth + tabWidth);
		  newPanelPosition.y -= (menuDimension.y + yOffset);
		} else {
		  // Top left
		  newPanelPosition.x -= (fileBrowserWidth + tabWidth);
		  newPanelPosition.y -= yOffset;
		}
	  
		// clamp final position so we don't get clipped off-screen
		newPanelPosition = clampToViewport(newPanelPosition, menuDimension);
	  
		return newPanelPosition;
	  };

	// Show the component panel context menu
	const showComponentPanel = (event: React.MouseEvent<HTMLDivElement>) => {
		setContextMenuShown(false);
		setIsComponentPanelShown(false);

		const node_position = xircuitsApp.getDiagramEngine().getRelativeMousePoint(event);
		setNodePosition(node_position);
		let newPanelPosition = getPanelPosition(event, "ComponentPanel");
		setComponentPanelPosition(newPanelPosition);
		setIsComponentPanelShown(true);
	};

	// Show the component panel from dropped link
	const showComponentPanelFromLink = async (event) => {
		setContextMenuShown(false);
		setIsComponentPanelShown(false);
		const sourcePortName:string = event.link.sourcePort.options.name;
		const sourceNodeName:string = event.link.sourcePort.getParent().name;

		// Don't show panel when loose link from Literal Nodes
		if (sourceNodeName.includes("Literal ")) {
			return
		}

		if (sourcePortName.startsWith("parameter")) {
			// Don't show panel when loose link from parameter outPorts
			if (sourcePortName.includes("parameter-out")) {
				return
			}

			// Don't allow linking to a literal if there is already an established connection
			// checking for > 1 because the link we are connecting also counts
			if(Object.keys(event.sourcePort.links).length > 1){
				return;
			}
			// When loose link from type InPort, connect to its respective literal node
			connectLinkToItsLiteral(sourcePortName, event);
			return;
		}

		setLooseLinkData({link: event.link, sourcePort: event.sourcePort});
		setNodePosition(event.linkEvent);
		
		let newPanelPosition = getPanelPosition(event.linkEvent, "ComponentPanel");
		setComponentPanelPosition(newPanelPosition);
		setIsComponentPanelShown(true);
	};

	// Hide component and node action panel
	const hidePanel = () => {
		setIsComponentPanelShown(false);
		setContextMenuShown(false);
		setLooseLinkData(null);
		setIsParameterLink(false);
	};

	// Show the canvasContextMenu context menu
	const showCanvasContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
		// Disable the default context menu
		event.preventDefault();

		setContextMenuShown(false);
		setIsComponentPanelShown(false);

		const node_position = xircuitsApp.getDiagramEngine().getRelativeMousePoint(event);
		setNodePosition(node_position);

		let newPanelPosition = getPanelPosition(event, "ContextMenu")
		setContextMenuPosition(newPanelPosition);
		setContextMenuShown(true);
	};

	const preventDefault = (event) => {
		event.preventDefault();
	}
	const updateHoveredLink = (event: React.DragEvent | React.MouseEvent): string | null => {
		const linkId = LinkSplitManager.detectLinkUnderPointer(event.clientX, event.clientY);
		const model = xircuitsApp.getDiagramEngine().getModel();
		LinkSplitManager.setHover(linkId, model);
		return linkId;
	};

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
		if (node != null) {
			let point = xircuitsApp.getDiagramEngine().getRelativeMousePoint(event);
			const linkId = updateHoveredLink(event);

			if (linkId) {
				new SplitLinkCommand(
					xircuitsApp.getDiagramEngine().getModel(),
					node,
					linkId,
					point
				).execute();
				} else {
				node.setPosition(point);
				xircuitsApp.getDiagramEngine().getModel().addNode(node);
				}
			if (node["name"].startsWith("Argument ")) {
				setInitialize(true);
			}
			setSaved(false);
			setCompiled(false);
		}
	};

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if ((event.ctrlKey || event.metaKey) && event.target['tagName'] != 'g') {
			showComponentPanel(event);
			return;
		}
		if (dontHidePanel) {
			return;
		}
		hidePanel();
	};

	useEffect(() => {
		const canvas = xircuitsApp.getDiagramEngine().getCanvas()
		canvas.addEventListener('wheel', preventDefault);

		return () => {
			canvas.removeEventListener('wheel', preventDefault);
		}
	}, [xircuitsApp.getDiagramEngine().getCanvas()])

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
		  if (event.key === "Escape") {
			hidePanel();
		  }
		};
	
		document.addEventListener("keydown", handleEscape);
		return () => {
		  document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	const [translate, setTranslate] = useState({ x: 0, y: 0, scale: 1 });
	useEffect(() => {
		const canvas = xircuitsApp.getDiagramEngine().getCanvas();
		const observer = new MutationObserver(function(mutations) {
			//@ts-ignore
			const [_, x, y, scale] = canvas.firstChild.style.transform.match(/translate\((.+)px, (.+)px\) scale\((.+)\)/);
			setTranslate({ x: parseFloat(x), y: parseFloat(y), scale: parseFloat(scale) });
		});
		observer.observe(canvas.querySelector("svg"), { attributes: true, attributeFilter: ["style"] });

		// Change the observation target when things change.
		((new MutationObserver(function() {
			observer.disconnect();
			observer.observe(canvas.querySelector("svg"), { attributes: true, attributeFilter: ["style"] });
		})).observe(canvas, { childList: true }));

		return () => {
			observer.disconnect();
		};
	}, [xircuitsApp.getDiagramEngine().getCanvas()?.firstChild]);

return (
  <Body>
    {/* Search Overlay */}
    <SearchOverlay
	visible={showSearch}
	onMouseDownCapture={e => {
	  // only stop propagation if they clicked the backdrop, not the buttons
	if ((e.target as HTMLElement).tagName === 'INPUT') {
		e.stopPropagation();
	}
	}}
	onClick={e => {
	  // refocus the input if they clicked anywhere _inside_ the overlay
	searchInputRef.current?.focus();
	}}
		>
	<input
	ref={searchInputRef}
	type="text"
	value={searchText}
	onChange={onSearchChange}
	placeholder="Search..."
	autoFocus
	onKeyDownCapture={e => e.stopPropagation()}
	onKeyDown={e => e.stopPropagation()}
	onKeyUp={e => e.stopPropagation()}
		/>
		<button
			onClick={(e) => {
				e.stopPropagation();
				navigateMatch("prev");
			}}
			>
			&uarr;
			</button>

			<button
			onClick={(e) => {
				e.stopPropagation();
				navigateMatch("next");
			}}
			>
			&darr;
			</button>
			<span onMouseDown={e => e.stopPropagation()}>{currentMatch} of {matchCount}</span>
			<button
			className="close-search"
			onClick={e => {
			e.stopPropagation();
			setShowSearch(false);
			}}
			title="Close search"
		>
    ×
  	</button>
    </SearchOverlay>

			<Content>
				{isLoading && (
				<div className="loading-indicator">
					<div className="loading-gif-wrapper"></div>
					<div className="loading-text">{loadingMessage}</div>
				</div>
				)}
				<Layer
					onMouseMove={handleMouseMoveCanvas}
					onDrop={handleDropEvent}
					onDragOver={(event) => {
  					event.preventDefault();
  					updateHoveredLink(event);
					}}
					onMouseOver={preventDefault}
					onMouseUp={preventDefault}
					onMouseDown={preventDefault}
					onContextMenu={showCanvasContextMenu}
					onClick={handleClick}>
					{/* Display only after canvas is fully rendered */}
					<div style={{visibility: canvasLoaded ? 'visible' : 'hidden',
						height: '100%', width: '100%' }}>
						<XircuitsCanvasWidget translate={translate} >
							<CanvasWidget engine={xircuitsApp.getDiagramEngine()}/>
							{/* Add Component Panel(ctrl + left-click, dropped link) */}
							{isComponentPanelShown && (
								<div
									onMouseEnter={()=>setDontHidePanel(true)}
									onMouseLeave={()=>setDontHidePanel(false)}
									id='component-panel'
									style={{
										minHeight: 'auto',
										height: 'auto',
										boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
										top: componentPanelPosition.y,
										left: componentPanelPosition.x
									}}
									className="add-component-panel">
									<ComponentsPanel
										lab={app}
										eng={xircuitsApp.getDiagramEngine()}
										nodePosition={nodePosition}
										linkData={looseLinkData}
										isParameter={isParameterLink}
										key="component-panel"
									/>
								</div>
							)}
							{/* Node Action Panel(left-click) */}
							{contextMenuShown && (
								<div
									id='context-menu'
									style={{
										minHeight: 'auto',
										height: 'auto',
										boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
										top: contextMenuPosition.y,
										left: contextMenuPosition.x
									}}
									className="canvas-context-menu">
									<CanvasContextMenu
										app={app}
										engine={xircuitsApp.getDiagramEngine()}
										nodePosition={nodePosition}
									/>
								</div>
							)}
						</XircuitsCanvasWidget>
					</div>
				</Layer>
			</Content>

      <ZoomControls
				visible={showZoom || isHoveringControls}
				onMouseEnter={() => setIsHoveringControls(true)}
				onMouseLeave={() => setIsHoveringControls(false)}
			>
				<FixedZoomButton  onClick={handleZoomIn} title="Zoom In">
					<zoomInIcon.react />
				</FixedZoomButton >
				<FixedZoomButton  onClick={handleZoomOut} title="Zoom Out">
					<zoomOutIcon.react />
				</FixedZoomButton >
				<FixedZoomButton onClick={handleZoomToFit} title="Fit all nodes">
					<fitIcon.react />
				</FixedZoomButton>	
				</ZoomControls>
		</Body>
		
	);
}
