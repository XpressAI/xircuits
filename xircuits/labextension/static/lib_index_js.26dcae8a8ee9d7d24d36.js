"use strict";
(self["webpackChunkxircuits"] = self["webpackChunkxircuits"] || []).push([["lib_index_js"],{

/***/ "./lib/commands/CustomActionEvent.js":
/*!*******************************************!*\
  !*** ./lib/commands/CustomActionEvent.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomActionEvent": () => (/* binding */ CustomActionEvent)
/* harmony export */ });
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @projectstorm/react-canvas-core */ "webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");


class CustomActionEvent extends _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.Action {
    constructor(options) {
        super({
            type: _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.InputType.KEY_DOWN,
            fire: (event) => {
                const app = options.app;
                const keyCode = event.event.key;
                const ctrlKey = event.event.ctrlKey;
                if (ctrlKey && keyCode === 'z')
                    app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_1__.commandIDs.undo);
                if (ctrlKey && keyCode === 'y')
                    app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_1__.commandIDs.redo);
                if (ctrlKey && keyCode === 's')
                    app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_1__.commandIDs.saveXircuit);
                // Comment this first until the TODO below is fix
                // if (ctrlKey && keyCode === 'x') app.commands.execute(commandIDs.cutNode);
                // if (ctrlKey && keyCode === 'c') app.commands.execute(commandIDs.copyNode);
                // TODO: Fix this paste issue where it paste multiple times.
                // if (ctrlKey && keyCode === 'v') app.commands.execute(commandIDs.pasteNode);
                if (keyCode == 'Delete' || keyCode == 'Backspace')
                    app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_1__.commandIDs.deleteNode);
            }
        });
    }
}
//# sourceMappingURL=CustomActionEvent.js.map

/***/ }),

/***/ "./lib/commands/NodeActionCommands.js":
/*!********************************************!*\
  !*** ./lib/commands/NodeActionCommands.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addNodeActionCommands": () => (/* binding */ addNodeActionCommands)
/* harmony export */ });
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/CustomNodeModel */ "./lib/components/CustomNodeModel.js");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @projectstorm/react-diagrams */ "webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__);






/**
 * Add the commands for node actions.
 */
function addNodeActionCommands(app, tracker, translator) {
    const trans = translator.load('jupyterlab');
    const { commands, shell } = app;
    /**
     * Whether there is an active xircuits.
     */
    function isEnabled() {
        return (tracker.currentWidget !== null &&
            tracker.currentWidget === shell.currentWidget);
    }
    //Add command to undo
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.undo, {
        execute: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const model = widget.context.model.sharedModel;
            model.undo();
        },
        label: trans.__('Undo'),
        icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__.undoIcon,
        isEnabled: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const canUndo = widget.context.model.sharedModel.canUndo();
            return canUndo !== null && canUndo !== void 0 ? canUndo : false;
        }
    });
    //Add command to redo
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.redo, {
        execute: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const model = widget.context.model.sharedModel;
            model.redo();
        },
        label: trans.__('Redo'),
        icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__.redoIcon,
        isEnabled: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const canRedo = widget.context.model.sharedModel.canRedo();
            return canRedo !== null && canRedo !== void 0 ? canRedo : false;
        }
    });
    //Add command to cut node
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.cutNode, {
        execute: cutNode,
        label: trans.__('Cut'),
        icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__.cutIcon,
        isEnabled: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected;
            if (selectedEntities.length > 0) {
                isNodeSelected = true;
            }
            return isNodeSelected !== null && isNodeSelected !== void 0 ? isNodeSelected : false;
        }
    });
    //Add command to copy node
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.copyNode, {
        execute: copyNode,
        label: trans.__('Copy'),
        icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__.copyIcon,
        isEnabled: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected;
            if (selectedEntities.length > 0) {
                isNodeSelected = true;
            }
            return isNodeSelected !== null && isNodeSelected !== void 0 ? isNodeSelected : false;
        }
    });
    //Add command to paste node
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.pasteNode, {
        execute: pasteNode,
        label: trans.__('Paste'),
        icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__.pasteIcon,
        isEnabled: () => {
            const clipboard = JSON.parse(localStorage.getItem('clipboard'));
            let isClipboardFilled;
            if (clipboard) {
                isClipboardFilled = true;
            }
            return isClipboardFilled !== null && isClipboardFilled !== void 0 ? isClipboardFilled : false;
        }
    });
    //Add command to edit literal component
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.editNode, {
        execute: editLiteral,
        label: trans.__('Edit'),
        isEnabled: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected;
            lodash__WEBPACK_IMPORTED_MODULE_0__.forEach(selectedEntities, (model) => {
                if (model.getOptions()["name"].startsWith("Literal")) {
                    isNodeSelected = true;
                }
            });
            return isNodeSelected !== null && isNodeSelected !== void 0 ? isNodeSelected : false;
        }
    });
    //Add command to delete node
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.deleteNode, {
        execute: deleteNode,
        label: "Delete",
        isEnabled: () => {
            var _a;
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected;
            if (selectedEntities.length > 0) {
                isNodeSelected = true;
            }
            return isNodeSelected !== null && isNodeSelected !== void 0 ? isNodeSelected : false;
        }
    });
    //Add command to add node
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.addNode, {
        execute: (args) => {
            var _a;
            const node = args['node'];
            const nodePosition = args['nodePosition'];
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            node.setPosition(nodePosition);
            widget.xircuitsApp.getDiagramEngine().getModel().addNode(node);
        },
        label: trans.__('Add node')
    });
    //Add command to connect node given link
    commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.connectNode, {
        execute: (args) => {
            var _a;
            const targetNode = args['targetNode'];
            const sourceLink = args['sourceLink'];
            const isParameterLink = args['isParameterLink'];
            const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
            // Create new link to connect to new node automatically
            let newLink = new _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__.DefaultLinkModel();
            let sourcePort;
            let targetPort;
            // Get source link node port
            const linkPort = sourceLink.getSourcePort();
            // When '▶' of sourcePort from inPort, connect to '▶' outPort of target node
            if (linkPort.getOptions()['name'] == "in-0") {
                sourcePort = targetNode.getPorts()["out-0"];
                targetPort = linkPort;
            }
            else if (isParameterLink) {
                // When looseLink is connected to parameter node
                const parameterNodeName = targetNode.getOutPorts()[0].getOptions()['name'];
                sourcePort = targetNode.getPorts()[parameterNodeName];
                targetPort = linkPort;
            }
            else {
                // '▶' of sourcePort to '▶' of targetPort
                sourcePort = linkPort;
                targetPort = targetNode.getPorts()["in-0"];
            }
            newLink.setSourcePort(sourcePort);
            newLink.setTargetPort(targetPort);
            widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
        },
        label: trans.__('Link node')
    });
    function cutNode() {
        var _a;
        const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
        if (widget) {
            const engine = widget.xircuitsApp.getDiagramEngine();
            const selected = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            const copies = selected.map(entity => entity.clone().serialize());
            // TODO: Need to make this event working to be on the command manager, so the user can undo
            // and redo it.
            // engine.fireEvent(
            //     {
            //         nodes: selected,
            //         links: selected.reduce(
            //             (arr, node) => [...arr, ...node.getAllLinks()],
            //             [],
            //         ),
            //     },
            //     'entitiesRemoved',
            // );
            selected.forEach(node => node.remove());
            engine.repaintCanvas();
            localStorage.setItem('clipboard', JSON.stringify(copies));
        }
    }
    function copyNode() {
        var _a;
        const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
        if (widget) {
            const copies = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities().map(entity => entity.clone().serialize());
            localStorage.setItem('clipboard', JSON.stringify(copies));
        }
    }
    function pasteNode() {
        var _a;
        const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
        if (widget) {
            const engine = widget.xircuitsApp.getDiagramEngine();
            const model = widget.xircuitsApp.getDiagramEngine().getModel();
            const clipboard = JSON.parse(localStorage.getItem('clipboard'));
            if (!clipboard)
                return;
            model.clearSelection();
            const models = clipboard.map(serialized => {
                const modelInstance = model
                    .getActiveNodeLayer()
                    .getChildModelFactoryBank(engine)
                    .getFactory(serialized.type)
                    .generateModel({ initialConfig: serialized });
                modelInstance.deserialize({
                    engine: engine,
                    data: serialized,
                    registerModel: () => { },
                    getModel: function (id) {
                        throw new Error('Function not implemented.');
                    }
                });
                return modelInstance;
            });
            models.forEach(modelInstance => {
                const oldX = modelInstance.getX();
                const oldY = modelInstance.getY();
                modelInstance.setPosition(oldX + 10, oldY + 10);
                model.addNode(modelInstance);
                // Remove any empty/default node
                if (modelInstance.getOptions()['type'] == 'default')
                    model.removeNode(modelInstance);
                modelInstance.setSelected(true);
            });
            localStorage.setItem('clipboard', JSON.stringify(models.map(modelInstance => modelInstance.clone().serialize())));
            // TODO: Need to make this event working to be on the command manager, so the user can undo
            // and redo it.
            // engine.fireEvent({ nodes: models }, 'componentsAdded');
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
        }
    }
    function editLiteral() {
        var _a;
        const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
        if (widget) {
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            lodash__WEBPACK_IMPORTED_MODULE_0__.forEach(selectedEntities, (model) => {
                if (!model.getOptions()["name"].startsWith("Literal")) {
                    (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.showDialog)({
                        title: 'Only Literal Node can be edited',
                        buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.Dialog.warnButton({ label: 'OK' })]
                    });
                    return;
                }
                let node = null;
                let links = widget.xircuitsApp.getDiagramEngine().getModel()["layers"][0]["models"];
                let oldValue = model.getPorts()["out-0"].getOptions()["label"];
                // Prompt the user to enter new value
                let theResponse = window.prompt('Enter New Value (Without Quotes):', oldValue);
                if (theResponse == null || theResponse == "" || theResponse == oldValue) {
                    // When Cancel is clicked or no input provided, just return
                    return;
                }
                node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_5__.CustomNodeModel({ name: model["name"], color: model["color"], extras: { "type": model["extras"]["type"] } });
                node.addOutPortEnhance(theResponse, 'out-0');
                // Set new node to old node position
                let position = model.getPosition();
                node.setPosition(position);
                widget.xircuitsApp.getDiagramEngine().getModel().addNode(node);
                // Update the links
                for (let linkID in links) {
                    let link = links[linkID];
                    if (link["sourcePort"] && link["targetPort"]) {
                        let newLink = new _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__.DefaultLinkModel();
                        let sourcePort = node.getPorts()["out-0"];
                        newLink.setSourcePort(sourcePort);
                        // This to make sure the new link came from the same literal node as previous link
                        let sourceLinkNodeId = link["sourcePort"].getParent().getID();
                        let sourceNodeId = model.getOptions()["id"];
                        if (sourceLinkNodeId == sourceNodeId) {
                            newLink.setTargetPort(link["targetPort"]);
                        }
                        widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
                    }
                }
                // Remove old node
                model.remove();
            });
        }
    }
    function deleteNode() {
        var _a;
        const widget = (_a = tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content;
        if (widget) {
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            lodash__WEBPACK_IMPORTED_MODULE_0__.forEach(selectedEntities, (model) => {
                if (model.getOptions()["name"] !== "undefined") {
                    let modelName = model.getOptions()["name"];
                    const errorMsg = `${modelName} node cannot be deleted!`;
                    if (modelName !== 'Start' && modelName !== 'Finish') {
                        if (!model.isLocked()) {
                            model.remove();
                        }
                        else {
                            (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.showDialog)({
                                title: 'Locked Node',
                                body: errorMsg,
                                buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.Dialog.warnButton({ label: 'OK' })]
                            });
                        }
                    }
                    else {
                        (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.showDialog)({
                            title: 'Undeletable Node',
                            body: errorMsg,
                            buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.Dialog.warnButton({ label: 'OK' })]
                        });
                    }
                }
            });
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
        }
    }
}
//# sourceMappingURL=NodeActionCommands.js.map

/***/ }),

/***/ "./lib/components/CustomDiagramState.js":
/*!**********************************************!*\
  !*** ./lib/components/CustomDiagramState.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomDiagramState": () => (/* binding */ CustomDiagramState)
/* harmony export */ });
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @projectstorm/react-canvas-core */ "webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _DragNewLinkState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DragNewLinkState */ "./lib/components/DragNewLinkState.js");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @projectstorm/react-diagrams */ "webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _CustomPortModel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CustomPortModel */ "./lib/components/CustomPortModel.js");




class CustomDiagramState extends _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.State {
    constructor() {
        super({
            name: 'default-diagrams'
        });
        this.childStates = [new _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.SelectingState()];
        this.dragCanvas = new _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.DragCanvasState();
        this.dragNewLink = new _DragNewLinkState__WEBPACK_IMPORTED_MODULE_2__.DragNewLinkState({ allowLooseLinks: false });
        this.dragItems = new _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_1__.DragDiagramItemsState();
        // determine what was clicked on
        this.registerAction(new _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.Action({
            type: _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.InputType.MOUSE_DOWN,
            fire: (event) => {
                const element = this.engine.getActionEventBus().getModelForEvent(event);
                // the canvas was clicked on, transition to the dragging canvas state
                if (!element) {
                    this.transitionWithEvent(this.dragCanvas, event);
                }
                // initiate dragging a new link
                else if (element instanceof _CustomPortModel__WEBPACK_IMPORTED_MODULE_3__.CustomPortModel) {
                    this.transitionWithEvent(this.dragNewLink, event);
                }
                // move the items (and potentially link points)
                else {
                    this.transitionWithEvent(this.dragItems, event);
                }
            }
        }));
    }
}
//# sourceMappingURL=CustomDiagramState.js.map

/***/ }),

/***/ "./lib/components/CustomNodeFactory.js":
/*!*********************************************!*\
  !*** ./lib/components/CustomNodeFactory.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomNodeFactory": () => (/* binding */ CustomNodeFactory)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _CustomNodeModel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CustomNodeModel */ "./lib/components/CustomNodeModel.js");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @projectstorm/react-canvas-core */ "webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _CustomNodeWidget__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CustomNodeWidget */ "./lib/components/CustomNodeWidget.js");




class CustomNodeFactory extends _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__.AbstractReactFactory {
    constructor(app) {
        super('custom-node');
        this.app = app;
    }
    generateModel(initialConfig) {
        return new _CustomNodeModel__WEBPACK_IMPORTED_MODULE_2__.CustomNodeModel();
    }
    generateReactWidget(event) {
        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CustomNodeWidget__WEBPACK_IMPORTED_MODULE_3__.CustomNodeWidget, { engine: this.engine, node: event.model, app: this.app });
    }
}
//# sourceMappingURL=CustomNodeFactory.js.map

/***/ }),

/***/ "./lib/components/CustomNodeModel.js":
/*!*******************************************!*\
  !*** ./lib/components/CustomNodeModel.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomNodeModel": () => (/* binding */ CustomNodeModel)
/* harmony export */ });
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @projectstorm/react-diagrams */ "webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _CustomPortModel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CustomPortModel */ "./lib/components/CustomPortModel.js");


class CustomNodeModel extends _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__.DefaultNodeModel {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { type: 'custom-node' }));
        this.color = options.color || 'red';
        this.name = options.name || '';
        this.extras = options.extras || {};
    }
    serialize() {
        return Object.assign(Object.assign({}, super.serialize()), { color: this.color, name: this.name, extras: this.extras });
    }
    deserialize(event) {
        super.deserialize(event);
        this.color = event.data.color;
        this.name = event.data.name;
        this.extras = event.data.extras;
    }
    addOutPortEnhance(label, name, after = true, id) {
        //check if portID is passed, if not SR will generate a new port ID
        const p = (id) ? new _CustomPortModel__WEBPACK_IMPORTED_MODULE_1__.CustomPortModel({ in: false, name: name, label: label, id: id }) :
            new _CustomPortModel__WEBPACK_IMPORTED_MODULE_1__.CustomPortModel({ in: false, name: name, label: label });
        if (!after) {
            this.portsOut.splice(0, 0, p);
        }
        return this.addPort(p);
    }
    addInPortEnhance(label, name, after = true, id) {
        //check if portID is passed, if not SR will generate a new port ID
        const p = (id) ? new _CustomPortModel__WEBPACK_IMPORTED_MODULE_1__.CustomPortModel({ in: true, name: name, label: label, id: id }) :
            new _CustomPortModel__WEBPACK_IMPORTED_MODULE_1__.CustomPortModel({ in: true, name: name, label: label });
        if (!after) {
            this.portsOut.splice(0, 0, p);
        }
        return this.addPort(p);
    }
}
//# sourceMappingURL=CustomNodeModel.js.map

/***/ }),

/***/ "./lib/components/CustomNodeWidget.js":
/*!********************************************!*\
  !*** ./lib/components/CustomNodeWidget.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomNodeWidget": () => (/* binding */ CustomNodeWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @projectstorm/react-diagrams */ "webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_image_gallery_styles_css_image_gallery_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-image-gallery/styles/css/image-gallery.css */ "./node_modules/react-image-gallery/styles/css/image-gallery.css");
/* harmony import */ var react_image_gallery__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-image-gallery */ "webpack/sharing/consume/default/react-image-gallery/react-image-gallery");
/* harmony import */ var react_image_gallery__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_image_gallery__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_portal_tooltip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-portal-tooltip */ "webpack/sharing/consume/default/react-portal-tooltip/react-portal-tooltip");
/* harmony import */ var react_portal_tooltip__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_portal_tooltip__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var krc_pagination__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! krc-pagination */ "webpack/sharing/consume/default/krc-pagination/krc-pagination");
/* harmony import */ var krc_pagination__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(krc_pagination__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var krc_pagination_styles_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! krc-pagination/styles.css */ "./node_modules/krc-pagination/styles.css");
/* harmony import */ var react_toggle__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-toggle */ "webpack/sharing/consume/default/react-toggle/react-toggle");
/* harmony import */ var react_toggle__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_toggle__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");











var S;
(function (S) {
    S.Node = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
		background-color: ${(p) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		border: solid 2px ${(p) => (p.selected ? (p.borderColor == undefined ? 'rgb(0,192,255)' : p.borderColor) : 'black')};
	`;
    S.Title = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
	`;
    S.TitleName = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
		flex-grow: 1;
		padding: 5px 5px;
	`;
    S.Ports = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;
    S.PortsContainer = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
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
    S.ImageGalleryContainer = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
		width: 600px;
		height: 440px;
	`;
})(S || (S = {}));
/**
 * Default node that models the DefaultNodeModel. It creates two columns
 * for both all the input ports on the left, and the output ports on the right.
 */
class CustomNodeWidget extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    constructor() {
        super(...arguments);
        this.generatePort = (port) => {
            return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__.DefaultPortLabel, { engine: this.props.engine, port: port, key: port.getID() });
        };
        this.state = {
            isTooltipActive: false,
            nodeDeletable: false,
            imageGalleryItems: [
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
        /**
         * load more data from server when page changed
         * @param e
         */
        this.onPageChanged = e => {
            console.log(e.currentPage);
            let imageGalleryItems = this.props.node.getOptions().extras["imageGalleryItems"];
            //update imageGalleryItems after data loaded from server
        };
    }
    showTooltip() {
        this.setState({ isTooltipActive: true });
    }
    hideTooltip() {
        this.setState({ isTooltipActive: false });
    }
    handleClose() {
        let allNodes = this.props.engine.getModel().getNodes();
        delete allNodes[1].getOptions().extras["imageGalleryItems"];
        this.hideTooltip();
    }
    ;
    handleDeletableNode(key, event) {
        this.setState({
            [key]: event.target.checked
                ? this.props.node.setLocked(true)
                : this.props.node.setLocked(false),
        });
    }
    /**
     * Allow to edit Literal Component
     */
    handleEditLiteral() {
        if (!this.props.node.getOptions()["name"].startsWith("Literal")) {
            return;
        }
        this.props.app.commands.execute(_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_10__.commandIDs.editNode);
    }
    render() {
        if (this.props.node.getOptions().extras["tip"] != undefined && this.props.node.getOptions().extras["tip"] != "") {
            return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Node, { onMouseEnter: this.showTooltip.bind(this), onMouseLeave: this.hideTooltip.bind(this), ref: (element) => { this.element = element; }, borderColor: this.props.node.getOptions().extras["borderColor"], "data-default-node-name": this.props.node.getOptions().name, selected: this.props.node.isSelected(), background: this.props.node.getOptions().color },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement((react_portal_tooltip__WEBPACK_IMPORTED_MODULE_6___default()), { active: this.state.isTooltipActive, position: "top", arrow: "center", parent: this.element },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, this.props.node.getOptions().extras["tip"])),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Title, null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.TitleName, null, this.props.node.getOptions().name),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("label", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement((react_toggle__WEBPACK_IMPORTED_MODULE_9___default()), { className: 'lock', checked: this.props.node.isLocked(), onChange: this.handleDeletableNode.bind(this, 'nodeDeletable') }))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Ports, null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getInPorts(), this.generatePort)),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getOutPorts(), this.generatePort)))));
        }
        else if (this.props.node.getOptions().extras["imageGalleryItems"] != undefined) {
            return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Node, { onMouseEnter: this.showTooltip.bind(this), onMouseLeave: this.hideTooltip.bind(this), ref: (element) => { this.element = element; }, borderColor: this.props.node.getOptions().extras["borderColor"], "data-default-node-name": this.props.node.getOptions().name, selected: this.props.node.isSelected(), background: this.props.node.getOptions().color },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement((react_portal_tooltip__WEBPACK_IMPORTED_MODULE_6___default()), { active: this.state.isTooltipActive, position: "top", arrow: "center", parent: this.element },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close", onClick: this.handleClose.bind(this) },
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { "aria-hidden": "true" }, "\u00D7")),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.ImageGalleryContainer, null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement((react_image_gallery__WEBPACK_IMPORTED_MODULE_5___default()), { items: this.state.imageGalleryItems })),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(krc_pagination__WEBPACK_IMPORTED_MODULE_7__.Pagination, { totalRecords: 100, pageLimit: 5, pageNeighbours: 1, onPageChanged: this.onPageChanged })),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Title, null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.TitleName, null, this.props.node.getOptions().name)),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Ports, null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getInPorts(), this.generatePort)),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getOutPorts(), this.generatePort)))));
        }
        else if (this.props.node.getOptions()["name"] !== 'Start' && this.props.node.getOptions()["name"] !== 'Finish') {
            return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Node, { borderColor: this.props.node.getOptions().extras["borderColor"], "data-default-node-name": this.props.node.getOptions().name, selected: this.props.node.isSelected(), background: this.props.node.getOptions().color, onDoubleClick: this.handleEditLiteral.bind(this) },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Title, null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.TitleName, null, this.props.node.getOptions().name),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("label", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement((react_toggle__WEBPACK_IMPORTED_MODULE_9___default()), { className: 'lock', checked: this.props.node.isLocked(), onChange: this.handleDeletableNode.bind(this, 'nodeDeletable') }))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Ports, null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getInPorts(), this.generatePort)),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getOutPorts(), this.generatePort)))));
        }
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Node, { borderColor: this.props.node.getOptions().extras["borderColor"], "data-default-node-name": this.props.node.getOptions().name, selected: this.props.node.isSelected(), background: this.props.node.getOptions().color },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Title, null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.TitleName, null, this.props.node.getOptions().name)),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.Ports, null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getInPorts(), this.generatePort)),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(S.PortsContainer, null, lodash__WEBPACK_IMPORTED_MODULE_1__.map(this.props.node.getOutPorts(), this.generatePort)))));
    }
}
//# sourceMappingURL=CustomNodeWidget.js.map

/***/ }),

/***/ "./lib/components/CustomPortModel.js":
/*!*******************************************!*\
  !*** ./lib/components/CustomPortModel.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomPortModel": () => (/* binding */ CustomPortModel)
/* harmony export */ });
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @projectstorm/react-diagrams */ "webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__);

/**
 * @author wenfeng xu
 * custom port model enable it can execute some rule
 * before it can link to another
 */
class CustomPortModel extends _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__.DefaultPortModel {
    constructor() {
        super(...arguments);
        /**
         * the qty of ports of parameter node link to the same port in other node can
         * not be more than one
         * @param thisPort
         * @param port
         */
        this.canParameterLinkToPort = (thisPort, port) => {
            let thisNode = this.getNode();
            let thisNodeModelType = thisNode.getOptions()["extras"]["type"];
            let thisName = port.getName();
            if (this.isParameterNode(thisNodeModelType) == true) {
                // if the port you are trying to link ready has other links
                console.log("port name: ", thisName);
                console.log("parameter port: ", port.getNode().getInPorts());
                if (Object.keys(port.getLinks()).length > 0) {
                    port.getNode().getOptions().extras["borderColor"] = "red";
                    port.getNode().getOptions().extras["tip"] = "Port has other link";
                    port.getNode().setSelected(true);
                    return false;
                }
                if (!thisName.startsWith("parameter")) {
                    port.getNode().getOptions().extras["borderColor"] = "red";
                    port.getNode().getOptions().extras["tip"] = "Port linked is not parameter, please link a non parameter node to it";
                    port.getNode().setSelected(true);
                    return false;
                }
                for (let i = 0; i < port.getNode().getInPorts().length; i++) {
                    let thisLinkedID = port.getNode().getInPorts()[i].getOptions()["id"];
                    if (port.getID() == thisLinkedID)
                        var index = i;
                }
                let thisLinkedName = port.getNode().getInPorts()[index].getOptions()["name"];
                let regEx = /\-([^-]+)\-/;
                let result = thisLinkedName.match(regEx);
                if (thisNodeModelType != result[1]) {
                    port.getNode().getOptions().extras["borderColor"] = "red";
                    port.getNode().getOptions().extras["tip"] = "Port linked not correct data type (" + result[1] + ")";
                    port.getNode().setSelected(true);
                    //tested - add stuff
                    return false;
                }
            }
            else {
                if (thisName.startsWith("parameter")) {
                    // Skip 'any' type check
                    if (thisName.includes('any')) {
                        return;
                    }
                    port.getNode().getOptions().extras["borderColor"] = "red";
                    port.getNode().getOptions().extras["tip"] = "Node link to this port must be a hyperparameter/literal";
                    port.getNode().setSelected(true);
                    return false;
                }
                else if (Object.keys(port.getLinks()).length > 0) {
                    port.getNode().getOptions().extras["borderColor"] = "red";
                    port.getNode().getOptions().extras["tip"] = "Port has link, please delete the current link to proceed";
                    port.getNode().setSelected(true);
                    return false;
                }
                //return(!(thisName.startsWith("parameter")) && !(Object.keys(port.getLinks()).length > 0));
            }
            port.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
            delete port.getNode().getOptions().extras["tip"];
            thisPort.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
            delete thisPort.getNode().getOptions().extras["tip"];
            return true;
        };
        this.isParameterNode = (nodeModelType) => {
            return (nodeModelType === 'boolean' ||
                nodeModelType === 'int' ||
                nodeModelType === 'float' ||
                nodeModelType === 'string' ||
                nodeModelType === 'list' ||
                nodeModelType === 'tuple' ||
                nodeModelType === 'dict');
        };
        this.canTriangleLinkToTriangle = (thisPort, port) => {
            let portLabel = port.getOptions()["label"];
            let thisPortLabel = this.options["label"];
            let thisNode = this.getNode();
            let node = port.getNode();
            let thisNodeModelType = thisNode.getOptions()["extras"]["type"];
            if (this.isParameterNode(thisNodeModelType)) {
                port.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
                delete port.getNode().getOptions().extras["tip"];
                thisPort.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
                delete thisPort.getNode().getOptions().extras["tip"];
                return true;
            }
            if (!(thisPortLabel.endsWith('▶')) && portLabel != '▶') {
                port.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
                delete port.getNode().getOptions().extras["tip"];
                thisPort.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
                delete thisPort.getNode().getOptions().extras["tip"];
                return true;
            }
            else {
                return (portLabel === '▶' && thisPortLabel.endsWith('▶') && !(Object.keys(thisPort.getLinks()).length > 1));
            }
        };
        this.getCircularReplacer = () => {
            var seen = [];
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.indexOf(value) >= 0) {
                        return;
                    }
                    seen.push(value);
                }
                return value;
            };
        };
        this.checkLinkDirection = (thisPort, port) => {
            // currently only checking if it is an in or out port from its alignment
            return ((thisPort.getOptions()["alignment"] === "right") &&
                (port.getOptions()["alignment"] === "left"));
        };
        this.checkExecutionLoop = (thisPort, port) => {
            let nodeIDList = [];
            let sourceNode = thisPort.getParent();
            let targetNode = port.getParent();
            let nodeType = sourceNode.getOptions()["extras"]["type"];
            nodeIDList.push(sourceNode.getID(), targetNode.getID());
            //console.log("sourceNode is:", sourceNode.getOptions()["name"], "\ntargetNode is:", targetNode.getOptions()["name"]);
            while ((sourceNode != null) &&
                nodeType != 'Start' &&
                nodeType != 'boolean' &&
                nodeType != 'int' &&
                nodeType != 'float' &&
                nodeType != 'string' &&
                nodeType != 'list' &&
                nodeType != 'tuple' &&
                nodeType != 'dict') {
                //console.log("Curent sourceNode:", sourceNode.getOptions()["name"]);
                let inPorts = sourceNode.getInPorts();
                // a node may have multiple ports. Iterate and find "▶"
                for (let i = 0; i <= inPorts.length; i++) {
                    let portLabel = inPorts[i].getOptions()["label"];
                    if (portLabel === "▶") {
                        let portLink = inPorts[i].getLinks();
                        //check if port has any links
                        if (Object.keys(portLink).length !== 1) {
                            if (Object.keys(portLink).length > 1) {
                                console.log("zombie link detected");
                            }
                            //console.log("sourceNode:", sourceNode.getOptions()["name"], "has no in-links!");
                            sourceNode = null;
                            break;
                        }
                        else {
                            let portLinkKey = Object.keys(portLink).toString();
                            sourceNode = portLink[portLinkKey].getSourcePort().getParent();
                            nodeType = sourceNode.getOptions()["extras"]["type"];
                            if (nodeIDList.includes(sourceNode.getID())) {
                                console.log("Loop detected at", sourceNode.getOptions()["name"]);
                                return false;
                            }
                            nodeIDList.push(sourceNode.getID());
                            break;
                        }
                    }
                }
            }
            while ((targetNode != null) && targetNode.getOptions()["name"] != "Finish") {
                //console.log("Curent targetNode:", targetNode.getOptions()["name"]);
                let outPorts = targetNode.getOutPorts();
                // a node may have multiple ports. Iterate and find "▶"
                for (let i = 0; i <= outPorts.length; i++) {
                    let portLabel = outPorts[i].getOptions()["label"];
                    if (portLabel === "▶") {
                        let portLink = outPorts[i].getLinks();
                        //check if port has any links
                        if (Object.keys(portLink).length !== 1) {
                            if (Object.keys(portLink).length > 1) {
                                console.log("zombie link detected");
                            }
                            //console.log("targetNode:", targetNode.getOptions()["name"], "has no out-links!");
                            targetNode = null;
                            break;
                        }
                        else {
                            let portLinkKey = Object.keys(portLink).toString();
                            targetNode = portLink[portLinkKey].getTargetPort().getParent();
                            if (nodeIDList.includes(targetNode.getID())) {
                                console.log("Loop detected at", targetNode.getOptions()["name"]);
                                return false;
                            }
                            nodeIDList.push(targetNode.getID());
                            break;
                        }
                    }
                }
            }
            return true;
        };
    }
    canLinkToPort(port) {
        if (port instanceof _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__.DefaultPortModel) {
            if (this.options.in === port.getOptions().in) {
                port.getNode().getOptions().extras["borderColor"] = "red";
                port.getNode().getOptions().extras["tip"] = "in not connected to in";
                port.getNode().setSelected(true);
                console.log("in not connected to in");
                // tested
                return false;
            }
        }
        let canParameterLinkToPort = this.canParameterLinkToPort(this, port);
        if (canParameterLinkToPort == false) {
            console.log("Parameter Link To Port failed.");
            return false;
        }
        let canTriangleLinkToTriangle = this.canTriangleLinkToTriangle(this, port);
        if (canTriangleLinkToTriangle == false) {
            port.getNode().getOptions().extras["borderColor"] = "red";
            port.getNode().getOptions().extras["tip"] = "Triangle must be linked to triangle";
            port.getNode().setSelected(true);
            console.log("triangle to triangle failed.");
            //tested
            return false;
        }
        let checkLinkDirection = this.checkLinkDirection(this, port);
        if (checkLinkDirection == false) {
            port.getNode().getOptions().extras["borderColor"] = "red";
            port.getNode().getOptions().extras["tip"] = "Port should be created from outPort [right] to inPort [left]";
            port.getNode().setSelected(true);
            console.log("Port should be created from outPort [right] to inPort [left]");
            return false;
        }
        let checkExecutionLoop = this.checkExecutionLoop(this, port);
        if (checkExecutionLoop == false) {
            //console.log("Loop detected.");
            return false;
        }
        port.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
        delete port.getNode().getOptions().extras["tip"];
        this.getNode().getOptions().extras["borderColor"] = "rgb(0,192,255)";
        delete this.getNode().getOptions().extras["tip"];
        return true;
    }
}
//# sourceMappingURL=CustomPortModel.js.map

/***/ }),

/***/ "./lib/components/DragNewLinkState.js":
/*!********************************************!*\
  !*** ./lib/components/DragNewLinkState.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DragNewLinkState": () => (/* binding */ DragNewLinkState)
/* harmony export */ });
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @projectstorm/react-canvas-core */ "webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _CustomPortModel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CustomPortModel */ "./lib/components/CustomPortModel.js");


class DragNewLinkState extends _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.AbstractDisplacementState {
    constructor(options = {}) {
        super({ name: 'drag-new-link' });
        this.fireEvent = () => {
            //@ts-ignore
            this.engine.fireEvent({ link: this.link }, 'droppedLink');
        };
        this.config = Object.assign({ allowLooseLinks: true, allowLinksFromLockedPorts: false }, options);
        this.registerAction(new _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.Action({
            type: _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.InputType.MOUSE_DOWN,
            fire: (event) => {
                this.port = this.engine.getMouseElement(event.event);
                if (!this.config.allowLinksFromLockedPorts && this.port.isLocked()) {
                    this.eject();
                    return;
                }
                this.link = this.port.createLinkModel();
                // if no link is given, just eject the state
                if (!this.link) {
                    this.eject();
                    return;
                }
                this.link.setSelected(true);
                this.link.setSourcePort(this.port);
                this.engine.getModel().addLink(this.link);
                this.port.reportPosition();
            }
        }));
        this.registerAction(new _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.Action({
            type: _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_0__.InputType.MOUSE_UP,
            fire: (event) => {
                const model = this.engine.getMouseElement(event.event);
                // check to see if we connected to a new port
                if (model instanceof _CustomPortModel__WEBPACK_IMPORTED_MODULE_1__.CustomPortModel) {
                    if (this.port.canLinkToPort(model)) {
                        this.link.setTargetPort(model);
                        model.reportPosition();
                        this.engine.repaintCanvas();
                        return;
                    }
                    else {
                        this.link.remove();
                        this.engine.repaintCanvas();
                        return;
                    }
                }
                if (!this.config.allowLooseLinks) {
                    this.fireEvent();
                    this.link.remove();
                    this.engine.repaintCanvas();
                }
            }
        }));
    }
    /**
     * Calculates the link's far-end point position on mouse move.
     * In order to be as precise as possible the mouse initialXRelative & initialYRelative are taken into account as well
     * as the possible engine offset
     */
    fireMouseMoved(event) {
        const portPos = this.port.getPosition();
        const zoomLevelPercentage = this.engine.getModel().getZoomLevel() / 100;
        const engineOffsetX = this.engine.getModel().getOffsetX() / zoomLevelPercentage;
        const engineOffsetY = this.engine.getModel().getOffsetY() / zoomLevelPercentage;
        const initialXRelative = this.initialXRelative / zoomLevelPercentage;
        const initialYRelative = this.initialYRelative / zoomLevelPercentage;
        const linkNextX = portPos.x - engineOffsetX + (initialXRelative - portPos.x) + event.virtualDisplacementX;
        const linkNextY = portPos.y - engineOffsetY + (initialYRelative - portPos.y) + event.virtualDisplacementY;
        this.link.getLastPoint().setPosition(linkNextX, linkNextY);
        this.engine.repaintCanvas();
    }
}
//# sourceMappingURL=DragNewLinkState.js.map

/***/ }),

/***/ "./lib/components/RunSwitcher.js":
/*!***************************************!*\
  !*** ./lib/components/RunSwitcher.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RunSwitcher": () => (/* binding */ RunSwitcher)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);



/**
 * A toolbar widget that switches output types.
 */
class RunSwitcher extends _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ReactWidget {
    /**
     * Construct a new output type switcher.
     */
    constructor(widget) {
        super();
        /**
         * Handle `change` events for the HTMLSelect component.
         */
        this.handleChange = (event) => {
            let runType = event.target.value;
            this._output.runTypeXircuitSignal.emit({ runType });
            this.update();
        };
        this._output = widget;
    }
    render() {
        let value;
        return (react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.UseSignal, { signal: this._output.runTypeXircuitSignal }, (_, args) => {
            if (args !== undefined) {
                let runType = args["runType"];
                return (react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.HTMLSelect, { onChange: this.handleChange, value: runType, "aria-label": 'Run type', title: 'Select the run type' },
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement("option", { value: "run" }, "Run"),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement("option", { value: "run-dont-compile" }, "Run w/o Compile"),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement("option", { value: "spark-submit" }, "Spark Submit")));
            }
            // Only for rendering the first time
            return (react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.HTMLSelect, { onChange: this.handleChange, value: value, "aria-label": 'Run type', title: 'Select the run type' },
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("option", { value: "run" }, "Run"),
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("option", { value: "run-dont-compile" }, "Run w/o Compile"),
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("option", { value: "spark-submit" }, "Spark Submit")));
        }));
    }
}
//# sourceMappingURL=RunSwitcher.js.map

/***/ }),

/***/ "./lib/components/XircuitsApp.js":
/*!***************************************!*\
  !*** ./lib/components/XircuitsApp.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "XircuitsApplication": () => (/* binding */ XircuitsApplication)
/* harmony export */ });
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @projectstorm/react-diagrams */ "webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _CustomNodeFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CustomNodeFactory */ "./lib/components/CustomNodeFactory.js");
/* harmony import */ var _CustomNodeModel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./CustomNodeModel */ "./lib/components/CustomNodeModel.js");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @projectstorm/react-canvas-core */ "webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _commands_CustomActionEvent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../commands/CustomActionEvent */ "./lib/commands/CustomActionEvent.js");
/* harmony import */ var _CustomDiagramState__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CustomDiagramState */ "./lib/components/CustomDiagramState.js");






class XircuitsApplication {
    constructor(app) {
        this.diagramEngine = _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0___default()({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
        this.activeModel = new _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_0__.DiagramModel();
        this.diagramEngine.getNodeFactories().registerFactory(new _CustomNodeFactory__WEBPACK_IMPORTED_MODULE_2__.CustomNodeFactory(app));
        this.diagramEngine.getActionEventBus().registerAction(new _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__.ZoomCanvasAction({ inverseZoom: true }));
        this.diagramEngine.getActionEventBus().registerAction(new _commands_CustomActionEvent__WEBPACK_IMPORTED_MODULE_3__.CustomActionEvent({ app }));
        this.diagramEngine.getStateMachine().pushState(new _CustomDiagramState__WEBPACK_IMPORTED_MODULE_4__.CustomDiagramState());
        let startNode = new _CustomNodeModel__WEBPACK_IMPORTED_MODULE_5__.CustomNodeModel({ name: 'Start', color: 'rgb(255,102,102)', extras: { "type": "Start" } });
        startNode.addOutPortEnhance('▶', 'out-0');
        startNode.setPosition(100, 100);
        let finishedNode = new _CustomNodeModel__WEBPACK_IMPORTED_MODULE_5__.CustomNodeModel({ name: 'Finish', color: 'rgb(255,102,102)', extras: { "type": "Finish" } });
        finishedNode.addInPortEnhance('▶', 'in-0');
        finishedNode.setPosition(700, 100);
        this.activeModel.addAll(startNode, finishedNode);
        this.diagramEngine.setModel(this.activeModel);
    }
    getActiveDiagram() {
        return this.activeModel;
    }
    getDiagramEngine() {
        return this.diagramEngine;
    }
}
//# sourceMappingURL=XircuitsApp.js.map

/***/ }),

/***/ "./lib/components/xircuitBodyWidget.js":
/*!*********************************************!*\
  !*** ./lib/components/xircuitBodyWidget.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Body": () => (/* binding */ Body),
/* harmony export */   "Header": () => (/* binding */ Header),
/* harmony export */   "Content": () => (/* binding */ Content),
/* harmony export */   "Layer": () => (/* binding */ Layer),
/* harmony export */   "commandIDs": () => (/* binding */ commandIDs),
/* harmony export */   "BodyWidget": () => (/* binding */ BodyWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @projectstorm/react-canvas-core */ "webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30");
/* harmony import */ var _projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers_DemoCanvasWidget__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../helpers/DemoCanvasWidget */ "./lib/helpers/DemoCanvasWidget.js");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @projectstorm/react-diagrams */ "webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams");
/* harmony import */ var _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _CustomNodeModel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./CustomNodeModel */ "./lib/components/CustomNodeModel.js");
/* harmony import */ var _log_LogPlugin__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../log/LogPlugin */ "./lib/log/LogPlugin.js");
/* harmony import */ var _tray_library_Component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../tray_library/Component */ "./lib/tray_library/Component.js");
/* harmony import */ var _dialog_formDialogwidget__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../dialog/formDialogwidget */ "./lib/dialog/formDialogwidget.js");
/* harmony import */ var _dialog_FormDialog__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../dialog/FormDialog */ "./lib/dialog/FormDialog.js");
/* harmony import */ var _dialog_RunDialog__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../dialog/RunDialog */ "./lib/dialog/RunDialog.js");
/* harmony import */ var rc_dialog_assets_bootstrap_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-dialog/assets/bootstrap.css */ "./node_modules/rc-dialog/assets/bootstrap.css");
/* harmony import */ var _server_handler__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../server/handler */ "./lib/server/handler.js");
/* harmony import */ var _context_menu_ComponentsPanel__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../context-menu/ComponentsPanel */ "./lib/context-menu/ComponentsPanel.js");
/* harmony import */ var _tray_library_GeneralComponentLib__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../tray_library/GeneralComponentLib */ "./lib/tray_library/GeneralComponentLib.js");
/* harmony import */ var _context_menu_NodeActionsPanel__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../context-menu/NodeActionsPanel */ "./lib/context-menu/NodeActionsPanel.js");

















const Body = (_emotion_styled__WEBPACK_IMPORTED_MODULE_4___default().div) `
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
		height: 800px;
	`;
const Header = (_emotion_styled__WEBPACK_IMPORTED_MODULE_4___default().div) `
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;
const Content = (_emotion_styled__WEBPACK_IMPORTED_MODULE_4___default().div) `
		display: flex;
		flex-grow: 1;
	`;
const Layer = (_emotion_styled__WEBPACK_IMPORTED_MODULE_4___default().div) `
		position: relative;
		flex-grow: 1;
	`;
const commandIDs = {
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
    undo: 'Xircuit-editor:undo',
    redo: 'Xircuit-editor:redo',
    cutNode: 'Xircuit-editor:cut-node',
    copyNode: 'Xircuit-editor:copy-node',
    pasteNode: 'Xircuit-editor:paste-node',
    editNode: 'Xircuit-editor:edit-node',
    deleteNode: 'Xircuit-editor:delete-node',
    addNode: 'Xircuit-editor:add-node',
    connectNode: 'Xircuit-editor:connect-node',
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
    const [value, setValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}
const BodyWidget = ({ context, xircuitsApp, app, shell, commands, widgetId, serviceManager, saveXircuitSignal, compileXircuitSignal, runXircuitSignal, runTypeXircuitSignal, debugXircuitSignal, lockNodeSignal, breakpointXircuitSignal, currentNodeSignal, testXircuitSignal, continueDebugSignal, nextNodeDebugSignal, stepOverDebugSignal, terminateDebugSignal, stepInDebugSignal, stepOutDebugSignal, evaluateDebugSignal, debugModeSignal }) => {
    const [prevState, updateState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
    const forceUpdate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => updateState(prevState => prevState + 1), []);
    const [saved, setSaved] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [compiled, setCompiled] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [initialize, setInitialize] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
    const [nodesColor, setNodesColor] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [displaySavedAndCompiled, setDisplaySavedAndCompiled] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [displayDebug, setDisplayDebug] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [displayHyperparameter, setDisplayHyperparameter] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [sparkSubmitNodes, setSparkSubmitkNodes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
    const [stringNodes, setStringNodes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(["experiment name"]);
    const [intNodes, setIntNodes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [floatNodes, setFloatNodes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [boolNodes, setBoolNodes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [stringNodesValue, setStringNodesValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([""]);
    const [intNodesValue, setIntNodesValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([0]);
    const [floatNodesValue, setFloatNodesValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([0.00]);
    const [boolNodesValue, setBoolNodesValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([false]);
    const [componentList, setComponentList] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [runOnce, setRunOnce] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [displayRcDialog, setDisplayRcDialog] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [disableRcDialog, setDisableRcDialog] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [debugMode, setDebugMode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [inDebugMode, setInDebugMode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [currentIndex, setCurrentIndex] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(-1);
    const [runType, setRunType] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("run");
    const [addedArgSparkSubmit, setAddedArgSparkSubmit] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
    const xircuitLogger = new _log_LogPlugin__WEBPACK_IMPORTED_MODULE_6__.Log(app);
    const contextRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(context);
    const notInitialRender = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
    const onChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        if (contextRef.current.isReady) {
            let currentModel = xircuitsApp.getDiagramEngine().getModel().serialize();
            contextRef.current.model.fromString(JSON.stringify(currentModel, null, 4));
            setSaved(false);
        }
    }, []);
    const customDeserializeModel = (modelContext, diagramEngine) => {
        if (modelContext == null) {
            // When context empty, just return
            return;
        }
        let tempModel = new _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__.DiagramModel();
        let links = modelContext["layers"][0]["models"];
        let nodes = modelContext["layers"][1]["models"];
        let offsetX = modelContext["offsetX"];
        let offsetY = modelContext["offsetY"];
        let zoom = modelContext["zoom"];
        for (let nodeID in nodes) {
            let node = nodes[nodeID];
            let newNode = new _CustomNodeModel__WEBPACK_IMPORTED_MODULE_7__.CustomNodeModel({
                id: node.id, type: node.type, name: node.name, locked: node.locked,
                color: node.color, extras: node.extras
            });
            newNode.setPosition(node.x, node.y);
            for (let portID in node.ports) {
                let port = node.ports[portID];
                if (port.alignment == "right")
                    newNode.addOutPortEnhance(port.label, port.name, true, port.id);
                if (port.alignment == "left")
                    newNode.addInPortEnhance(port.label, port.name, true, port.id);
            }
            tempModel.addAll(newNode);
            diagramEngine.setModel(tempModel);
        }
        for (let linkID in links) {
            let link = links[linkID];
            if (link.sourcePort && link.targetPort) {
                let newLink = new _projectstorm_react_diagrams__WEBPACK_IMPORTED_MODULE_2__.DefaultLinkModel();
                let sourcePort = tempModel.getNode(link.source).getPortFromID(link.sourcePort);
                newLink.setSourcePort(sourcePort);
                let targetPort = tempModel.getNode(link.target).getPortFromID(link.targetPort);
                newLink.setTargetPort(targetPort);
                tempModel.addAll(newLink);
                diagramEngine.setModel(tempModel);
            }
        }
        tempModel.registerListener({
            // Detect changes when node is dropped or deleted
            nodesUpdated: () => {
                // Add delay for links to disappear 
                const timeout = setTimeout(() => {
                    onChange();
                    setInitialize(false);
                }, 10);
                return () => clearTimeout(timeout);
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
        });
        tempModel.setOffsetX(offsetX);
        tempModel.setOffsetY(offsetY);
        tempModel.setZoomLevel(zoom);
        return tempModel;
    };
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const currentContext = contextRef.current;
        const changeHandler = () => {
            const modelStr = currentContext.model.toString();
            if (!isJSON(modelStr)) {
                // When context can't be parsed, just return
                return;
            }
            try {
                if (notInitialRender.current) {
                    const model = currentContext.model.toJSON();
                    let deserializedModel = customDeserializeModel(model, xircuitsApp.getDiagramEngine());
                    xircuitsApp.getDiagramEngine().setModel(deserializedModel);
                }
                else {
                    // Clear undo history when first time rendering
                    notInitialRender.current = true;
                    currentContext.model.sharedModel.clearUndoHistory();
                    // Register engine listener just once
                    xircuitsApp.getDiagramEngine().registerListener({
                        droppedLink: event => showComponentPanelFromLink(event),
                        hidePanel: () => hidePanel()
                    });
                }
            }
            catch (e) {
                (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.showErrorMessage)('Error', react__WEBPACK_IMPORTED_MODULE_0___default().createElement("pre", null, e));
            }
        };
        currentContext.ready.then(changeHandler);
        currentContext.model.contentChanged.connect(changeHandler);
        return () => {
            currentContext.model.contentChanged.disconnect(changeHandler);
        };
    }, []);
    const isJSON = (str) => {
        try {
            return (JSON.parse(str) && !!str);
        }
        catch (e) {
            return false;
        }
    };
    const getBindingIndexById = (nodeModels, id) => {
        for (let i = 0; i < nodeModels.length; i++) {
            let nodeModel = nodeModels[i];
            if (nodeModel.getID() === id) {
                return i;
            }
        }
        return null;
    };
    const getTargetNodeModelId = (linkModels, sourceId) => {
        for (let i = 0; i < linkModels.length; i++) {
            let linkModel = linkModels[i];
            if (linkModel.getSourcePort().getNode().getID() === sourceId && linkModel.getTargetPort().getOptions()["label"] == '▶') {
                return linkModel.getTargetPort().getNode().getID();
            }
        }
        return null;
    };
    const getNodeModelByName = (nodeModels, name) => {
        for (let i = 0; i < nodeModels.length; i++) {
            let nodeModel = nodeModels[i];
            if (nodeModel.getOptions()["name"] === name) {
                return nodeModel;
            }
        }
        return null;
    };
    const getNodeModelById = (nodeModels, id) => {
        for (let i = 0; i < nodeModels.length; i++) {
            let nodeModel = nodeModels[i];
            if (nodeModel.getID() === id) {
                return nodeModel;
            }
        }
        return null;
    };
    const getAllNodesFromStartToFinish = () => {
        let model = xircuitsApp.getDiagramEngine().getModel();
        let nodeModels = model.getNodes();
        let startNodeModel = getNodeModelByName(nodeModels, 'Start');
        if (startNodeModel == null) {
            startNodeModel = getNodeModelByName(nodeModels, '🔴Start');
        }
        if (startNodeModel) {
            let sourceNodeModelId = startNodeModel.getID();
            let retNodeModels = [];
            retNodeModels.push(startNodeModel);
            while (getTargetNodeModelId(model.getLinks(), sourceNodeModelId) != null) {
                let getTargetNode = getTargetNodeModelId(model.getLinks(), sourceNodeModelId);
                if (getTargetNode) {
                    let nodeModel = getNodeModelById(nodeModels, getTargetNode);
                    if (nodeModel) {
                        sourceNodeModelId = nodeModel.getID();
                        retNodeModels.push(nodeModel);
                    }
                }
            }
            return retNodeModels;
        }
        return null;
    };
    const getPythonCompiler = (debuggerMode) => {
        let componentDB = new Map(componentList.map(x => [x["task"], x]));
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
            if (component["python_path"] != null)
                python_paths.add(component["python_path"]);
        }
        if (python_paths.size > 0) {
            pythonCode += "import sys\n";
        }
        python_paths.forEach((path) => {
            pythonCode += `sys.path.append("${path.replace(/\\/gi, "\\\\")}")\n`;
        });
        for (let componentName in uniqueComponents) {
            let component_exist = component_task.indexOf(componentName);
            let current_node;
            let package_name = "components";
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
            }
            else {
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
                let targetNodeId = getTargetNodeModelId(model.getLinks(), sourceNodeModelId);
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
                            if (label.startsWith("★")) {
                                const newLabel = label.split("★")[1];
                                label = newLabel;
                            }
                            if (label == '▶') {
                            }
                            else {
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
                                            // Make sure the node id match between connected link and source node
                                            // Skip Hyperparameter Components
                                        }
                                        else if (linkSourceNodeId == sourceNodeId && !sourceNodeName.startsWith("Hyperparameter")) {
                                            pythonCode += '    ' + bindingName + '.' + label + ' = ' + preBindingName + '.' + sourcePortLabel + '\n';
                                        }
                                        else {
                                            sourcePortLabel = sourcePortLabel.replace(/\s+/g, "_");
                                            sourcePortLabel = sourcePortLabel.toLowerCase();
                                            sourceNodeName = sourceNodeName.split(": ");
                                            let paramName = sourceNodeName[sourceNodeName.length - 1];
                                            paramName = paramName.replace(/\s+/g, "_");
                                            paramName = paramName.toLowerCase();
                                            pythonCode += '    ' + bindingName + '.' + label + '.value = args.' + paramName + '\n';
                                        }
                                    }
                                    else {
                                        pythonCode += '    ' + bindingName + '.' + label + ' = ' + preBindingName + '.' + sourcePortLabel + '\n';
                                    }
                                }
                            }
                        }
                        else {
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
            }
            else if (i == (allNodes.length - 2)) {
                pythonCode += '    ' + bindingName + '.next = ' + 'None\n';
            }
            else {
                pythonCode += '    ' + bindingName + '.next = ' + nextBindingName + '\n';
            }
        }
        if (debuggerMode == true)
            pythonCode += '    ' + 'debug_mode = args.debug_mode\n';
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
            }
            else {
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
                        let dateTimeStr = "\'\%Y-\%m-\%d \%H:\%M:\%S\'";
                        pythonCode += '    ' + "parser.add_argument('--" + stringParam + "', default=datetime.now().strftime(" + dateTimeStr + "), type=str)\n";
                    }
                    else {
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
    };
    const checkAllNodesConnected = () => {
        let nodeModels = xircuitsApp.getDiagramEngine().getModel().getNodes();
        for (let i = 0; i < nodeModels.length; i++) {
            let inPorts = nodeModels[i]["portsIn"];
            let j = 0;
            if (inPorts != 0) {
                if (inPorts[j].getOptions()["label"] == '▶' && Object.keys(inPorts[0].getLinks()).length != 0) {
                    continue;
                }
                else {
                    nodeModels[i].getOptions().extras["borderColor"] = "red";
                    nodeModels[i].getOptions().extras["tip"] = "Please make sure this node ▶ is properly connected ";
                    nodeModels[i].setSelected(true);
                    return false;
                }
            }
        }
        return true;
    };
    const checkAllCompulsoryInPortsConnected = () => {
        let allNodes = getAllNodesFromStartToFinish();
        for (let i = 0; i < allNodes.length; i++) {
            for (let k = 0; k < allNodes[i]["portsIn"].length; k++) {
                let node = allNodes[i]["portsIn"][k];
                if (node.getOptions()["label"].startsWith("★") && Object.keys(node.getLinks()).length == 0) {
                    allNodes[i].getOptions().extras["borderColor"] = "red";
                    allNodes[i].getOptions().extras["tip"] = "Please make sure the [★]COMPULSORY InPorts are connected ";
                    allNodes[i].setSelected(true);
                    return false;
                }
            }
        }
        return true;
    };
    const handleSaveClick = () => {
        var _a;
        // Only save xircuit if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        onChange();
        setInitialize(true);
        setSaved(true);
        commands.execute(commandIDs.saveDocManager);
    };
    const handleCompileClick = () => {
        var _a;
        // Only compile xircuit if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
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
    };
    const handleUnsaved = () => {
        onHide('displaySavedAndCompiled');
        handleSaveClick();
        handleCompileClick();
    };
    const saveAndCompileAndRun = async (debuggerMode) => {
        //This is to avoid running xircuits while in dirty state
        if (contextRef.current.model.dirty) {
            const dialogResult = await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.showDialog)({
                title: 'This xircuits contains unsaved changes.',
                body: 'To run the xircuits the changes need to be saved.',
                buttons: [
                    _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.Dialog.cancelButton(),
                    _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.Dialog.okButton({ label: 'Save and Run' })
                ]
            });
            if (dialogResult.button && dialogResult.button.accept === true) {
                await handleSaveClick();
            }
            else {
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
            let addArgsSparkSubmit = runArgs["addArgs"];
            if (runArgs) {
                commands.execute(commandIDs.executeToOutputPanel, { runCommand, runType, addArgsSparkSubmit });
            }
        });
    };
    const handleRunClick = async () => {
        var _a;
        // Only run xircuit if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        saveAndCompileAndRun(false);
    };
    const handleDebugClick = async () => {
        var _a;
        // Only debug xircuit if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        resetColorCodeOnStart(true);
        saveAndCompileAndRun(true);
        // let allNodes = diagramEngine.getModel().getNodes();
        // allNodes[1].getOptions().extras["imageGalleryItems"] = "xxx";
    };
    const handleLockClick = () => {
        var _a;
        // Only lock node if xircuits is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
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
    };
    const handleToggleBreakpoint = () => {
        var _a;
        // Only toggle breakpoint if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        xircuitsApp.getDiagramEngine().getModel().getNodes().forEach((item) => {
            if (item.getOptions()["selected"] == true) {
                let name = item.getOptions()["name"];
                if (name.startsWith("🔴")) {
                    item.getOptions()["name"] = name.split("🔴")[1];
                }
                else {
                    item.getOptions()["name"] = "🔴" + name;
                }
                item.setSelected(true);
                item.setSelected(false);
            }
        });
    };
    function delay(ms) {
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
    async function sendingRunCommand(command) {
        const dataToSend = { "command": command };
        try {
            const server_reply = await (0,_server_handler__WEBPACK_IMPORTED_MODULE_8__.requestAPI)('debug/enable', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            return server_reply;
        }
        catch (reason) {
            console.error(`Error on POST /xircuit/debug/enable ${dataToSend}.\n${reason}`);
        }
    }
    ;
    async function getConfig(request) {
        const dataToSend = { "config_request": request };
        try {
            const server_reply = await (0,_server_handler__WEBPACK_IMPORTED_MODULE_8__.requestAPI)('get/config', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            return server_reply;
        }
        catch (reason) {
            console.error(`Error on POST get/config ${dataToSend}.\n${reason}`);
        }
    }
    ;
    const runFromNodeToNode = async () => {
        if (!debugMode) {
            alert("Not in debug mode");
            return;
        }
        let allNodes = getAllNodesFromStartToFinish();
        let prevNode;
        let currentNode;
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
    };
    const handleToggleContinueDebug = async () => {
        var _a;
        // Only toggle continue if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        if (currentIndex == 0) {
            resetColorCodeOnStart(true);
        }
        await runFromNodeToNode();
    };
    const handleToggleNextNode = async () => {
        var _a;
        // Only toggle next node if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        if (!debugMode) {
            alert("Not in debug mode");
            return;
        }
        let allNodes = getAllNodesFromStartToFinish();
        let currentNode;
        let prevNode;
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
        }
        else {
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
    };
    const handleToggleStepOverDebug = async () => {
        var _a;
        // Only toggle step over if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        if (currentIndex == 0) {
            resetColorCodeOnStart(true);
        }
        await runFromNodeToNode();
    };
    const resetColorCodeOnStart = (onStart) => {
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
    };
    const handleToggleTerminateDebug = () => {
        var _a;
        // Only toggle continue if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        if (!debugMode) {
            return;
        }
        resetColorCodeOnStart(false);
        terminateExecution();
        setCurrentIndex(-1);
        setDebugMode(false);
        setInDebugMode(false);
        alert("Execution has been terminated.");
    };
    const handleToggleStepInDebug = () => {
        var _a;
        // Only toggle step in if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        alert("Step In");
    };
    const handleToggleStepOutDebug = () => {
        var _a;
        // Only toggle step out if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        alert("Step Out");
    };
    const handleToggleEvaluateDebug = () => {
        var _a;
        // Only toggle continue if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        alert("Evaluate Code");
    };
    const handleTestClick = () => {
        var _a;
        // Only test xircuit if it is currently in focus
        // This must be first to avoid unnecessary complication
        if (((_a = shell.currentWidget) === null || _a === void 0 ? void 0 : _a.id) !== widgetId) {
            return;
        }
        let node = new _CustomNodeModel__WEBPACK_IMPORTED_MODULE_7__.CustomNodeModel({ name: "Testing Node", color: 'rgb(255,240,240)', extras: { "type": "Testing" } });
        node.addInPortEnhance('▶', 'in-0');
        node.addOutPortEnhance('▶', 'out-0');
        node.setPosition(componentPanelposition);
        xircuitsApp.getDiagramEngine().getModel().addNode(node);
        // alert("Testing");
    };
    const hideRcDialog = () => {
        setDisplayRcDialog(false);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        // Only enable added arguments when in 'Spark Submit' mode
        if (runType == 'spark-submit') {
            setSparkSubmitkNodes("Added Arguments");
        }
        else {
            setSparkSubmitkNodes("");
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
                        }
                        else if (result[1] == 'Int') {
                            setIntNodes(intNodes => ([...intNodes, nodeText[nodeText.length - 1]].sort()));
                        }
                        else if (result[1] == 'Float') {
                            setFloatNodes(floatNodes => ([...floatNodes, nodeText[nodeText.length - 1]].sort()));
                        }
                        else if (result[1] == 'Boolean') {
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
        });
    }, [initialize, runType]);
    const handleRunDialog = async () => {
        var _a;
        let title = 'Run';
        const dialogOptions = {
            title,
            body: (0,_dialog_formDialogwidget__WEBPACK_IMPORTED_MODULE_9__.formDialogWidget)(react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_dialog_RunDialog__WEBPACK_IMPORTED_MODULE_10__.RunDialog, { lastAddedArgsSparkSubmit: addedArgSparkSubmit, childSparkSubmitNodes: sparkSubmitNodes, childStringNodes: stringNodes, childBoolNodes: boolNodes, childIntNodes: intNodes, childFloatNodes: floatNodes })),
            buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.Dialog.cancelButton(), _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.Dialog.okButton({ label: ('Start') })],
            defaultButton: 1,
            focusNodeSelector: '#name'
        };
        const dialogResult = await (0,_dialog_FormDialog__WEBPACK_IMPORTED_MODULE_11__.showFormDialog)(dialogOptions);
        if (dialogResult["button"]["label"] == 'Cancel') {
            // When Cancel is clicked on the dialog, just return
            return false;
        }
        let commandStr = ' ';
        // Added arguments for spark submit
        let addArgs = (_a = dialogResult["value"][sparkSubmitNodes]) !== null && _a !== void 0 ? _a : "";
        setAddedArgSparkSubmit(addArgs);
        stringNodes.forEach((param) => {
            if (param == 'experiment name') {
                var dt = new Date();
                let dateTime = `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;
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
        return { commandStr, addArgs };
    };
    const connectSignal = ([signal, handler]) => {
        (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
            signal.connect(handler);
            return () => {
                signal.disconnect(handler);
            };
        }, [signal, handler]);
    };
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
    const fetchComponentList = async () => {
        const response = await (0,_tray_library_Component__WEBPACK_IMPORTED_MODULE_12__["default"])(serviceManager);
        if (response.length > 0) {
            setComponentList([]);
        }
        setComponentList(response);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        let runType;
        runTypeXircuitSignal.connect((_, args) => {
            runType = args["runType"];
            setRunType(runType);
        });
    }, [runTypeXircuitSignal]);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        debugModeSignal.emit({
            debugMode,
            inDebugMode
        });
    }, [debugMode, inDebugMode]);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (!runOnce) {
            fetchComponentList();
        }
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const intervalId = setInterval(() => {
            fetchComponentList();
        }, 5000);
        return () => clearInterval(intervalId);
    }, [componentList]);
    const dialogFuncMap = {
        'displayDebug': setDisplayDebug,
        'displayHyperparameter': setDisplayHyperparameter,
        'displaySavedAndCompiled': setDisplaySavedAndCompiled
    };
    const onClick = (name) => {
        dialogFuncMap[`${name}`](true);
    };
    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
        if (name == "displayHyperparameter") {
            setStringNodes(["name"]);
            setIntNodes([]);
            setFloatNodes([]);
            setBoolNodes([]);
        }
    };
    /**Component Panel & Node Action Panel Context Menu */
    const [isComponentPanelShown, setIsComponentPanelShown] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [actionPanelShown, setActionPanelShown] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [componentPanelposition, setComponentPanelposition] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({ x: 0, y: 0 });
    const [actionPanelPosition, setActionPanelPosition] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({ x: 0, y: 0 });
    const [looseLinkData, setLooseLinkData] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)();
    const [isParameterLink, setIsParameterLink] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    // Show the component panel context menu
    const showComponentPanel = (event) => {
        // Disable the default context menu
        event.preventDefault();
        setActionPanelShown(false);
        setIsComponentPanelShown(false);
        const newPosition = {
            x: event.pageX,
            y: event.pageY,
        };
        setComponentPanelposition(newPosition);
        setIsComponentPanelShown(true);
    };
    // Show the component panel from dropped link
    const showComponentPanelFromLink = (event) => {
        setActionPanelShown(false);
        setIsComponentPanelShown(false);
        const linkName = event.link.sourcePort.options.name;
        if (linkName.startsWith("parameter")) {
            setIsParameterLink(true);
            // Don't show panel when loose link from parameter outPort
            if (linkName.includes("parameter-out")) {
                return;
            }
        }
        const newPosition = {
            x: event.link.points[1].position.x,
            y: event.link.points[1].position.y,
        };
        setLooseLinkData(event.link);
        setComponentPanelposition(newPosition);
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
    const showNodeActionPanel = (event) => {
        setActionPanelShown(false);
        setIsComponentPanelShown(false);
        const newPosition = {
            x: event.pageX,
            y: event.pageY,
        };
        setActionPanelPosition(newPosition);
        setActionPanelShown(true);
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Body, null,
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Content, null,
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Layer, { onDrop: (event) => {
                    var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                    let component_task = componentList.map(x => x["task"]);
                    let drop_node = component_task.indexOf(data.name);
                    let current_node;
                    let node = null;
                    if (drop_node != -1) {
                        current_node = componentList[drop_node];
                    }
                    if (current_node != undefined) {
                        if (current_node.header == "GENERAL") {
                            node = (0,_tray_library_GeneralComponentLib__WEBPACK_IMPORTED_MODULE_13__.GeneralComponentLibrary)({ name: data.name, color: current_node["color"], type: data.type });
                        }
                        else if (current_node.header == "ADVANCED") {
                            node = new _CustomNodeModel__WEBPACK_IMPORTED_MODULE_7__.CustomNodeModel({ name: data.name, color: current_node["color"], extras: { "type": data.type } });
                            node.addInPortEnhance('▶', 'in-0');
                            node.addOutPortEnhance('▶', 'out-0');
                            // TODO: Get rid of the remapping by using compatible type names everywhere
                            let type_name_remappings = {
                                "bool": "boolean",
                                "str": "string"
                            };
                            current_node["variables"].forEach(variable => {
                                let name = variable["name"];
                                let type = type_name_remappings[variable["type"]] || variable["type"];
                                switch (variable["kind"]) {
                                    case "InCompArg":
                                        node.addInPortEnhance(`★${name}`, `parameter-${type}-${name}`);
                                        break;
                                    case "InArg":
                                        node.addInPortEnhance(name, `parameter-${type}-${name}`);
                                        break;
                                    case "OutArg":
                                        node.addOutPortEnhance(name, `parameter-out-${type}-${name}`);
                                        break;
                                    default:
                                        console.warn("Unknown variable kind for variable", variable);
                                        break;
                                }
                            });
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
                }, onDragOver: (event) => {
                    event.preventDefault();
                }, onMouseOver: (event) => {
                    event.preventDefault();
                }, onMouseUp: (event) => {
                    event.preventDefault();
                }, onMouseDown: (event) => {
                    event.preventDefault();
                }, onContextMenu: showComponentPanel, onClick: (event) => {
                    hidePanel();
                    if (event.ctrlKey || event.metaKey) {
                        showNodeActionPanel(event);
                    }
                } },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_helpers_DemoCanvasWidget__WEBPACK_IMPORTED_MODULE_14__.DemoCanvasWidget, null,
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_projectstorm_react_canvas_core__WEBPACK_IMPORTED_MODULE_1__.CanvasWidget, { engine: xircuitsApp.getDiagramEngine() }))),
            isComponentPanelShown && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { style: { top: componentPanelposition.y, left: componentPanelposition.x }, className: "add-component-panel" },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_context_menu_ComponentsPanel__WEBPACK_IMPORTED_MODULE_15__["default"], { lab: app, eng: xircuitsApp.getDiagramEngine(), nodePosition: componentPanelposition, linkData: looseLinkData, isParameter: isParameterLink, key: "component-panel" }))),
            actionPanelShown && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { style: { top: actionPanelPosition.y, left: actionPanelPosition.x }, className: "node-action-context-menu" },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_context_menu_NodeActionsPanel__WEBPACK_IMPORTED_MODULE_16__.NodeActionsPanel, { app: app, eng: xircuitsApp.getDiagramEngine() }))))));
};
//# sourceMappingURL=xircuitBodyWidget.js.map

/***/ }),

/***/ "./lib/context-menu/ComponentsPanel.js":
/*!*********************************************!*\
  !*** ./lib/context-menu/ComponentsPanel.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Body": () => (/* binding */ Body),
/* harmony export */   "Content": () => (/* binding */ Content),
/* harmony export */   "default": () => (/* binding */ ComponentsPanel)
/* harmony export */ });
/* harmony import */ var _tray_library_Component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../tray_library/Component */ "./lib/tray_library/Component.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-accessible-accordion */ "webpack/sharing/consume/default/react-accessible-accordion/react-accessible-accordion");
/* harmony import */ var react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _TrayPanel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./TrayPanel */ "./lib/context-menu/TrayPanel.js");
/* harmony import */ var _TrayItemPanel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./TrayItemPanel */ "./lib/context-menu/TrayItemPanel.js");






const Body = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  min-height: 100%;
  background-color: black;
  height: 100%;
  overflow-y: auto;
`;
const Content = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    max-height: auto;
    'border-top': '4px solid #dfe2e5'
`;
async function fetchComponent(componentList) {
    let component_root = componentList.map(x => x["category"]);
    let headers = Array.from(new Set(component_root));
    let headerList = [];
    let headerList2 = [];
    let displayHeaderList = [];
    for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
        if (headers[headerIndex] == 'ADVANCED' || headers[headerIndex] == 'GENERAL') {
            headerList.push(headers[headerIndex]);
        }
        else {
            headerList2.push(headers[headerIndex]);
        }
    }
    if (headerList.length != 0) {
        headerList = headerList.sort((a, b) => a < b ? 1 : a > b ? -1 : 0);
        headers = [...headerList, ...headerList2];
        for (let headerIndex2 = 0; headerIndex2 < headers.length; headerIndex2++) {
            displayHeaderList.push({
                "task": headers[headerIndex2],
                "id": headerIndex2 + 1
            });
        }
    }
    return displayHeaderList;
}
function fetchAllowableComponents(props, componentList, headerList) {
    let allowComponentList = [];
    let allowHeaderList = [];
    // Get allowable components
    componentList.map((val) => {
        if (props.linkData != null) {
            if (props.isParameter == true) {
                // Only allow GENERAL components for parameter inPort
                if (val["category"].toString() == "GENERAL") {
                    allowComponentList.push(val);
                }
            }
            // Only allow ADVANCED components for '▶' port
            else if (val["category"].toString() != "GENERAL") {
                allowComponentList.push(val);
            }
        }
        // Allow all Components when right-clicking
        else {
            allowComponentList.push(val);
        }
    });
    // Get allowable components's header
    headerList.map((val) => {
        if (props.linkData != null) {
            if (props.isParameter == true) {
                // Only allow GENERAL components for parameter inPort
                if (val["task"].toString() == "GENERAL") {
                    allowHeaderList.push(val);
                }
            }
            // Only allow ADVANCED components for '▶' port
            else if (val["task"].toString() != "GENERAL") {
                allowHeaderList.push(val);
            }
        }
        // Allow all Components when right-clicking
        else {
            allowHeaderList.push(val);
        }
    });
    return { allowComponentList, allowHeaderList };
}
function ComponentsPanel(props) {
    const [componentList, setComponentList] = react__WEBPACK_IMPORTED_MODULE_0___default().useState([]);
    const [category, setCategory] = react__WEBPACK_IMPORTED_MODULE_0___default().useState([]);
    const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [runOnce, setRunOnce] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [allowableComponents, setAllowableComponents] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    let handleOnChange = (event) => {
        setSearchTerm("");
        setSearchTerm(event.target.value);
    };
    const fetchComponentList = async () => {
        // get the component list by sending the jupyterlab frontend and base path
        const response_1 = await (0,_tray_library_Component__WEBPACK_IMPORTED_MODULE_3__["default"])(props.lab.serviceManager);
        // get the header from the components
        const response_2 = await fetchComponent(response_1);
        const response_3 = await fetchAllowableComponents(props, response_1, response_2);
        // to ensure the component list is empty before setting the component list
        if (response_1.length > 0) {
            setAllowableComponents([]);
            setComponentList([]);
            setCategory([]);
        }
        setComponentList(response_1);
        setCategory(response_3.allowHeaderList);
        setAllowableComponents(response_3.allowComponentList);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (!runOnce) {
            fetchComponentList();
            setRunOnce(true);
        }
    }, [category, componentList]);
    function focusInput() {
        document.getElementById("add-component-input").focus();
    }
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Body, null,
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Content, null,
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrayPanel__WEBPACK_IMPORTED_MODULE_4__.TrayPanel, null,
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { onBlur: focusInput },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: 'title-panel' }, "Add Component"),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "search-input-panel" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", { id: 'add-component-input', type: "text", name: "", value: searchTerm, placeholder: "SEARCH", className: "search-input__text-input-panel", autoFocus: true, onChange: handleOnChange })),
                    allowableComponents.filter((val) => {
                        if (searchTerm != "" && val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return val;
                        }
                    }).map((val, i) => {
                        return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { key: `index-3-${i}`, className: "tray-search" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrayItemPanel__WEBPACK_IMPORTED_MODULE_5__.TrayItemPanel, { currentNode: val, app: props.lab, eng: props.eng, nodePosition: props.nodePosition, linkData: props.linkData, isParameter: props.isParameter })));
                    })),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.Accordion, { allowZeroExpanded: true }, category.filter((val) => {
                    if (searchTerm == "") {
                        return val;
                    }
                }).map((val) => {
                    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItem, { key: `index-1-${val["task"].toString()}`, className: 'accordion__item_panel' },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItemHeading, null,
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItemButton, { className: 'accordion__button_panel' }, val["task"])),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItemPanel, null, componentList.filter((componentVal) => {
                            if (searchTerm == "") {
                                return componentVal;
                            }
                        }).map((componentVal, i2) => {
                            if (componentVal["category"].toString().toUpperCase() == val["task"].toString()) {
                                return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { key: `index-1-${i2}` },
                                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrayItemPanel__WEBPACK_IMPORTED_MODULE_5__.TrayItemPanel, { currentNode: componentVal, app: props.lab, eng: props.eng, nodePosition: props.nodePosition, linkData: props.linkData, isParameter: props.isParameter })));
                            }
                        }))));
                }))))));
}
;
//# sourceMappingURL=ComponentsPanel.js.map

/***/ }),

/***/ "./lib/context-menu/NodeActionsPanel.js":
/*!**********************************************!*\
  !*** ./lib/context-menu/NodeActionsPanel.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActionPanel": () => (/* binding */ ActionPanel),
/* harmony export */   "NodeActionsPanel": () => (/* binding */ NodeActionsPanel)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");



const ActionPanel = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	width: 90px;
	height: 100px;
	border-color: #000;
	border-radius: 25px;
	border-top: 10px;
	z-index: 10;
`;
class NodeActionsPanel extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    hideNodeActionPanel() {
        //@ts-ignore
        this.props.eng.fireEvent({}, 'hidePanel');
    }
    ;
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(ActionPanel, { onClick: this.hideNodeActionPanel.bind(this) },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "option", onClick: () => {
                    this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__.commandIDs.cutNode);
                } }, "Cut"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "option", onClick: () => {
                    this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__.commandIDs.copyNode);
                } }, "Copy"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "option", onClick: () => {
                    this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__.commandIDs.pasteNode);
                } }, "Paste"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "option", onClick: () => {
                    this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__.commandIDs.editNode);
                } }, "Edit"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "option", onClick: () => {
                    this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__.commandIDs.deleteNode);
                } }, "Delete"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "option", onClick: () => {
                    this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__.commandIDs.undo);
                } }, "Undo"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "option", onClick: () => {
                    this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_2__.commandIDs.redo);
                } }, "Redo")));
    }
}
//# sourceMappingURL=NodeActionsPanel.js.map

/***/ }),

/***/ "./lib/context-menu/TrayItemPanel.js":
/*!*******************************************!*\
  !*** ./lib/context-menu/TrayItemPanel.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tray": () => (/* binding */ Tray),
/* harmony export */   "TrayItemPanel": () => (/* binding */ TrayItemPanel)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/CustomNodeModel */ "./lib/components/CustomNodeModel.js");
/* harmony import */ var _tray_library_GeneralComponentLib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../tray_library/GeneralComponentLib */ "./lib/tray_library/GeneralComponentLib.js");
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");





const Tray = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	color: white;
	font-family: Helvetica, Arial;
	padding: 2px;
	width: auto;
	margin: 2px;
	border: solid 1px ${(p) => p.color};
	border-radius: 2px;
	margin-bottom: 2px;
	cursor: pointer;
`;
class TrayItemPanel extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    selectedNode() {
        let current_node = this.props.currentNode;
        let node;
        if (current_node != undefined) {
            if (current_node.header == "GENERAL") {
                node = (0,_tray_library_GeneralComponentLib__WEBPACK_IMPORTED_MODULE_2__.GeneralComponentLibrary)({ name: current_node["task"], color: current_node["color"], type: current_node["type"] });
            }
            else {
                node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_3__.CustomNodeModel({ name: current_node["task"], color: current_node["color"], extras: { "type": current_node["type"] } });
                node.addInPortEnhance('▶', 'in-0');
                node.addOutPortEnhance('▶', 'out-0');
                let type_name_remappings = {
                    "bool": "boolean",
                    "str": "string"
                };
                current_node["variables"].forEach(variable => {
                    let name = variable["name"];
                    let type = type_name_remappings[variable["type"]] || variable["type"];
                    switch (variable["kind"]) {
                        case "InCompArg":
                            node.addInPortEnhance(`★${name}`, `parameter-${type}-${name}`);
                            break;
                        case "InArg":
                            node.addInPortEnhance(name, `parameter-${type}-${name}`);
                            break;
                        case "OutArg":
                            node.addOutPortEnhance(name, `parameter-out-${type}-${name}`);
                            break;
                        default:
                            console.warn("Unknown variable kind for variable", variable);
                            break;
                    }
                });
            }
        }
        return node;
    }
    addNode(node) {
        const nodePosition = this.props.nodePosition;
        this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.addNode, { node, nodePosition });
    }
    connectLink(node) {
        if (this.props.linkData == null) {
            return;
        }
        const targetNode = node;
        const sourceLink = this.props.linkData;
        const isParameterLink = this.props.isParameter;
        this.props.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_4__.commandIDs.connectNode, { targetNode, sourceLink, isParameterLink });
    }
    hidePanelEvent() {
        //@ts-ignore
        this.props.eng.fireEvent({}, 'hidePanel');
    }
    ;
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(Tray, { color: this.props.currentNode["color"] || "white", onClick: (event) => {
                if (event.ctrlKey || event.metaKey) {
                    const { commands } = this.props.app;
                    commands.execute('docmanager:open', {
                        path: this.props.currentNode["file_path"]
                    });
                    return;
                }
                let node = this.selectedNode();
                this.addNode(node);
                this.connectLink(node);
                this.hidePanelEvent();
                this.forceUpdate();
            }, className: "tray-item" }, this.props.currentNode["task"]));
    }
}
//# sourceMappingURL=TrayItemPanel.js.map

/***/ }),

/***/ "./lib/context-menu/TrayPanel.js":
/*!***************************************!*\
  !*** ./lib/context-menu/TrayPanel.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tray": () => (/* binding */ Tray),
/* harmony export */   "TrayPanel": () => (/* binding */ TrayPanel)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);


const Tray = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	min-width: 150px;
	border-radius: 11px;
	background: rgb(35, 35, 35);
	flex-grow: 1;
	width: 100px;
	flex-shrink: 1;
	max-height: auto;
`;
class TrayPanel extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    render() {
        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Tray, null, this.props.children);
    }
}
//# sourceMappingURL=TrayPanel.js.map

/***/ }),

/***/ "./lib/debugger/DebuggerWidget.js":
/*!****************************************!*\
  !*** ./lib/debugger/DebuggerWidget.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DebuggerWidget": () => (/* binding */ DebuggerWidget)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


/**
 * React component for a xircuits debugger.
 *
 * @returns The Debugger component
 */
const DebuggerComponent = ({ xircuitFactory, currentNode }) => {
    const [names, setNames] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const [ids, setIds] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const [types, setTypes] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const [pInLabels, setPInLabel] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [pOutLabels, setPOutLabel] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const notInitialRender = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(false);
    const handleCurrentNode = () => {
        let item = typeof currentNode["item"] === "undefined" ? "" : currentNode["item"];
        let item2 = typeof currentNode["item2"] === "undefined" ? "" : currentNode["item2"];
        let name = item.getOptions()["name"];
        let id = item.getOptions()["id"];
        let type = item.getOptions()["extras"]["type"];
        let pInList = [];
        let pInArgList = [], pOutArgList = [];
        let item_output = item2;
        if (typeof (item2) != "string") {
            item_output = item2["output"];
        }
        if (item_output != "") {
            if (item_output.includes("InArg ->") && item_output.includes("OutArg ->")) {
                let temp_out_arg = item_output.split("OutArg -> ");
                let temp_in_arg = temp_out_arg[0].split("InArg -> ");
                for (let i = 0; i < temp_in_arg[1].split("\t").length; i++) {
                    pInList.push(temp_in_arg[1].split("\t")[i]);
                }
                for (let i = 0; i < temp_out_arg[1].split("\t").length; i++) {
                    if (!temp_out_arg[1].split("\t")[i].includes(": None")) {
                        pInList.push(temp_out_arg[1].split("\t")[i]);
                    }
                }
            }
            else if (item_output.includes("InArg ->") && !item_output.includes("OutArg ->")) {
                for (let i = 0; i < item_output.split("InArg -> ")[1].split("\t").length; i++) {
                    pInList.push(item_output.split("InArg -> ")[1].split("\t")[i]);
                }
            }
            else if (!item_output.includes("InArg ->") && item_output.includes("OutArg ->")) {
                for (let i = 0; i < item_output.split("OutArg -> ")[1].split("\t").length; i++) {
                    if (!item_output.split("OutArg -> ")[1].split("\t")[i].includes(": None")) {
                        pInList.push(item_output.split("OutArg -> ")[1].split("\t")[i]);
                    }
                }
            }
        }
        item["portsIn"].forEach((element) => {
            if (element.getOptions()["label"] != "▶") {
                pInArgList.push(element.getOptions()["label"]);
            }
        });
        item["portsOut"].forEach((element) => {
            if (element.getOptions()["label"] != "▶") {
                pOutArgList.push(element.getOptions()["label"]);
            }
        });
        handleChanges(name, id, type, pInList, pOutArgList);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (notInitialRender.current) {
            handleCurrentNode();
        }
        else {
            notInitialRender.current = true;
        }
    }, [currentNode]);
    function handleChanges(name, id, type, pInLabel, pOutLabel) {
        setNames(name);
        setIds(id);
        setTypes(type);
        setPInLabel(pInLabel);
        setPOutLabel(pOutLabel);
    }
    return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { style: {
            minHeight: '800px', height: '100%', width: '100%', minWidth: '150px', flexGrow: 1, flexShrink: 1, margin: '7px', padding: '7px', fontSize: '14px'
        } },
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("b", null, "Selected Node")),
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("b", null, "Name:"),
            " ",
            names),
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("b", null, "Id:"),
            " ",
            ids),
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("b", null, "Type:"),
            " ",
            types),
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("b", null, "PortInLabel:"),
            " ",
            pInLabels.map((value, index) => (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", { key: index }, value.split("\n").map((value2, index2) => (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", { key: index2 }, value2))))))),
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("b", null, "PortOutLabel:"),
            " ",
            pOutLabels.map((pOutLabel, i) => (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", { key: i }, pOutLabel))))));
};
/**
 * A Debugger Widget that wraps a BreakpointComponent.
 */
class DebuggerWidget extends _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ReactWidget {
    /**
     * Constructs a new DebuggerWidget.
     */
    constructor(xircuitFactory) {
        super();
        this._xircuitFactory = xircuitFactory;
        this.addClass("jp-DebuggerWidget");
    }
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.UseSignal, { signal: this._xircuitFactory.currentNodeSignal }, (_, args) => {
            return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement(DebuggerComponent, { xircuitFactory: this._xircuitFactory, currentNode: args }));
        }));
    }
}
//# sourceMappingURL=DebuggerWidget.js.map

/***/ }),

/***/ "./lib/debugger/SidebarDebugger.js":
/*!*****************************************!*\
  !*** ./lib/debugger/SidebarDebugger.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DebuggerCommandIDs": () => (/* binding */ DebuggerCommandIDs),
/* harmony export */   "XircuitsDebuggerSidebar": () => (/* binding */ XircuitsDebuggerSidebar),
/* harmony export */   "DebuggerHeader": () => (/* binding */ DebuggerHeader),
/* harmony export */   "DebuggerToolbar": () => (/* binding */ DebuggerToolbar),
/* harmony export */   "XircuitsDebugger": () => (/* binding */ XircuitsDebugger)
/* harmony export */ });
/* harmony import */ var _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/translation */ "webpack/sharing/consume/default/@jupyterlab/translation");
/* harmony import */ var _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_translation__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_debugger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/debugger */ "webpack/sharing/consume/default/@jupyterlab/debugger");
/* harmony import */ var _jupyterlab_debugger__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_debugger__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");
/* harmony import */ var _DebuggerWidget__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DebuggerWidget */ "./lib/debugger/DebuggerWidget.js");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _ui_components_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ui-components/icons */ "./lib/ui-components/icons.js");







const DebuggerCommandIDs = {
    continue: 'Xircuits-debugger:continue',
    terminate: 'Xircuits-debugger:terminate',
    stepOver: 'Xircuits-debugger:next',
    stepIn: 'Xircuits-debugger:step-in',
    stepOut: 'Xircuits-debugger:step-out',
    evaluate: 'Xircuits-debugger:evaluate-code',
};
/**
 * A Xircuits Debugger sidebar.
 */
class XircuitsDebuggerSidebar extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.Panel {
    /**
     * Instantiate a new XircuitDebugger.Sidebar
     *
     * @param options The instantiation options for a XircuitDebugger.Sidebar
     */
    constructor(options) {
        super();
        const translator = options.translator || _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_0__.nullTranslator;
        const app = options.app;
        const xircuitFactory = options.widgetFactory;
        const trans = translator.load('jupyterlab');
        this.id = 'jp-debugger-sidebar';
        this.addClass('jp-DebuggerSidebar');
        this._body = new _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.SplitPanel();
        this._body.orientation = 'vertical';
        //   this._body.addClass('jp-DebuggerSidebar-body');
        this.addWidget(this._body);
        const content = new _DebuggerWidget__WEBPACK_IMPORTED_MODULE_4__.DebuggerWidget(xircuitFactory);
        const header = new DebuggerHeader(translator);
        const toolbarPanel = new DebuggerToolbar();
        let debugMode;
        let inDebugMode;
        xircuitFactory.debugModeSignal.connect((_, args) => {
            debugMode = args["debugMode"];
            inDebugMode = args["inDebugMode"];
            app.commands.notifyCommandChanged();
        });
        /**
         * Create a continue button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-continue', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: DebuggerCommandIDs.continue
        }));
        /**
         * Create a next node button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-next', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_5__.commandIDs.nextNode
        }));
        /**
         * Create a step over button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-step-over', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: DebuggerCommandIDs.stepOver
        }));
        /**
         * Create a breakpoint button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-breakpoint', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_5__.commandIDs.breakpointXircuit
        }));
        /**
         * Create a terminate button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-terminate', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: DebuggerCommandIDs.terminate
        }));
        /**
         * Create a step in button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-step-in', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: DebuggerCommandIDs.stepIn
        }));
        /**
         * Create a step out button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-step-out', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: DebuggerCommandIDs.stepOut
        }));
        /**
         * Create a evaluate code button toolbar item.
         */
        toolbarPanel.toolbar.addItem('xircuits-debugger-evaluate-code', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.CommandToolbarButton({
            commands: app.commands,
            id: DebuggerCommandIDs.evaluate
        }));
        // Add command signal to continue debugging xircuit
        app.commands.addCommand(DebuggerCommandIDs.continue, {
            caption: trans.__('Continue'),
            icon: _jupyterlab_debugger__WEBPACK_IMPORTED_MODULE_1__.Debugger.Icons.continueIcon,
            isEnabled: () => {
                return debugMode !== null && debugMode !== void 0 ? debugMode : false;
            },
            execute: args => {
                xircuitFactory.continueDebugSignal.emit(args);
            }
        });
        // Add command signal to toggle next node
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_5__.commandIDs.nextNode, {
            caption: trans.__('Next Node'),
            icon: _ui_components_icons__WEBPACK_IMPORTED_MODULE_6__.nextIcon,
            isEnabled: () => {
                return inDebugMode !== null && inDebugMode !== void 0 ? inDebugMode : false;
            },
            execute: args => {
                xircuitFactory.nextNodeDebugSignal.emit(args);
            }
        });
        // Add command signal to toggle step over 
        app.commands.addCommand(DebuggerCommandIDs.stepOver, {
            caption: trans.__('Step Over'),
            icon: _jupyterlab_debugger__WEBPACK_IMPORTED_MODULE_1__.Debugger.Icons.stepOverIcon,
            isEnabled: () => {
                return inDebugMode !== null && inDebugMode !== void 0 ? inDebugMode : false;
            },
            execute: args => {
                xircuitFactory.stepOverDebugSignal.emit(args);
            }
        });
        // Add command signal to toggle breakpoint
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_5__.commandIDs.breakpointXircuit, {
            caption: trans.__('Toggle Breakpoint'),
            icon: _ui_components_icons__WEBPACK_IMPORTED_MODULE_6__.breakpointIcon,
            isEnabled: () => {
                return debugMode !== null && debugMode !== void 0 ? debugMode : false;
            },
            execute: args => {
                xircuitFactory.breakpointXircuitSignal.emit(args);
            }
        });
        // Add command signal to terminate debugging xircuit
        app.commands.addCommand(DebuggerCommandIDs.terminate, {
            caption: trans.__('Terminate'),
            icon: _jupyterlab_debugger__WEBPACK_IMPORTED_MODULE_1__.Debugger.Icons.terminateIcon,
            isEnabled: () => {
                return debugMode !== null && debugMode !== void 0 ? debugMode : false;
            },
            execute: args => {
                xircuitFactory.terminateDebugSignal.emit(args);
            }
        });
        // // Add command signal to toggle step in
        // app.commands.addCommand(DebuggerCommandIDs.stepIn, {
        //   caption: trans.__('Step In'),
        //   icon: Debugger.Icons.stepIntoIcon,
        //   isEnabled: () => {
        //     return inDebugMode ?? false;
        //   },
        //   execute: args => {
        //     xircuitFactory.stepInDebugSignal.emit(args);
        //   }
        // });
        // // Add command signal to toggle step out
        // app.commands.addCommand(DebuggerCommandIDs.stepOut, {
        //   caption: trans.__('Step Out'),
        //   icon: Debugger.Icons.stepOutIcon,
        //   isEnabled: () => {
        //     return inDebugMode ?? false;
        //   },
        //   execute: args => {
        //     xircuitFactory.stepOutDebugSignal.emit(args);
        //   }
        // });
        // // Add command signal to evaluate debugging xircuit
        // app.commands.addCommand(DebuggerCommandIDs.evaluate, {
        //   caption: trans.__('Evaluate Code'),
        //   icon: Debugger.Icons.evaluateIcon,
        //   isEnabled: () => {
        //     return inDebugMode ?? false;
        //   },
        //   execute: args => {
        //     xircuitFactory.evaluateDebugSignal.emit(args);
        //   }
        // });
        this.addWidget(header);
        this.addWidget(toolbarPanel);
        this.addWidget(content);
        this.addClass('jp-DebuggerBreakpoints');
    }
    /**
     * Add an item at the end of the sidebar.
     *
     * @param widget - The widget to add to the sidebar.
     *
     * #### Notes
     * If the widget is already contained in the sidebar, it will be moved.
     * The item can be removed from the sidebar by setting its parent to `null`.
     */
    addItem(widget) {
        this._body.addWidget(widget);
    }
    /**
     * Insert an item at the specified index.
     *
     * @param index - The index at which to insert the widget.
     *
     * @param widget - The widget to insert into to the sidebar.
     *
     * #### Notes
     * If the widget is already contained in the sidebar, it will be moved.
     * The item can be removed from the sidebar by setting its parent to `null`.
     */
    insertItem(index, widget) {
        this._body.insertWidget(index, widget);
    }
    /**
     * A read-only array of the sidebar items.
     */
    get items() {
        return this._body.widgets;
    }
    /**
     * Dispose the sidebar.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
    }
}
/**
 * The header for the Xircuits Debugger Panel.
 */
class DebuggerHeader extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.Widget {
    /**
     * Instantiate a new DebuggerHeader.
     */
    constructor(translator) {
        super({ node: document.createElement('div') });
        this.node.classList.add('jp-stack-panel-header');
        translator = translator || _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_0__.nullTranslator;
        const trans = translator.load('jupyterlab');
        const title = new _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.Widget({ node: document.createElement('h2') });
        title.node.textContent = trans.__('Xircuits Debugger');
        const layout = new _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.PanelLayout();
        layout.addWidget(title);
        this.layout = layout;
    }
}
/**
 * The toolbar for the XircuitsDebugger Panel.
 */
class DebuggerToolbar extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.Widget {
    /**
     * Instantiate a new DebuggerToolbar.
     */
    constructor() {
        super({ node: document.createElement('div') });
        /**
         * The toolbar for the xircuits debugger.
         */
        this.toolbar = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.Toolbar();
        this.node.classList.add('jp-debugger-toolbar-panel');
        const layout = new _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.PanelLayout();
        layout.addWidget(this.toolbar);
        this.layout = layout;
    }
}
/**
 * A namespace for `XircuitsDebugger` statics.
 */
var XircuitsDebugger;
(function (XircuitsDebugger) {
    /**
     * The debugger sidebar UI.
     */
    class Sidebar extends XircuitsDebuggerSidebar {
    }
    XircuitsDebugger.Sidebar = Sidebar;
})(XircuitsDebugger || (XircuitsDebugger = {}));
//# sourceMappingURL=SidebarDebugger.js.map

/***/ }),

/***/ "./lib/dialog/FormDialog.js":
/*!**********************************!*\
  !*** ./lib/dialog/FormDialog.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "showFormDialog": () => (/* binding */ showFormDialog),
/* harmony export */   "disableDialogButton": () => (/* binding */ disableDialogButton),
/* harmony export */   "enableDialogButton": () => (/* binding */ enableDialogButton)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_1__);


/*
 * Validate required dialog fields upon display
 * - Provides a generic validation by checking if required form fields are populated
 * - Expect required fields in dialog body to contain attribute: data-form-required
 *
 * @params
 *
 * options - The dialog setup options
 * formValidationFunction - Optional custom validation function
 *
 * returns a call to dialog display
 */
const showFormDialog = async (options, formValidationFunction) => {
    var _a, _b, _c, _d;
    const dialogBody = options.body;
    const dialog = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.Dialog(options);
    if (formValidationFunction) {
        formValidationFunction(dialog);
    }
    else {
        if (dialogBody instanceof _lumino_widgets__WEBPACK_IMPORTED_MODULE_1__.Widget) {
            const requiredFields = dialogBody.node.querySelectorAll('[data-form-required]');
            if (requiredFields && requiredFields.length > 0) {
                // Keep track of all fields already validated. Start with an empty set.
                const fieldsValidated = new Set();
                // Override Dialog.handleEvent to prevent user from bypassing validation upon pressing the 'Enter' key
                const dialogHandleEvent = dialog.handleEvent;
                dialog.handleEvent = (event) => {
                    if (event instanceof KeyboardEvent &&
                        event.type === 'keydown' &&
                        event.keyCode === 13 &&
                        fieldsValidated.size !== requiredFields.length) {
                        // prevent action since Enter key is pressed and all fields are not validated
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    else {
                        dialogHandleEvent.call(dialog, event);
                    }
                };
                // Get dialog default action button
                const defaultButtonIndex = (_a = options.defaultButton) !== null && _a !== void 0 ? _a : ((_c = (_b = options.buttons) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) - 1;
                const defaultButton = (_d = dialog.node
                    .querySelector('.jp-Dialog-footer')) === null || _d === void 0 ? void 0 : _d.getElementsByTagName('button')[defaultButtonIndex];
                // defaultButton.className += ' ' + DEFAULT_BUTTON_CLASS;
                requiredFields.forEach((element) => {
                    // First deal with the case the field has already been pre-populated
                    handleSingleFieldValidation(element, fieldsValidated);
                    const fieldType = element.tagName.toLowerCase();
                    if (fieldType === 'select') {
                        element.addEventListener('change', (event) => {
                            handleSingleFieldValidation(event.target, fieldsValidated);
                            handleAllFieldsValidation(fieldsValidated, requiredFields, defaultButton);
                        });
                    }
                    else if (fieldType === 'input' || fieldType === 'textarea') {
                        element.addEventListener('keyup', (event) => {
                            handleSingleFieldValidation(event.target, fieldsValidated);
                            handleAllFieldsValidation(fieldsValidated, requiredFields, defaultButton);
                        });
                    }
                });
                handleAllFieldsValidation(fieldsValidated, requiredFields, defaultButton);
            }
        }
    }
    return dialog.launch();
};
const disableDialogButton = (button) => {
    button.setAttribute('disabled', 'disabled');
};
const enableDialogButton = (button) => {
    button.removeAttribute('disabled');
};
// Update set of validated fields according to element value
const handleSingleFieldValidation = (element, fieldsValidated) => {
    element.value.trim()
        ? fieldsValidated.add(element)
        : fieldsValidated.delete(element);
};
// Only enable dialog button if all required fields are validated
const handleAllFieldsValidation = (fieldsValidated, requiredFields, button) => {
    fieldsValidated.size === requiredFields.length
        ? enableDialogButton(button)
        : disableDialogButton(button);
};
//# sourceMappingURL=FormDialog.js.map

/***/ }),

/***/ "./lib/dialog/RunDialog.js":
/*!*********************************!*\
  !*** ./lib/dialog/RunDialog.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RunDialog": () => (/* binding */ RunDialog)
/* harmony export */ });
/* harmony import */ var react_numeric_input__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-numeric-input */ "webpack/sharing/consume/default/react-numeric-input/react-numeric-input");
/* harmony import */ var react_numeric_input__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_numeric_input__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_textarea_autosize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-textarea-autosize */ "webpack/sharing/consume/default/react-textarea-autosize/react-textarea-autosize");
/* harmony import */ var react_textarea_autosize__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_textarea_autosize__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_switch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-switch */ "webpack/sharing/consume/default/react-switch/react-switch");
/* harmony import */ var react_switch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_switch__WEBPACK_IMPORTED_MODULE_3__);




const RunDialog = ({ lastAddedArgsSparkSubmit, childSparkSubmitNodes, childStringNodes, childBoolNodes, childIntNodes, childFloatNodes }) => {
    const [checked, setChecked] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)([false]);
    const handleChecked = (e, i) => {
        let newChecked = [...checked];
        newChecked[i] = e;
        setChecked(newChecked);
        console.log("Boolean change: ", checked);
    };
    return (react__WEBPACK_IMPORTED_MODULE_2___default().createElement("form", null,
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement("h3", { style: { marginTop: 0, marginBottom: 5 } }, "Hyperparameter:"),
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null, childSparkSubmitNodes.length != 0 ?
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement((react__WEBPACK_IMPORTED_MODULE_2___default().Fragment), null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement("h4", { style: { marginTop: 2, marginBottom: 0 } }, "Spark Submit")),
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
                    childSparkSubmitNodes,
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
                        react__WEBPACK_IMPORTED_MODULE_2___default().createElement((react_textarea_autosize__WEBPACK_IMPORTED_MODULE_1___default()), { defaultValue: lastAddedArgsSparkSubmit, minRows: 3, maxRows: 8, name: childSparkSubmitNodes, style: { width: 205, fontSize: 12 }, autoFocus: true }))))
            : null),
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null),
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement("h4", { style: { marginTop: 2, marginBottom: 0 } }, "String")),
        childStringNodes.map((stringNode, i) => react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", { key: `index-${i}` },
            stringNode,
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("input", { type: "text", name: stringNode })))),
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null, childBoolNodes.length != 0 ?
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement((react__WEBPACK_IMPORTED_MODULE_2___default().Fragment), null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("h4", { style: { marginTop: 2, marginBottom: 0 } }, "Boolean")) : null),
        childBoolNodes.map((boolNode, i) => react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", { key: `index-${i}` },
            boolNode,
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement((react_switch__WEBPACK_IMPORTED_MODULE_3___default()), { checked: checked[i] || false, name: boolNode, onChange: (e) => handleChecked(e, i), handleDiameter: 25, height: 20, width: 48 })))),
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null, childIntNodes.length != 0 ?
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement((react__WEBPACK_IMPORTED_MODULE_2___default().Fragment), null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("h4", { style: { marginTop: 2, marginBottom: 0 } }, "Integer")) : null),
        childIntNodes.map((intNode, i) => react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", { key: `index-${i}` },
            intNode,
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement(react_numeric_input__WEBPACK_IMPORTED_MODULE_0__, { className: "form-control", name: intNode, value: '0', min: 0, step: 1, precision: 0, mobile: true, style: {
                        wrap: {
                            boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
                            padding: '2px 2.26ex 2px 2px',
                            borderRadius: '6px 3px 3px 6px',
                            fontSize: 20,
                            width: '10vw'
                        },
                        input: {
                            borderRadius: '6px 3px 3px 6px',
                            padding: '0.1ex 1ex',
                            border: '#ccc',
                            marginRight: 4,
                            display: 'block',
                            fontWeight: 100,
                            width: '11.3vw'
                        },
                        plus: {
                            background: 'rgba(255, 255, 255, 100)'
                        },
                        minus: {
                            background: 'rgba(255, 255, 255, 100)'
                        },
                        btnDown: {
                            background: 'rgba(0, 0, 0)'
                        },
                        btnUp: {
                            background: 'rgba(0, 0, 0)'
                        }
                    } })))),
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null, childFloatNodes.length != 0 ?
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement((react__WEBPACK_IMPORTED_MODULE_2___default().Fragment), null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement("h4", { style: { marginTop: 2, marginBottom: 0 } }, "Float")) : null),
        childFloatNodes.map((floatNode, i) => react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", { className: "p-col-12", key: `index-${i}` },
            floatNode,
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement(react_numeric_input__WEBPACK_IMPORTED_MODULE_0__, { className: "form-control", name: floatNode, value: '0.00', min: 0, step: 0.1, precision: 2, mobile: true, style: {
                        wrap: {
                            boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
                            padding: '2px 2.26ex 2px 2px',
                            borderRadius: '6px 3px 3px 6px',
                            fontSize: 20,
                            width: '10vw'
                        },
                        input: {
                            borderRadius: '6px 3px 3px 6px',
                            padding: '0.1ex 1ex',
                            border: '#ccc',
                            marginRight: 4,
                            display: 'block',
                            fontWeight: 100,
                            width: '11.3vw'
                        },
                        plus: {
                            background: 'rgba(255, 255, 255, 100)'
                        },
                        minus: {
                            background: 'rgba(255, 255, 255, 100)'
                        },
                        btnDown: {
                            background: 'rgba(0, 0, 0)'
                        },
                        btnUp: {
                            background: 'rgba(0, 0, 0)'
                        }
                    } }))))));
};
//# sourceMappingURL=RunDialog.js.map

/***/ }),

/***/ "./lib/dialog/formDialogwidget.js":
/*!****************************************!*\
  !*** ./lib/dialog/formDialogwidget.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formDialogWidget": () => (/* binding */ formDialogWidget)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lumino_messaging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @lumino/messaging */ "webpack/sharing/consume/default/@lumino/messaging");
/* harmony import */ var _lumino_messaging__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lumino_messaging__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_2__);



const formDialogWidget = (dialogComponent) => {
    const widget = _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ReactWidget.create(dialogComponent);
    // Immediately update the body even though it has not yet attached in
    // order to trigger a render of the DOM nodes from the React element.
    _lumino_messaging__WEBPACK_IMPORTED_MODULE_1__.MessageLoop.sendMessage(widget, _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.Widget.Msg.UpdateRequest);
    widget.getValue = () => {
        var _a;
        const form = widget.node.querySelector('form');
        const formValues = {};
        for (const element of Object.values((_a = form === null || form === void 0 ? void 0 : form.elements) !== null && _a !== void 0 ? _a : [])) {
            switch (element.type) {
                case 'checkbox':
                    formValues[element.name] = element.checked;
                    break;
                default:
                    formValues[element.name] = element.value;
                    break;
            }
        }
        return formValues;
    };
    return widget;
};
//# sourceMappingURL=formDialogwidget.js.map

/***/ }),

/***/ "./lib/helpers/DemoCanvasWidget.js":
/*!*****************************************!*\
  !*** ./lib/helpers/DemoCanvasWidget.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Container": () => (/* binding */ Container),
/* harmony export */   "DemoCanvasWidget": () => (/* binding */ DemoCanvasWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);


//namespace S {
const Container = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
		height: 100%;
		background-color: ${(p) => p.background};
		background-size: 50px 50px;
		display: flex;

		> * {
			height: 100%;
			min-height: 100%;
			width: 100%;
		}
		background-image: linear-gradient(
				0deg,
				transparent 24%,
				${(p) => p.color} 25%,
				${(p) => p.color} 26%,
				transparent 27%,
				transparent 74%,
				${(p) => p.color} 75%,
				${(p) => p.color} 76%,
				transparent 77%,
				transparent
			),
			linear-gradient(
				90deg,
				transparent 24%,
				${(p) => p.color} 25%,
				${(p) => p.color} 26%,
				transparent 27%,
				transparent 74%,
				${(p) => p.color} 75%,
				${(p) => p.color} 76%,
				transparent 77%,
				transparent
			);
	`;
//}
class DemoCanvasWidget extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(Container, { background: this.props.background || 'rgb(60, 60, 60)', color: this.props.color || 'rgba(255,255,255, 0.05)' }, this.props.children));
    }
}
//# sourceMappingURL=DemoCanvasWidget.js.map

/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IXircuitsDocTracker": () => (/* binding */ IXircuitsDocTracker),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/application */ "webpack/sharing/consume/default/@jupyterlab/application");
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_application__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/filebrowser */ "webpack/sharing/consume/default/@jupyterlab/filebrowser");
/* harmony import */ var _jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jupyterlab/launcher */ "webpack/sharing/consume/default/@jupyterlab/launcher");
/* harmony import */ var _jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _xircuitFactory__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./xircuitFactory */ "./lib/xircuitFactory.js");
/* harmony import */ var _tray_library_Sidebar__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./tray_library/Sidebar */ "./lib/tray_library/Sidebar.js");
/* harmony import */ var _jupyterlab_docmanager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jupyterlab/docmanager */ "webpack/sharing/consume/default/@jupyterlab/docmanager");
/* harmony import */ var _jupyterlab_docmanager__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_docmanager__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _debugger_SidebarDebugger__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./debugger/SidebarDebugger */ "./lib/debugger/SidebarDebugger.js");
/* harmony import */ var _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @jupyterlab/translation */ "webpack/sharing/consume/default/@jupyterlab/translation");
/* harmony import */ var _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_translation__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _log_LogPlugin__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./log/LogPlugin */ "./lib/log/LogPlugin.js");
/* harmony import */ var _server_handler__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./server/handler */ "./lib/server/handler.js");
/* harmony import */ var _kernel_panel__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./kernel/panel */ "./lib/kernel/panel.js");
/* harmony import */ var _jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @jupyterlab/rendermime */ "webpack/sharing/consume/default/@jupyterlab/rendermime");
/* harmony import */ var _jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _commands_NodeActionCommands__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./commands/NodeActionCommands */ "./lib/commands/NodeActionCommands.js");
/* harmony import */ var _lumino_coreutils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @lumino/coreutils */ "webpack/sharing/consume/default/@lumino/coreutils");
/* harmony import */ var _lumino_coreutils__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_lumino_coreutils__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _ui_components_icons__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ui-components/icons */ "./lib/ui-components/icons.js");
/* harmony import */ var _kernel_RunOutput__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./kernel/RunOutput */ "./lib/kernel/RunOutput.js");




















const FACTORY = 'Xircuits editor';
// Export a token so other extensions can require it
const IXircuitsDocTracker = new _lumino_coreutils__WEBPACK_IMPORTED_MODULE_9__.Token('xircuitsDocTracker');
/**
 * Initialization data for the documents extension.
 */
const xircuits = {
    id: 'xircuits',
    autoStart: true,
    requires: [
        _jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_4__.ILauncher,
        _jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2__.IFileBrowserFactory,
        _jupyterlab_application__WEBPACK_IMPORTED_MODULE_1__.ILayoutRestorer,
        _jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_7__.IRenderMimeRegistry,
        _jupyterlab_docmanager__WEBPACK_IMPORTED_MODULE_5__.IDocumentManager,
        _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_6__.ITranslator
    ],
    provides: IXircuitsDocTracker,
    activate: async (app, launcher, browserFactory, restorer, rendermime, docmanager, translator) => {
        console.log('Xircuits is activated!');
        // Creating the widget factory to register it so the document manager knows about
        // our new DocumentWidget
        const widgetFactory = new _xircuitFactory__WEBPACK_IMPORTED_MODULE_10__.XircuitFactory({
            name: FACTORY,
            fileTypes: ['xircuits'],
            defaultFor: ['xircuits'],
            app: app,
            shell: app.shell,
            commands: app.commands,
            serviceManager: app.serviceManager
        });
        // register the filetype
        app.docRegistry.addFileType({
            name: 'xircuits',
            displayName: 'Xircuits',
            extensions: ['.xircuits'],
            icon: _ui_components_icons__WEBPACK_IMPORTED_MODULE_11__.xircuitsIcon
        });
        // Registering the widget factory
        app.docRegistry.addWidgetFactory(widgetFactory);
        const tracker = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.WidgetTracker({
            namespace: "Xircuits Tracker"
        });
        // Add the widget to the tracker when it's created
        widgetFactory.widgetCreated.connect((sender, widget) => {
            // Notify the instance tracker if restore data needs to update.
            void tracker.add(widget);
            // Notify the widget tracker if restore data needs to update
            widget.context.pathChanged.connect(() => {
                void tracker.save(widget);
            });
        });
        // Handle state restoration
        void restorer.restore(tracker, {
            command: _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.openDocManager,
            args: widget => ({
                path: widget.context.path,
                factory: FACTORY
            }),
            name: widget => widget.context.path
        });
        // Find the MainLogo widget in the shell and replace it with the Xircuits Logo
        const widgets = app.shell.widgets('top');
        let widget = widgets.next();
        while (widget !== undefined) {
            if (widget.id === 'jp-MainLogo') {
                _ui_components_icons__WEBPACK_IMPORTED_MODULE_11__.xircuitsIcon.element({
                    container: widget.node,
                    justify: 'center',
                    height: 'auto',
                    width: '25px'
                });
                break;
            }
            widget = widgets.next();
        }
        // Change the favicon
        (0,_ui_components_icons__WEBPACK_IMPORTED_MODULE_11__.changeFavicon)(_ui_components_icons__WEBPACK_IMPORTED_MODULE_11__.xircuitsFaviconLink);
        // Creating the sidebar widget for the xai components
        const sidebarWidget = _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ReactWidget.create(react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_tray_library_Sidebar__WEBPACK_IMPORTED_MODULE_13__["default"], { lab: app }));
        sidebarWidget.id = 'xircuits-component-sidebar';
        sidebarWidget.title.icon = _ui_components_icons__WEBPACK_IMPORTED_MODULE_11__.componentLibIcon;
        sidebarWidget.title.caption = "Xircuits Component Library";
        restorer.add(sidebarWidget, sidebarWidget.id);
        app.shell.add(sidebarWidget, "left");
        // Creating the sidebar debugger
        const sidebarDebugger = new _debugger_SidebarDebugger__WEBPACK_IMPORTED_MODULE_14__.XircuitsDebugger.Sidebar({ app, translator, widgetFactory });
        sidebarDebugger.id = 'xircuits-debugger-sidebar';
        sidebarDebugger.title.icon = _ui_components_icons__WEBPACK_IMPORTED_MODULE_11__.debuggerIcon;
        sidebarDebugger.title.caption = "Xircuits Debugger";
        restorer.add(sidebarDebugger, sidebarDebugger.id);
        app.shell.add(sidebarDebugger, 'right', { rank: 1001 });
        // Additional commands for node action
        (0,_commands_NodeActionCommands__WEBPACK_IMPORTED_MODULE_15__.addNodeActionCommands)(app, tracker, translator);
        // Add a command to open xircuits sidebar debugger
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.openDebugger, {
            execute: () => {
                if (sidebarDebugger.isHidden) {
                    app.shell.activateById(sidebarDebugger.id);
                }
            },
        });
        // Add a command for creating a new xircuits file.
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.createNewXircuit, {
            label: (args) => (args['isLauncher'] ? 'Xircuits File' : 'Create New Xircuits'),
            icon: _ui_components_icons__WEBPACK_IMPORTED_MODULE_11__.xircuitsIcon,
            caption: 'Create a new xircuits file',
            execute: () => {
                app.commands
                    .execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.newDocManager, {
                    path: browserFactory.defaultBrowser.model.path,
                    type: 'file',
                    ext: '.xircuits'
                })
                    .then(async (model) => {
                    const newWidget = await app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.openDocManager, {
                        path: model.path,
                        factory: FACTORY
                    });
                    newWidget.context.ready.then(() => {
                        app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.saveXircuit, {
                            path: model.path
                        });
                    });
                });
            }
        });
        async function requestToGenerateArbitraryFile(path, pythonScript) {
            const dataToSend = { "currentPath": path.split(".xircuits")[0] + ".py", "compilePythonScript": pythonScript };
            try {
                const server_reply = await (0,_server_handler__WEBPACK_IMPORTED_MODULE_16__.requestAPI)('file/generate', {
                    body: JSON.stringify(dataToSend),
                    method: 'POST',
                });
                return server_reply;
            }
            catch (reason) {
                console.error(`Error on POST /xircuits/file/generate ${dataToSend}.\n${reason}`);
            }
        }
        ;
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.createArbitraryFile, {
            execute: async (args) => {
                const current_path = tracker.currentWidget.context.path;
                const path = current_path;
                const message = typeof args['pythonCode'] === undefined ? '' : args['pythonCode'];
                const showOutput = typeof args['showOutput'] === undefined ? false : args['showOutput'];
                const request = await requestToGenerateArbitraryFile(path, message); // send this file and create new file
                if (request["message"] == "completed") {
                    const model_path = current_path.split(".xircuits")[0] + ".py";
                    await app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.openDocManager, {
                        path: model_path
                    });
                    docmanager.closeFile(model_path);
                    if (showOutput) {
                        alert(`${model_path} successfully compiled!`);
                    }
                }
                else {
                    alert("Failed to generate arbitrary file!");
                }
            }
        });
        let outputPanel;
        /**
          * Creates a output panel.
          *
          * @returns The panel
          */
        async function createPanel() {
            outputPanel = new _kernel_panel__WEBPACK_IMPORTED_MODULE_17__.OutputPanel(app.serviceManager, rendermime, widgetFactory, translator);
            app.shell.add(outputPanel, 'main', {
                mode: 'split-bottom'
            });
            return outputPanel;
        }
        // Dispose the output panel when closing browser or tab
        window.addEventListener('beforeunload', function (e) {
            outputPanel.dispose();
        });
        async function requestToSparkSubmit(path, addArgs) {
            const dataToSend = { "currentPath": path, "addArgs": addArgs };
            try {
                const server_reply = await (0,_server_handler__WEBPACK_IMPORTED_MODULE_16__.requestAPI)('spark/submit', {
                    body: JSON.stringify(dataToSend),
                    method: 'POST',
                });
                return server_reply;
            }
            catch (reason) {
                console.error(`Error on POST /xircuits/spark/submit ${dataToSend}.\n${reason}`);
            }
        }
        ;
        // Execute xircuits python script and display at output panel
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.executeToOutputPanel, {
            execute: async (args) => {
                const xircuitsLogger = new _log_LogPlugin__WEBPACK_IMPORTED_MODULE_18__.Log(app);
                const current_path = tracker.currentWidget.context.path;
                const model_path = current_path.split(".xircuits")[0] + ".py";
                const message = typeof args['runCommand'] === 'undefined' ? '' : args['runCommand'];
                const debug_mode = typeof args['debug_mode'] === 'undefined' ? '' : args['debug_mode'];
                const runType = typeof args['runType'] === 'undefined' ? '' : args['runType'];
                const addArgs = typeof args['addArgsSparkSubmit'] === 'undefined' ? '' : args['addArgsSparkSubmit'];
                // Create the panel if it does not exist
                if (!outputPanel || outputPanel.isDisposed) {
                    await createPanel();
                }
                outputPanel.session.ready.then(async () => {
                    let code = (0,_kernel_RunOutput__WEBPACK_IMPORTED_MODULE_19__.startRunOutputStr)();
                    code += "%run " + model_path + message + debug_mode;
                    // Run spark submit when run type is Spark Submit
                    if (runType == 'spark-submit') {
                        const request = await requestToSparkSubmit(model_path, addArgs);
                        const errorMsg = request["stderr"];
                        const outputMsg = request["stdout"];
                        let msg = "";
                        // Display the errors if there no output
                        if (outputMsg != 0) {
                            msg = outputMsg;
                        }
                        else {
                            msg = errorMsg;
                        }
                        // Display the multi-line message
                        const outputCode = `"""${msg}"""`;
                        code = `print(${outputCode})`;
                    }
                    outputPanel.execute(code, xircuitsLogger);
                });
            },
        });
        // Add command signal to save xircuits
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.saveXircuit, {
            label: "Save",
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_8__.saveIcon,
            execute: args => {
                widgetFactory.saveXircuitSignal.emit(args);
            }
        });
        // Add command signal to compile xircuits
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.compileXircuit, {
            execute: args => {
                widgetFactory.compileXircuitSignal.emit(args);
            }
        });
        // Add command signal to run xircuits
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.runXircuit, {
            label: "Run Xircuits",
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_8__.runIcon,
            execute: args => {
                widgetFactory.runXircuitSignal.emit(args);
            }
        });
        // Add command signal to debug xircuits
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.debugXircuit, {
            execute: args => {
                widgetFactory.debugXircuitSignal.emit(args);
            }
        });
        // Add command signal to lock xircuits
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.lockXircuit, {
            execute: args => {
                widgetFactory.lockNodeSignal.emit(args);
            }
        });
        // Add command signal to test xircuits
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.testXircuit, {
            execute: args => {
                widgetFactory.testXircuitSignal.emit(args);
            }
        });
        // Add a launcher item if the launcher is available.
        if (launcher) {
            launcher.add({
                command: _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_12__.commandIDs.createNewXircuit,
                rank: 1,
                args: { isLauncher: true },
                category: 'Other'
            });
        }
    },
};
/**
 * Export the plugins as default.
 */
const plugins = [
    xircuits,
    _log_LogPlugin__WEBPACK_IMPORTED_MODULE_18__.logPlugin
];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugins);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./lib/kernel/RunOutput.js":
/*!*********************************!*\
  !*** ./lib/kernel/RunOutput.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "startRunOutputStr": () => (/* binding */ startRunOutputStr)
/* harmony export */ });
function startRunOutputStr() {
    let code_str;
    code_str =
        `print(
"""
======================================
__   __  ___                _ _
\\ \\  \\ \\/ (_)_ __ ___ _   _(_) |_ ___
 \\ \\  \\  /| | '__/ __| | | | | __/ __|
 / /  /  \\| | | | (__| |_| | | |_\\__ \\\\
/_/  /_/\\_\\_|_|  \\___|\\__,_|_|\\__|___/

======================================
""")\n`;
    code_str += "print('Xircuits is running...\\n')\n";
    return code_str;
}
//# sourceMappingURL=RunOutput.js.map

/***/ }),

/***/ "./lib/kernel/panel.js":
/*!*****************************!*\
  !*** ./lib/kernel/panel.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OutputPanel": () => (/* binding */ OutputPanel)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_outputarea__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/outputarea */ "webpack/sharing/consume/default/@jupyterlab/outputarea");
/* harmony import */ var _jupyterlab_outputarea__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_outputarea__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/translation */ "webpack/sharing/consume/default/@jupyterlab/translation");
/* harmony import */ var _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_translation__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _ui_components_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../ui-components/icons */ "./lib/ui-components/icons.js");





/**
 * The class name added to the output panel.
 */
const PANEL_CLASS = 'jp-RovaPanel';
/**
 * A panel with the ability to add other children.
 */
class OutputPanel extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_3__.StackedPanel {
    constructor(manager, rendermime, xircuitFactory, translator) {
        super();
        this._translator = translator || _jupyterlab_translation__WEBPACK_IMPORTED_MODULE_2__.nullTranslator;
        this._trans = this._translator.load('jupyterlab');
        this._xircuitFactory = xircuitFactory;
        this.addClass(PANEL_CLASS);
        this.id = 'xircuit-output-panel';
        this.title.label = this._trans.__('Xircuit Output');
        this.title.closable = true;
        this.title.icon = _ui_components_icons__WEBPACK_IMPORTED_MODULE_4__.xircuitsIcon;
        this._sessionContext = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.SessionContext({
            sessionManager: manager.sessions,
            specsManager: manager.kernelspecs,
            name: 'Xircuit Output Process',
        });
        this._outputareamodel = new _jupyterlab_outputarea__WEBPACK_IMPORTED_MODULE_1__.OutputAreaModel();
        this._outputarea = new _jupyterlab_outputarea__WEBPACK_IMPORTED_MODULE_1__.SimplifiedOutputArea({
            model: this._outputareamodel,
            rendermime: rendermime,
        });
        this.addWidget(this._outputarea);
        void this._sessionContext
            .initialize()
            .then(async (value) => {
            if (value) {
                await _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.sessionContextDialogs.selectKernel(this._sessionContext);
                // Dispose panel when no kernel selected
                if (this._sessionContext.hasNoKernel) {
                    super.dispose();
                }
            }
        })
            .catch((reason) => {
            console.error(`Failed to initialize the session in Xircuit Output.\n${reason}`);
        });
    }
    get session() {
        return this._sessionContext;
    }
    dispose() {
        this._sessionContext.sessionManager.shutdown(this._sessionContext.session.id);
        this._sessionContext.dispose();
        this._xircuitFactory.terminateDebugSignal.emit(this);
        this._sessionContext.sessionManager.refreshRunning();
        super.dispose();
    }
    execute(code, xircuitLogger) {
        _jupyterlab_outputarea__WEBPACK_IMPORTED_MODULE_1__.SimplifiedOutputArea.execute(code, this._outputarea, this._sessionContext)
            .then((msg) => {
            if (this._outputarea.model.toJSON().length > 0) {
                for (let index = 0; index < this._outputarea.model.toJSON().length; index++) {
                    let is_error = this._outputarea.model.toJSON()[index].output_type == "error";
                    if (is_error) {
                        let ename = this._outputarea.model.toJSON()[index]["ename"];
                        let evalue = this._outputarea.model.toJSON()[index]["evalue"];
                        let traceback = this._outputarea.model.toJSON()[index]["traceback"];
                        if (evalue.includes("File") && evalue.includes("not found")) {
                            alert(ename + ": " + evalue + " Please compile first!");
                            xircuitLogger.error(ename + ": " + evalue);
                            console.log(evalue + " Please compile first!");
                            return;
                        }
                        for (let data of traceback) {
                            xircuitLogger.error(data);
                        }
                        return;
                    }
                    let text = this._outputarea.model.toJSON()[index]["text"];
                    for (let text_index = 0; text_index < text.split("\n").length; text_index++) {
                        if (text.split("\n")[text_index].trim() != "") {
                            xircuitLogger.info(text.split("\n")[text_index]);
                        }
                    }
                }
            }
        })
            .catch((reason) => console.error(reason));
    }
    onCloseRequest(msg) {
        super.onCloseRequest(msg);
        this.dispose();
    }
}
//# sourceMappingURL=panel.js.map

/***/ }),

/***/ "./lib/log/LogLevelSwitcher.js":
/*!*************************************!*\
  !*** ./lib/log/LogLevelSwitcher.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LogLevelSwitcher)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lumino_coreutils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @lumino/coreutils */ "webpack/sharing/consume/default/@lumino/coreutils");
/* harmony import */ var _lumino_coreutils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_lumino_coreutils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);




/**
 * A toolbar widget that switches log levels.
 */
class LogLevelSwitcher extends _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ReactWidget {
    /**
     * Construct a new cell type switcher.
     *
     * @param widget The log console panel
     */
    constructor(widget) {
        super();
        /**
         * Handle `change` events for the HTMLSelect component.
         *
         * @param event The HTML select event.
         */
        this.handleChange = (event) => {
            if (this._logConsole.logger) {
                this._logConsole.logger.level = event.target.value;
            }
            this.update();
        };
        /**
         * Handle `keydown` events for the HTMLSelect component.
         *
         * @param event The keyboard event.
         */
        this.handleKeyDown = (event) => {
            if (event.keyCode === 13) {
                this._logConsole.activate();
            }
        };
        this._id = `level-${_lumino_coreutils__WEBPACK_IMPORTED_MODULE_2__.UUID.uuid4()}`;
        this.addClass('jp-LogConsole-toolbarLogLevel');
        this._logConsole = widget;
        this._logConsole.logger.level = 'debug';
        if (widget.source) {
            this.update();
        }
        widget.sourceChanged.connect(this._updateSource, this);
    }
    _updateSource(sender, { oldValue, newValue }) {
        // Transfer stateChanged handler to new source logger
        if (oldValue !== null) {
            const logger = sender.loggerRegistry.getLogger(oldValue);
            logger.stateChanged.disconnect(this.update, this);
        }
        if (newValue !== null) {
            const logger = sender.loggerRegistry.getLogger(newValue);
            logger.stateChanged.connect(this.update, this);
        }
        this.update();
    }
    render() {
        const logger = this._logConsole.logger;
        return (react__WEBPACK_IMPORTED_MODULE_3___default().createElement((react__WEBPACK_IMPORTED_MODULE_3___default().Fragment), null,
            react__WEBPACK_IMPORTED_MODULE_3___default().createElement("label", { htmlFor: this._id, className: logger === null
                    ? 'jp-LogConsole-toolbarLogLevel-disabled'
                    : undefined }, "Log Level:"),
            react__WEBPACK_IMPORTED_MODULE_3___default().createElement(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.HTMLSelect, { id: this._id, className: "jp-LogConsole-toolbarLogLevelDropdown", onChange: this.handleChange, onKeyDown: this.handleKeyDown, value: logger === null || logger === void 0 ? void 0 : logger.level, "aria-label": "Log level", disabled: logger === null, options: logger === null
                    ? []
                    : ['Critical', 'Error', 'Warning', 'Info', 'Debug'].map((label) => ({ label, value: label.toLowerCase() })) })));
    }
}
//# sourceMappingURL=LogLevelSwitcher.js.map

/***/ }),

/***/ "./lib/log/LogPlugin.js":
/*!******************************!*\
  !*** ./lib/log/LogPlugin.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CommandIDs": () => (/* binding */ CommandIDs),
/* harmony export */   "logPlugin": () => (/* binding */ logPlugin),
/* harmony export */   "Log": () => (/* binding */ Log)
/* harmony export */ });
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/application */ "webpack/sharing/consume/default/@jupyterlab/application");
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _LogLevelSwitcher__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./LogLevelSwitcher */ "./lib/log/LogLevelSwitcher.js");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/rendermime */ "webpack/sharing/consume/default/@jupyterlab/rendermime");
/* harmony import */ var _jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _jupyterlab_logconsole__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jupyterlab/logconsole */ "webpack/sharing/consume/default/@jupyterlab/logconsole");
/* harmony import */ var _jupyterlab_logconsole__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_logconsole__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");








/**
 * The command IDs used by the log plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.addCheckpoint = 'Xircuit-log:add-checkpoint';
    CommandIDs.clear = 'Xircuit-log:clear';
    CommandIDs.openLog = 'Xircuit-log:open';
    CommandIDs.setLevel = 'Xircuit-log:set-level';
})(CommandIDs || (CommandIDs = {}));
/**
 * Initialization data for the log plugin.
 */
const logPlugin = {
    id: 'xircuit-log',
    autoStart: true,
    requires: [
        _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2__.ICommandPalette,
        _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__.ILayoutRestorer,
        _jupyterlab_rendermime__WEBPACK_IMPORTED_MODULE_3__.IRenderMimeRegistry
    ],
    activate: (app, palette, restorer, rendermime) => {
        console.log('Xircuit-Log is activated!');
        let logConsolePanel = null;
        let logConsoleWidget = null;
        const loggertracker = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2__.WidgetTracker({
            namespace: 'Xircuit-log',
        });
        if (restorer) {
            void restorer.restore(loggertracker, {
                command: CommandIDs.openLog,
                name: () => 'Xircuit-log'
            });
        }
        app.commands.addCommand(CommandIDs.addCheckpoint, {
            execute: () => { var _a; return (_a = logConsolePanel === null || logConsolePanel === void 0 ? void 0 : logConsolePanel.logger) === null || _a === void 0 ? void 0 : _a.checkpoint(); },
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.addIcon,
            isEnabled: () => !!logConsolePanel && logConsolePanel.source !== null,
            label: 'Add Checkpoint',
        });
        app.commands.addCommand(CommandIDs.clear, {
            execute: () => { var _a; return (_a = logConsolePanel === null || logConsolePanel === void 0 ? void 0 : logConsolePanel.logger) === null || _a === void 0 ? void 0 : _a.clear(); },
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.clearIcon,
            isEnabled: () => !!logConsolePanel && logConsolePanel.source !== null,
            label: 'Clear Log',
        });
        app.commands.addCommand(CommandIDs.setLevel, {
            execute: (args) => {
                if (logConsolePanel === null || logConsolePanel === void 0 ? void 0 : logConsolePanel.logger) {
                    logConsolePanel.logger.level = args.level;
                }
            },
            isEnabled: () => !!logConsolePanel && logConsolePanel.source !== null,
            label: (args) => `Set Log Level to ${args.level}`,
        });
        const createLogConsoleWidget = () => {
            logConsolePanel = new _jupyterlab_logconsole__WEBPACK_IMPORTED_MODULE_4__.LogConsolePanel(new _jupyterlab_logconsole__WEBPACK_IMPORTED_MODULE_4__.LoggerRegistry({
                defaultRendermime: rendermime,
                maxLength: 1000,
            }));
            logConsolePanel.source = 'xircuit';
            logConsoleWidget = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2__.MainAreaWidget({
                content: logConsolePanel,
            });
            logConsoleWidget.addClass('jp-LogConsole');
            logConsoleWidget.title.label = 'xircuits Log console';
            logConsoleWidget.title.icon = _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.listIcon;
            logConsoleWidget.toolbar.addItem('checkpoint', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2__.CommandToolbarButton({
                commands: app.commands,
                id: CommandIDs.addCheckpoint,
            }));
            logConsoleWidget.toolbar.addItem('clear', new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_2__.CommandToolbarButton({
                commands: app.commands,
                id: CommandIDs.clear,
            }));
            logConsoleWidget.toolbar.addItem('level', new _LogLevelSwitcher__WEBPACK_IMPORTED_MODULE_5__["default"](logConsoleWidget.content));
            logConsoleWidget.disposed.connect(() => {
                logConsoleWidget = null;
                logConsolePanel = null;
                app.commands.notifyCommandChanged();
            });
            app.shell.add(logConsoleWidget, 'main', { mode: 'split-bottom' });
            loggertracker.add(logConsoleWidget);
            logConsoleWidget.update();
            app.commands.notifyCommandChanged();
        };
        app.commands.addCommand(CommandIDs.openLog, {
            label: 'Open Xircuits Log Console',
            caption: 'Xircuits log console',
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.listIcon,
            isToggled: () => logConsoleWidget !== null,
            execute: () => {
                if (logConsoleWidget) {
                    logConsoleWidget.dispose();
                }
                else {
                    createLogConsoleWidget();
                }
            },
        });
        palette.addItem({
            command: CommandIDs.openLog,
            category: 'Examples',
        });
        app.commands.addCommand('jlab-examples/custom-log-console:logHTMLMessage', {
            label: 'HTML log message',
            caption: 'Custom HTML log message example.',
            execute: () => {
                var _a;
                const msg = {
                    type: 'html',
                    level: 'debug',
                    data: '<div>Hello world HTML!!</div>',
                };
                (_a = logConsolePanel === null || logConsolePanel === void 0 ? void 0 : logConsolePanel.logger) === null || _a === void 0 ? void 0 : _a.log(msg);
            },
        });
        app.commands.addCommand('jlab-examples/custom-log-console:logTextMessage', {
            label: 'Text log message',
            caption: 'Custom text log message example.',
            execute: () => {
                var _a;
                const msg = {
                    type: 'text',
                    level: 'info',
                    data: 'Hello world text!!',
                };
                (_a = logConsolePanel === null || logConsolePanel === void 0 ? void 0 : logConsolePanel.logger) === null || _a === void 0 ? void 0 : _a.log(msg);
            },
        });
        app.commands.addCommand(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.outputMsg, {
            label: 'Output log message',
            caption: 'Output xircuits log message.',
            execute: args => {
                var _a;
                const outputMsg = typeof args['outputMsg'] === 'undefined' ? '' : args['outputMsg'];
                const setLevel = args['level'];
                const data = {
                    output_type: 'display_data',
                    data: {
                        'text/plain': outputMsg,
                    },
                };
                const msg = {
                    type: 'output',
                    level: setLevel,
                    data,
                };
                (_a = logConsolePanel === null || logConsolePanel === void 0 ? void 0 : logConsolePanel.logger) === null || _a === void 0 ? void 0 : _a.log(msg);
            },
        });
    },
};
/**
 * Emit output message to xircuit log based on severity level
 */
class Log {
    constructor(app) {
        this.app = app;
    }
    debug(msg, ...supportingDetailes) {
        this.emitLogMessage("debug", msg, supportingDetailes);
    }
    info(msg, ...supportingDetailes) {
        this.emitLogMessage("info", msg, supportingDetailes);
    }
    warn(msg, ...supportingDetailes) {
        this.emitLogMessage("warning", msg, supportingDetailes);
    }
    error(msg, ...supportingDetailes) {
        this.emitLogMessage("error", msg, supportingDetailes);
    }
    critical(msg, ...supportingDetailes) {
        this.emitLogMessage("critical", msg, supportingDetailes);
    }
    emitLogMessage(msgType, msg, supportingDetailes) {
        if (supportingDetailes.length > 0) {
            const logMsg = msg + supportingDetailes;
            this.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.outputMsg, {
                outputMsg: logMsg,
                level: msgType
            });
        }
        else {
            this.app.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.outputMsg, {
                outputMsg: msg,
                level: msgType
            });
        }
    }
}
//# sourceMappingURL=LogPlugin.js.map

/***/ }),

/***/ "./lib/server/handler.js":
/*!*******************************!*\
  !*** ./lib/server/handler.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "requestAPI": () => (/* binding */ requestAPI)
/* harmony export */ });
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/coreutils */ "webpack/sharing/consume/default/@jupyterlab/coreutils");
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/services */ "webpack/sharing/consume/default/@jupyterlab/services");
/* harmony import */ var _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
async function requestAPI(endPoint = '', init = {}) {
    // Make request to Jupyter API
    const settings = _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.makeSettings();
    const requestUrl = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.URLExt.join(settings.baseUrl, 'xircuits', // API Namespace
    endPoint);
    let response;
    try {
        response = await _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.makeRequest(requestUrl, init, settings);
    }
    catch (error) {
        throw new _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.NetworkError(error);
    }
    const data = await response.json();
    if (!response.ok) {
        throw new _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.ResponseError(response, data.message);
    }
    return data;
}
//# sourceMappingURL=handler.js.map

/***/ }),

/***/ "./lib/tray_library/Component.js":
/*!***************************************!*\
  !*** ./lib/tray_library/Component.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ComponentList)
/* harmony export */ });
/* harmony import */ var _server_handler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../server/handler */ "./lib/server/handler.js");

async function get_all_components_method() {
    const components = await (0,_server_handler__WEBPACK_IMPORTED_MODULE_0__.requestAPI)('components/');
    return components;
}
async function ComponentList(serviceManager) {
    let component_list_result = await get_all_components_method();
    return component_list_result;
}
//# sourceMappingURL=Component.js.map

/***/ }),

/***/ "./lib/tray_library/GeneralComponentLib.js":
/*!*************************************************!*\
  !*** ./lib/tray_library/GeneralComponentLib.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GeneralComponentLibrary": () => (/* binding */ GeneralComponentLibrary)
/* harmony export */ });
/* harmony import */ var _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/CustomNodeModel */ "./lib/components/CustomNodeModel.js");

function GeneralComponentLibrary(props) {
    let node = null;
    // For now, comment this first until we've use for it
    // if (props.type === 'math') {
    //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
    //     node.addInPortEnhance('▶', 'in-0');
    //     node.addInPortEnhance('A', 'in-1');
    //     node.addInPortEnhance('B', 'in-2');
    //     node.addOutPortEnhance('▶', 'out-0');
    //     node.addOutPortEnhance('value', 'out-1');
    // } else if (props.type === 'convert') {
    //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
    //     node.addInPortEnhance('▶', 'in-0');
    //     node.addInPortEnhance('model', 'parameter-string-in-1');
    //     node.addOutPortEnhance('▶', 'out-0');
    //     node.addOutPortEnhance('converted', 'out-1');
    // } else 
    if (props.type === 'string') {
        if ((props.name).startsWith("Literal")) {
            let theResponse = window.prompt('Enter String Value (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance(theResponse, 'out-0');
        }
        else {
            let theResponse = window.prompt('notice', 'Enter String Name (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: "Hyperparameter (String): " + theResponse, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }
    }
    else if (props.type === 'int') {
        if ((props.name).startsWith("Literal")) {
            let theResponse = window.prompt('Enter Int Value (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance(theResponse, 'out-0');
        }
        else {
            let theResponse = window.prompt('notice', 'Enter Int Name (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: "Hyperparameter (Int): " + theResponse, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }
    }
    else if (props.type === 'float') {
        if ((props.name).startsWith("Literal")) {
            let theResponse = window.prompt('Enter Float Value (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance(theResponse, 'out-0');
        }
        else {
            let theResponse = window.prompt('notice', 'Enter Float Name (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: "Hyperparameter (Float): " + theResponse, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }
    }
    else if (props.type === 'boolean') {
        if ((props.name).startsWith("Literal")) {
            let portLabel = props.name.split(' ');
            portLabel = portLabel[portLabel.length - 1];
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance(portLabel, 'out-0');
        }
        else {
            let theResponse = window.prompt('notice', 'Enter Boolean Name (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: "Hyperparameter (Boolean): " + theResponse, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }
    }
    else if (props.type === 'list') {
        if ((props.name).startsWith("Literal")) {
            let theResponse = window.prompt('Enter List Values (Without [] Brackets):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance(theResponse, 'out-0');
        }
        else {
            let theResponse = window.prompt('notice', 'Enter List Name (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: "Hyperparameter (List): " + theResponse, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }
    }
    else if (props.type === 'tuple') {
        if ((props.name).startsWith("Literal")) {
            let theResponse = window.prompt('Enter Tuple Values (Without () Brackets):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance(theResponse, 'out-0');
        }
        else {
            let theResponse = window.prompt('notice', 'Enter Tuple Name (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: "Hyperparameter (Tuple): " + theResponse, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }
    }
    else if (props.type === 'dict') {
        if ((props.name).startsWith("Literal")) {
            let theResponse = window.prompt('Enter Dict Values (Without {} Brackets):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance(theResponse, 'out-0');
        }
        else {
            let theResponse = window.prompt('notice', 'Enter Dict Name (Without Quotes):');
            node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: "Hyperparameter (Dict): " + theResponse, color: props.color, extras: { "type": props.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }
        // } else if (props.type === 'debug') {
        //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
        //     node.addInPortEnhance('▶', 'in-0');
        //     node.addInPortEnhance('props Set', 'parameter-in-1');
        //     node.addOutPortEnhance('▶', 'out-0');
        // } else if (props.type === 'enough') {
        //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
        //     node.addInPortEnhance('▶', 'in-0');
        //     node.addInPortEnhance('Target Accuracy', 'parameter-float-in-1');
        //     node.addInPortEnhance('Max Retries', 'parameter-int-in-2');
        //     node.addInPortEnhance('Metrics', 'parameter-string-in-3');
        //     node.addOutPortEnhance('▶', 'out-0');
        //     node.addOutPortEnhance('Should Retrain', 'out-1');
    }
    else if (props.type === 'literal') {
        node = new _components_CustomNodeModel__WEBPACK_IMPORTED_MODULE_0__.CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
        node.addOutPortEnhance('Value', 'out-0');
    }
    return node;
}
//# sourceMappingURL=GeneralComponentLib.js.map

/***/ }),

/***/ "./lib/tray_library/Sidebar.js":
/*!*************************************!*\
  !*** ./lib/tray_library/Sidebar.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Body": () => (/* binding */ Body),
/* harmony export */   "Content": () => (/* binding */ Content),
/* harmony export */   "default": () => (/* binding */ Sidebar)
/* harmony export */ });
/* harmony import */ var _Component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Component */ "./lib/tray_library/Component.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _TrayItemWidget__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./TrayItemWidget */ "./lib/tray_library/TrayItemWidget.js");
/* harmony import */ var _TrayWidget__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./TrayWidget */ "./lib/tray_library/TrayWidget.js");
/* harmony import */ var react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-accessible-accordion */ "webpack/sharing/consume/default/react-accessible-accordion/react-accessible-accordion");
/* harmony import */ var react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _server_handler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../server/handler */ "./lib/server/handler.js");







const Body = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  min-height: 100%;
  background-color: black;
  height: 100%;
  overflow-y: auto;
`;
const Content = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    max-height: auto;
    'border-top': '4px solid #dfe2e5'
`;
const headerList = [
    { task: 'GENERAL', id: 1 }
];
const advancedList = [
    { task: 'ADVANCED', id: 1 }
];
const colorList_adv = [
    { task: "rgb(192,255,0)", id: 1 },
    { task: "rgb(0,102,204)", id: 2 },
    { task: "rgb(255,153,102)", id: 3 },
    { task: "rgb(255,102,102)", id: 4 },
    { task: "rgb(15,255,255)", id: 5 },
    { task: "rgb(255,204,204)", id: 6 },
    { task: "rgb(153,204,51)", id: 7 },
    { task: "rgb(255,153,0)", id: 8 },
    { task: "rgb(255,204,0)", id: 9 },
    { task: "rgb(204,204,204)", id: 10 },
    { task: "rgb(153,204,204)", id: 11 },
    { task: "rgb(153,0,102)", id: 12 },
    { task: "rgb(102,51,102)", id: 13 },
    { task: "rgb(153,51,204)", id: 14 },
    { task: "rgb(102,102,102)", id: 15 },
    { task: "rgb(255,102,0)", id: 16 },
    { task: "rgb(51,51,51)", id: 17 },
];
const colorList_general = [
    { task: "rgb(21,21,51)", id: 1 }
];
async function fetchComponent(componentList) {
    let component_root = componentList.map(x => x["category"]);
    let headers = Array.from(new Set(component_root));
    let headerList = [];
    let headerList2 = [];
    let displayHeaderList = [];
    for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
        if (headers[headerIndex] == 'ADVANCED' || headers[headerIndex] == 'GENERAL') {
            headerList.push(headers[headerIndex]);
        }
        else {
            headerList2.push(headers[headerIndex]);
        }
    }
    if (headerList.length != 0) {
        headerList = headerList.sort((a, b) => a < b ? 1 : a > b ? -1 : 0);
        headers = [...headerList, ...headerList2];
        for (let headerIndex2 = 0; headerIndex2 < headers.length; headerIndex2++) {
            displayHeaderList.push({
                "task": headers[headerIndex2],
                "id": headerIndex2 + 1
            });
        }
    }
    return displayHeaderList;
}
function Sidebar(props) {
    const [componentList, setComponentList] = react__WEBPACK_IMPORTED_MODULE_0___default().useState([]);
    const [category, setCategory] = react__WEBPACK_IMPORTED_MODULE_0___default().useState([]);
    const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [runOnce, setRunOnce] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    let handleOnChange = (event) => {
        setSearchTerm("");
        setSearchTerm(event.target.value);
    };
    function handleSearchOnClick() {
        setSearchTerm("");
        setSearchTerm(searchTerm);
    }
    async function getConfig(request) {
        const dataToSend = { "config_request": request };
        try {
            const server_reply = await (0,_server_handler__WEBPACK_IMPORTED_MODULE_3__.requestAPI)('get/config', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            return server_reply;
        }
        catch (reason) {
            console.error(`Error on POST get/config ${dataToSend}.\n${reason}`);
        }
    }
    ;
    const fetchComponentList = async () => {
        // get the component list by sending the jupyterlab frontend and base path
        const response_1 = await (0,_Component__WEBPACK_IMPORTED_MODULE_4__["default"])(props.lab.serviceManager);
        // get the header from the components
        const response_2 = await fetchComponent(response_1);
        // to ensure the component list is empty before setting the component list
        if (response_1.length > 0) {
            setComponentList([]);
            setCategory([]);
        }
        setComponentList(response_1);
        setCategory(response_2);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (!runOnce) {
            fetchComponentList();
            setRunOnce(true);
        }
    }, [category, componentList]);
    function handleRefreshOnClick() {
        fetchComponentList();
    }
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const intervalId = setInterval(() => {
            fetchComponentList();
        }, 600000); // every 10 minutes should re-fetch the component list
        return () => clearInterval(intervalId);
    }, [category, componentList]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Body, null,
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Content, null,
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrayWidget__WEBPACK_IMPORTED_MODULE_5__.TrayWidget, null,
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null,
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "search-input" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", { type: "text", name: "", value: searchTerm, placeholder: "SEARCH", className: "search-input__text-input", style: { width: "75%" }, onChange: handleOnChange }),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", { onClick: handleSearchOnClick, className: "search-input__button" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("i", { className: "fa fa-search " })),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", { onClick: handleRefreshOnClick, className: "search-input__button" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("i", { className: "fa fa-refresh " }))),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.Accordion, { allowZeroExpanded: true }, category.filter((val) => {
                        if (searchTerm == "") {
                            return val;
                        }
                    }).map((val, i) => {
                        return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItem, { key: `index-1-${val["task"].toString()}` },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItemHeading, null,
                                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItemButton, null, val["task"])),
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_accessible_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionItemPanel, null, componentList.filter((componentVal) => {
                                if (searchTerm == "") {
                                    return componentVal;
                                }
                            }).map((componentVal, i2) => {
                                if (componentVal["category"].toString().toUpperCase() == val["task"].toString()) {
                                    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { key: `index-1-${i2}` },
                                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_6__.TrayItemWidget, { model: {
                                                type: componentVal.type,
                                                name: componentVal.task
                                            }, name: componentVal.task, color: componentVal.color, app: props.lab, path: componentVal.file_path })));
                                }
                            }))));
                    })),
                    componentList.filter((val) => {
                        if (searchTerm != "" && val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return val;
                        }
                    }).map((val, i) => {
                        return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { key: `index-3-${i}` },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_6__.TrayItemWidget, { model: { type: val.type, name: val.task }, name: val.task, color: val.color, app: props.lab, path: val.file_path })));
                    }))))));
}
;
//# sourceMappingURL=Sidebar.js.map

/***/ }),

/***/ "./lib/tray_library/TrayItemWidget.js":
/*!********************************************!*\
  !*** ./lib/tray_library/TrayItemWidget.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tray": () => (/* binding */ Tray),
/* harmony export */   "TrayItemWidget": () => (/* binding */ TrayItemWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);


const Tray = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	color: black;
	font-family: Helvetica, Arial;
	padding: 7px;
	width: auto;
	margin: 7px;
	border: solid 1px ${(p) => p.color};
	border-radius: 5px;
	margin-bottom: 2px;
	cursor: pointer;
`;
class TrayItemWidget extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(Tray, { color: this.props.color || "white", draggable: true, onDragStart: (event) => {
                event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
                this.forceUpdate();
            }, onClick: (event) => {
                if (event.ctrlKey || event.metaKey) {
                    const { commands } = this.props.app;
                    commands.execute('docmanager:open', {
                        path: this.props.path
                    });
                }
                this.forceUpdate();
            }, onDoubleClick: (event) => {
                if (this.props.path != "") {
                    const { commands } = this.props.app;
                    commands.execute('docmanager:open', {
                        path: this.props.path
                    });
                }
                this.forceUpdate();
            }, className: "tray-item" }, this.props.name));
    }
}
//# sourceMappingURL=TrayItemWidget.js.map

/***/ }),

/***/ "./lib/tray_library/TrayWidget.js":
/*!****************************************!*\
  !*** ./lib/tray_library/TrayWidget.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tray": () => (/* binding */ Tray),
/* harmony export */   "TrayWidget": () => (/* binding */ TrayWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);


const Tray = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	min-width: 150px;
	background: rgb(255, 255, 255);
	flex-grow: 1;
	width: 150px;
	flex-shrink: 1;
	max-height: auto;
	overflow-y: auto;
`;
class TrayWidget extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    render() {
        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Tray, null, this.props.children);
    }
}
//# sourceMappingURL=TrayWidget.js.map

/***/ }),

/***/ "./lib/ui-components/icons.js":
/*!************************************!*\
  !*** ./lib/ui-components/icons.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "xircuitsFaviconLink": () => (/* binding */ xircuitsFaviconLink),
/* harmony export */   "xircuitsIcon": () => (/* binding */ xircuitsIcon),
/* harmony export */   "debuggerIcon": () => (/* binding */ debuggerIcon),
/* harmony export */   "lockIcon": () => (/* binding */ lockIcon),
/* harmony export */   "breakpointIcon": () => (/* binding */ breakpointIcon),
/* harmony export */   "nextIcon": () => (/* binding */ nextIcon),
/* harmony export */   "revertIcon": () => (/* binding */ revertIcon),
/* harmony export */   "componentLibIcon": () => (/* binding */ componentLibIcon),
/* harmony export */   "changeFavicon": () => (/* binding */ changeFavicon)
/* harmony export */ });
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_icons_xpress_logo_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../style/icons/xpress-logo.svg */ "./style/icons/xpress-logo.svg");
/* harmony import */ var _style_icons_debugger_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../style/icons/debugger.svg */ "./style/icons/debugger.svg");
/* harmony import */ var _style_icons_lock_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../style/icons/lock.svg */ "./style/icons/lock.svg");
/* harmony import */ var _style_icons_breakpoint_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../style/icons/breakpoint.svg */ "./style/icons/breakpoint.svg");
/* harmony import */ var _style_icons_next_svg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../style/icons/next.svg */ "./style/icons/next.svg");
/* harmony import */ var _style_icons_revert_svg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../style/icons/revert.svg */ "./style/icons/revert.svg");
/* harmony import */ var _style_icons_component_library_svg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../style/icons/component-library.svg */ "./style/icons/component-library.svg");








const xircuitsFaviconLink = 'https://raw.githubusercontent.com/XpressAI/xircuits/master/style/icons/xpress-logo.ico';
const xircuitsIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__.LabIcon({ name: 'xircuits:xircuits', svgstr: _style_icons_xpress_logo_svg__WEBPACK_IMPORTED_MODULE_1__["default"] });
const debuggerIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__.LabIcon({ name: 'xircuits:debuggerIcon', svgstr: _style_icons_debugger_svg__WEBPACK_IMPORTED_MODULE_2__["default"] });
const lockIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__.LabIcon({ name: 'xircuits:lockIcon', svgstr: _style_icons_lock_svg__WEBPACK_IMPORTED_MODULE_3__["default"] });
const breakpointIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__.LabIcon({ name: 'xircuits:breakpointIcon', svgstr: _style_icons_breakpoint_svg__WEBPACK_IMPORTED_MODULE_4__["default"] });
const nextIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__.LabIcon({ name: 'xircuits:nextIcon', svgstr: _style_icons_next_svg__WEBPACK_IMPORTED_MODULE_5__["default"] });
const revertIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__.LabIcon({ name: 'xircuits:revertIcon', svgstr: _style_icons_revert_svg__WEBPACK_IMPORTED_MODULE_6__["default"] });
const componentLibIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_0__.LabIcon({ name: 'xircuits:componentLibIcon', svgstr: _style_icons_component_library_svg__WEBPACK_IMPORTED_MODULE_7__["default"] });
function changeFavicon(src) {
    let head = document.head || document.getElementsByTagName('head')[0];
    let link = document.createElement('link'), oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = src;
    if (oldLink) {
        head.removeChild(oldLink);
    }
    head.appendChild(link);
}
//# sourceMappingURL=icons.js.map

/***/ }),

/***/ "./lib/xircuitFactory.js":
/*!*******************************!*\
  !*** ./lib/xircuitFactory.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "XircuitFactory": () => (/* binding */ XircuitFactory)
/* harmony export */ });
/* harmony import */ var _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/docregistry */ "webpack/sharing/consume/default/@jupyterlab/docregistry");
/* harmony import */ var _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @lumino/signaling */ "webpack/sharing/consume/default/@lumino/signaling");
/* harmony import */ var _lumino_signaling__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lumino_signaling__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _xircuitWidget__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./xircuitWidget */ "./lib/xircuitWidget.js");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");
/* harmony import */ var _log_LogPlugin__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./log/LogPlugin */ "./lib/log/LogPlugin.js");
/* harmony import */ var _components_RunSwitcher__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/RunSwitcher */ "./lib/components/RunSwitcher.js");
/* harmony import */ var _ui_components_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ui-components/icons */ "./lib/ui-components/icons.js");









const XPIPE_CLASS = 'xircuits-editor';
class XircuitFactory extends _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_0__.ABCWidgetFactory {
    constructor(options) {
        super(options);
        this.app = options.app;
        this.shell = options.shell;
        this.commands = options.commands;
        this.serviceManager = options.serviceManager;
        this.saveXircuitSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.compileXircuitSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.runXircuitSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.runTypeXircuitSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.debugXircuitSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.lockNodeSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.breakpointXircuitSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.currentNodeSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.testXircuitSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.continueDebugSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.nextNodeDebugSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.stepOverDebugSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.terminateDebugSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.stepInDebugSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.stepOutDebugSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.evaluateDebugSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
        this.debugModeSignal = new _lumino_signaling__WEBPACK_IMPORTED_MODULE_1__.Signal(this);
    }
    createNewWidget(context) {
        // Creates a blank widget with a DocumentWidget wrapper
        const props = {
            app: this.app,
            shell: this.shell,
            commands: this.commands,
            context: context,
            serviceManager: this.serviceManager,
            saveXircuitSignal: this.saveXircuitSignal,
            compileXircuitSignal: this.compileXircuitSignal,
            runXircuitSignal: this.runXircuitSignal,
            runTypeXircuitSignal: this.runTypeXircuitSignal,
            debugXircuitSignal: this.debugXircuitSignal,
            lockNodeSignal: this.lockNodeSignal,
            breakpointXircuitSignal: this.breakpointXircuitSignal,
            currentNodeSignal: this.currentNodeSignal,
            testXircuitSignal: this.testXircuitSignal,
            continueDebugSignal: this.continueDebugSignal,
            nextNodeDebugSignal: this.nextNodeDebugSignal,
            stepOverDebugSignal: this.stepOverDebugSignal,
            terminateDebugSignal: this.terminateDebugSignal,
            stepInDebugSignal: this.stepInDebugSignal,
            stepOutDebugSignal: this.stepOutDebugSignal,
            evaluateDebugSignal: this.evaluateDebugSignal,
            debugModeSignal: this.debugModeSignal
        };
        const content = new _xircuitWidget__WEBPACK_IMPORTED_MODULE_4__.XPipePanel(props);
        const widget = new _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_0__.DocumentWidget({ content, context });
        widget.addClass(XPIPE_CLASS);
        widget.title.icon = _ui_components_icons__WEBPACK_IMPORTED_MODULE_5__.xircuitsIcon;
        /**
         * Create a save button toolbar item.
         */
        let saveButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__.saveIcon,
            tooltip: 'Save Xircuits',
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.saveXircuit);
            }
        });
        /**
         * Create a reload button toolbar item.
         */
        let reloadButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__.refreshIcon,
            tooltip: 'Reload Xircuits from Disk',
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.reloadDocManager);
            }
        });
        /**
         * Create a revert button toolbar item.
         */
        let revertButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _ui_components_icons__WEBPACK_IMPORTED_MODULE_5__.revertIcon,
            tooltip: 'Revert Xircuits to Checkpoint',
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.revertDocManager);
            }
        });
        /**
         * Create a compile button toolbar item.
         */
        let compileButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__.checkIcon,
            tooltip: 'Compile Xircuits',
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.compileXircuit);
            }
        });
        /**
         * Create a run button toolbar item.
         */
        let runButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__.runIcon,
            tooltip: 'Run Xircuits',
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.runXircuit);
            }
        });
        /**
         * Create a debug button toolbar item.
         */
        let debugButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__.bugIcon,
            tooltip: 'Open Xircuits Debugger and enable Image Viewer',
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.debugXircuit);
            }
        });
        /**
         * Create a log button toolbar item.
         */
        let logButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__.listIcon,
            tooltip: 'Open log',
            onClick: () => {
                this.commands.execute(_log_LogPlugin__WEBPACK_IMPORTED_MODULE_7__.CommandIDs.openLog);
            }
        });
        /**
         * Create a lock button toolbar item.
         */
        let lockButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _ui_components_icons__WEBPACK_IMPORTED_MODULE_5__.lockIcon,
            tooltip: "Lock all non-general nodes connected from start node",
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.lockXircuit);
            }
        });
        /**
         * Create a test button toolbar item.
         */
        let testButton = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton({
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_2__.editIcon,
            tooltip: 'For testing purpose',
            onClick: () => {
                this.commands.execute(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_6__.commandIDs.testXircuit);
            }
        });
        widget.toolbar.insertItem(0, 'xircuits-add-save', saveButton);
        widget.toolbar.insertItem(1, 'xircuits-add-reload', reloadButton);
        widget.toolbar.insertItem(2, 'xircuits-add-revert', revertButton);
        widget.toolbar.insertItem(3, 'xircuits-add-compile', compileButton);
        widget.toolbar.insertItem(4, 'xircuits-add-run', runButton);
        widget.toolbar.insertItem(5, 'xircuits-add-debug', debugButton);
        widget.toolbar.insertItem(6, 'xircuits-add-lock', lockButton);
        widget.toolbar.insertItem(7, 'xircuits-add-log', logButton);
        widget.toolbar.insertItem(8, 'xircuits-add-test', testButton);
        widget.toolbar.insertItem(9, 'xircuits-run-type', new _components_RunSwitcher__WEBPACK_IMPORTED_MODULE_8__.RunSwitcher(this));
        return widget;
    }
}
//# sourceMappingURL=xircuitFactory.js.map

/***/ }),

/***/ "./lib/xircuitWidget.js":
/*!******************************!*\
  !*** ./lib/xircuitWidget.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "XPipePanel": () => (/* binding */ XPipePanel)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/xircuitBodyWidget */ "./lib/components/xircuitBodyWidget.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_XircuitsApp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/XircuitsApp */ "./lib/components/XircuitsApp.js");




/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
class XPipePanel extends _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ReactWidget {
    constructor(options) {
        super(options);
        this.app = options.app;
        this.shell = options.shell;
        this.commands = options.commands;
        this.context = options.context;
        this.serviceManager = options.serviceManager;
        this.saveXircuitSignal = options.saveXircuitSignal;
        this.compileXircuitSignal = options.compileXircuitSignal;
        this.runXircuitSignal = options.runXircuitSignal;
        this.runTypeXircuitSignal = options.runTypeXircuitSignal;
        this.debugXircuitSignal = options.debugXircuitSignal;
        this.lockNodeSignal = options.lockNodeSignal;
        this.breakpointXircuitSignal = options.breakpointXircuitSignal;
        this.currentNodeSignal = options.currentNodeSignal;
        this.testXircuitSignal = options.testXircuitSignal;
        this.continueDebugSignal = options.continueDebugSignal;
        this.nextNodeDebugSignal = options.nextNodeDebugSignal;
        this.stepOverDebugSignal = options.stepOverDebugSignal;
        this.terminateDebugSignal = options.terminateDebugSignal;
        this.stepInDebugSignal = options.stepInDebugSignal;
        this.stepOutDebugSignal = options.stepOutDebugSignal;
        this.evaluateDebugSignal = options.evaluateDebugSignal;
        this.debugModeSignal = options.debugModeSignal;
        this.xircuitsApp = new _components_XircuitsApp__WEBPACK_IMPORTED_MODULE_2__.XircuitsApplication(this.app);
    }
    handleEvent(event) {
        if (event.type === 'mouseup') {
            // force focus on the editor in order stop key event propagation (e.g. "Delete" key) into unintended
            // parts of jupyter lab.
            this.node.focus();
            // Just to enable back the loses focus event
            this.node.addEventListener('blur', this, true);
        }
        else if (event.type === 'blur') {
            // Unselect any selected nodes when the editor loses focus
            const deactivate = x => x.setSelected(false);
            const model = this.xircuitsApp.getDiagramEngine().getModel();
            model.getNodes().forEach(deactivate);
            model.getLinks().forEach(deactivate);
        }
        else if (event.type === 'contextmenu') {
            // Disable loses focus event when opening context menu
            this.node.removeEventListener('blur', this, true);
        }
    }
    onAfterAttach(msg) {
        this.node.addEventListener('mouseup', this, true);
        this.node.addEventListener('blur', this, true);
        this.node.addEventListener('contextmenu', this, true);
    }
    onBeforeDetach() {
        this.node.removeEventListener('mouseup', this, true);
        this.node.removeEventListener('blur', this, true);
        this.node.removeEventListener('contextmenu', this, true);
    }
    render() {
        var _a;
        return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_components_xircuitBodyWidget__WEBPACK_IMPORTED_MODULE_3__.BodyWidget, { context: this.context, xircuitsApp: this.xircuitsApp, app: this.app, shell: this.shell, commands: this.commands, widgetId: (_a = this.parent) === null || _a === void 0 ? void 0 : _a.id, serviceManager: this.serviceManager, saveXircuitSignal: this.saveXircuitSignal, compileXircuitSignal: this.compileXircuitSignal, runXircuitSignal: this.runXircuitSignal, runTypeXircuitSignal: this.runTypeXircuitSignal, debugXircuitSignal: this.debugXircuitSignal, lockNodeSignal: this.lockNodeSignal, breakpointXircuitSignal: this.breakpointXircuitSignal, currentNodeSignal: this.currentNodeSignal, testXircuitSignal: this.testXircuitSignal, continueDebugSignal: this.continueDebugSignal, nextNodeDebugSignal: this.nextNodeDebugSignal, stepOverDebugSignal: this.stepOverDebugSignal, terminateDebugSignal: this.terminateDebugSignal, stepInDebugSignal: this.stepInDebugSignal, stepOutDebugSignal: this.stepOutDebugSignal, evaluateDebugSignal: this.evaluateDebugSignal, debugModeSignal: this.debugModeSignal }));
    }
}
//# sourceMappingURL=xircuitWidget.js.map

/***/ }),

/***/ "./style/icons/breakpoint.svg":
/*!************************************!*\
  !*** ./style/icons/breakpoint.svg ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("<svg height='100px' width='100px' class=\"jp-icon3\" fill=\"#616161\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n     version=\"1.1\" x=\"0px\" y=\"0px\" viewBox=\"0 0 99 100\" enable-background=\"new 0 0 99 100\" xml:space=\"preserve\">\n    <circle class=\"jp-icon3\" stroke=\"#000000\" stroke-miterlimit=\"10\" cx=\"50.5\" cy=\"50\" r=\"30.167\"></circle>\n    <circle class=\"jp-icon3\" fill=\"#616161\" stroke=\"#000000\" stroke-miterlimit=\"10\" cx=\"50.573\" cy=\"50\" r=\"27.973\"></circle>\n</svg>");

/***/ }),

/***/ "./style/icons/component-library.svg":
/*!*******************************************!*\
  !*** ./style/icons/component-library.svg ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("<svg class=\"jp-icon3\"  fill=\"#616161\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" x=\"-50px\" y=\"0px\" \n     viewBox=\"15 0 70 100\" enable-background=\"new 0 0 100 100\" xml:space=\"preserve\">\n    <g class=\"jp-icon3\" fill=\"#616161\" >\n        <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M80,70H20V33h9v-7h16v7h12v-7h16v7h7V70z\"></path>\n    </g>\n</svg>");

/***/ }),

/***/ "./style/icons/debugger.svg":
/*!**********************************!*\
  !*** ./style/icons/debugger.svg ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("<svg height='100px' width='100px' class=\"jp-icon3\"  fill=\"#616161\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" x=\"0px\" y=\"0px\" \n     viewBox=\"0 0 100 100\" enable-background=\"new 0 0 100 100\" xml:space=\"preserve\">\n    <path d=\"M87,15H13c-3.314,0-6,2.686-6,6v58c0,3.314,2.686,6,6,6h74c3.314,0,6-2.686,6-6V21C93,17.686,90.314,15,87,15z M80,19  c1.657,0,3,1.343,3,3s-1.343,3-3,3s-3-1.343-3-3S78.343,19,80,19z M68,19c1.657,0,3,1.343,3,3s-1.343,3-3,3s-3-1.343-3-3  S66.343,19,68,19z M56,19c1.657,0,3,1.343,3,3s-1.343,3-3,3s-3-1.343-3-3S54.343,19,56,19z M87,78c0,0.552-0.448,1-1,1H14  c-0.552,0-1-0.448-1-1V30c0-0.552,0.448-1,1-1h72c0.552,0,1,0.448,1,1V78z\"></path>\n    <path d=\"M71,56h-5.678c-0.249,0-0.454-0.186-0.488-0.433c-0.142-1.026-0.374-2.016-0.693-2.961  c-0.076-0.225,0.012-0.469,0.218-0.587l4.828-2.787c2.293-1.324,0.288-4.785-2-3.464l-4.69,2.708  c-0.215,0.124-0.484,0.067-0.637-0.129c-0.993-1.267-2.208-2.356-3.632-3.213c-0.141-0.085-0.227-0.234-0.232-0.398  c-0.041-1.252-0.375-2.428-0.929-3.47c-0.103-0.195-0.075-0.43,0.081-0.585l2.266-2.266c1.869-1.869-0.958-4.699-2.828-2.828  l-2.267,2.267c-0.155,0.155-0.391,0.183-0.586,0.08c-2.344-1.244-5.123-1.244-7.467,0c-0.194,0.103-0.43,0.075-0.586-0.08  l-2.267-2.267c-1.869-1.869-4.699,0.958-2.828,2.828l2.266,2.266c0.156,0.156,0.184,0.391,0.081,0.585  c-0.553,1.042-0.887,2.218-0.929,3.47c-0.005,0.164-0.091,0.314-0.232,0.398c-1.425,0.857-2.64,1.946-3.632,3.213  c-0.153,0.196-0.422,0.253-0.637,0.129l-4.69-2.708c-2.288-1.321-4.292,2.141-2,3.464l4.828,2.787  c0.206,0.119,0.294,0.363,0.218,0.587c-0.319,0.944-0.552,1.935-0.693,2.961C35.132,55.814,34.927,56,34.678,56H29  c-2.643,0-2.646,4,0,4h5.724c0.245,0,0.447,0.179,0.486,0.421c0.161,0.998,0.415,1.964,0.763,2.886c0.086,0.228,0,0.482-0.211,0.604  l-4.948,2.857c-2.289,1.321-0.291,4.787,2,3.464l4.958-2.863c0.211-0.122,0.475-0.069,0.63,0.12C41.152,70.848,45.32,73,50,73  s8.848-2.152,11.598-5.511c0.155-0.189,0.418-0.242,0.63-0.12l4.958,2.863c2.289,1.321,4.291-2.141,2-3.464l-4.948-2.857  c-0.211-0.122-0.298-0.376-0.211-0.604c0.347-0.922,0.602-1.888,0.763-2.886C64.828,60.179,65.031,60,65.276,60H71  C73.643,60,73.646,56,71,56z M44,66c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S45.657,66,44,66z M44,56c-1.657,0-3-1.343-3-3  s1.343-3,3-3s3,1.343,3,3S45.657,56,44,56z M56,66c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S57.657,66,56,66z M56,56  c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S57.657,56,56,56z\"></path>\n</svg>");

/***/ }),

/***/ "./style/icons/lock.svg":
/*!******************************!*\
  !*** ./style/icons/lock.svg ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("\n<svg viewBox=\"0 0 512 512\"  xmlns=\"http://www.w3.org/2000/svg\"> \n    <g class=\"jp-icon3\" fill=\"#616161\">\n        <path d=\"m426.67 426.67v-213.34c0-23.465-19.199-42.668-42.668-42.668l-256 0.003907c-23.465 0-42.668 19.199-42.668 42.668v213.33c0 23.465 19.199 42.668 42.668 42.668h256c23.465-0.003907 42.668-19.203 42.668-42.668zm-128-106.67c0 23.465-19.199 42.668-42.668 42.668-23.465 0-42.668-19.199-42.668-42.668 0-23.465 19.199-42.668 42.668-42.668 23.465 0 42.668 19.203 42.668 42.668z\"/>\n        <path transform=\"scale(21.333)\" d=\"m17 12v-5.0001c0-2.8-2.2-5.0001-5.0001-5.0001-2.8 1.83e-4 -5.0001 2.2002-5.0001 5.0001v5.0001\" fill=\"none\" stroke=\"#616161\" stroke-miterlimit=\"10\" stroke-width=\"2\"/>\n    </g>\n</svg>\n");

/***/ }),

/***/ "./style/icons/next.svg":
/*!******************************!*\
  !*** ./style/icons/next.svg ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("<svg stroke=\"black\" stroke-width=\"5\" class=\"jp-icon3\" fill=\"#616161\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" x=\"0px\" y=\"0px\" viewBox=\"17 9 50 70\" enable-background=\"new 0 0 50 50\" xml:space=\"preserve\">\n    <polygon points=\"47.003,25 44.003,28.006 58.001,42 22,42 22,46 57.996,46 44,59.996 47,62.996 66.005,44.002 \"></polygon>\n</svg>");

/***/ }),

/***/ "./style/icons/revert.svg":
/*!********************************!*\
  !*** ./style/icons/revert.svg ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg class=\"jp-icon3\" fill=\"#616161\" version=\"1.1\" viewBox=\"0 -55 1350 1350\" xmlns=\"http://www.w3.org/2000/svg\">\n <path d=\"m610.36 114.64c19.523 19.527 19.523 51.184 0 70.711l-64.645 64.645h79.289c232.61 0 425 192.39 425 425s-192.39 425-425 425-425-192.39-425-425c0-27.613 22.387-50 50-50s50 22.387 50 50c0 177.39 147.61 325 325 325s325-147.61 325-325-147.61-325-325-325h-79.289l64.645 64.645c19.523 19.527 19.523 51.184 0 70.711-19.527 19.523-51.184 19.523-70.711 0l-150-150c-19.527-19.527-19.527-51.184 0-70.711l150-150c19.527-19.527 51.184-19.527 70.711 0z\"/>\n</svg>\n");

/***/ }),

/***/ "./style/icons/xpress-logo.svg":
/*!*************************************!*\
  !*** ./style/icons/xpress-logo.svg ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!-- Generator: Adobe Illustrator 25.0.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 270 250\" style=\"enable-background:new 0 0 270 250;\" xml:space=\"preserve\">\n<style type=\"text/css\">\n\t.st0{fill:#3EA5BD;}\n\t.st1{fill:#324057;}\n</style>\n<g>\n\t<g>\n\t\t<g>\n\t\t\t<path class=\"st0\" d=\"M27.6,5.6c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S34.7,5.6,27.6,5.6z\"/>\n\t\t\t<path class=\"st0\" d=\"M63,5.6c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S70.2,5.6,63,5.6z\"/>\n\t\t\t<path class=\"st0\" d=\"M27.6,41c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S34.7,41,27.6,41z\"/>\n\t\t\t<path class=\"st0\" d=\"M63,41c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S70.2,41,63,41z\"/>\n\t\t\t<path class=\"st0\" d=\"M27.6,76.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C40.5,82.3,34.7,76.5,27.6,76.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M63,76.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C76,82.3,70.2,76.5,63,76.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M63,112c-7.2,0-13,5.8-13,13c0,7.2,5.8,13,13,13s13-5.8,13-13S70.2,112,63,112z\"/>\n\t\t\t<path class=\"st0\" d=\"M27.6,147.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C40.5,153.3,34.7,147.5,27.6,147.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M63,147.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C76,153.3,70.2,147.5,63,147.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M27.6,183c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S34.7,183,27.6,183z\"/>\n\t\t\t<path class=\"st0\" d=\"M63,183c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S70.2,183,63,183z\"/>\n\t\t\t<path class=\"st0\" d=\"M27.6,218.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S34.7,218.5,27.6,218.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M63,218.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S70.2,218.5,63,218.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M98.5,41c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C111.5,46.9,105.7,41,98.5,41z\"/>\n\t\t\t<path class=\"st0\" d=\"M98.5,76.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C111.5,82.3,105.7,76.5,98.5,76.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M98.5,147.5c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C111.5,153.3,105.7,147.5,98.5,147.5z\"/>\n\t\t\t<path class=\"st0\" d=\"M98.5,183c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13C111.5,188.8,105.7,183,98.5,183z\"/>\n\t\t</g>\n\t\t<g>\n\t\t\t<path class=\"st1\" d=\"M240.5,244.4c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S233.3,244.4,240.5,244.4z\"/>\n\t\t\t<path class=\"st1\" d=\"M205,244.4c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S197.8,244.4,205,244.4z\"/>\n\t\t\t<path class=\"st1\" d=\"M240.5,208.9c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S233.3,208.9,240.5,208.9z\"/>\n\t\t\t<path class=\"st1\" d=\"M205,208.9c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C192,203.1,197.8,208.9,205,208.9z\"/>\n\t\t\t<path class=\"st1\" d=\"M240.5,173.5c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C227.5,167.6,233.3,173.5,240.5,173.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M205,173.5c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C192,167.6,197.8,173.5,205,173.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M205,138c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C192,132.2,197.8,138,205,138z\"/>\n\t\t\t<path class=\"st1\" d=\"M240.5,102.5c7.2,0,13-5.8,13-13c0-7.2-5.8-13-13-13s-13,5.8-13,13C227.5,96.7,233.3,102.5,240.5,102.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M205,102.5c7.2,0,13-5.8,13-13c0-7.2-5.8-13-13-13s-13,5.8-13,13C192,96.7,197.8,102.5,205,102.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M240.5,67c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S233.3,67,240.5,67z\"/>\n\t\t\t<path class=\"st1\" d=\"M205,67c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C192,61.2,197.8,67,205,67z\"/>\n\t\t\t<path class=\"st1\" d=\"M240.5,31.5c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S233.3,31.5,240.5,31.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M205,31.5c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S197.8,31.5,205,31.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M169.5,208.9c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S162.3,208.9,169.5,208.9z\"/>\n\t\t\t<path class=\"st1\" d=\"M169.5,173.5c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C156.5,167.6,162.3,173.5,169.5,173.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M169.5,138c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S162.3,138,169.5,138z\"/>\n\t\t\t<path class=\"st1\" d=\"M169.5,102.5c7.2,0,13-5.8,13-13c0-7.2-5.8-13-13-13s-13,5.8-13,13C156.5,96.7,162.3,102.5,169.5,102.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M169.5,67c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13S162.3,67,169.5,67z\"/>\n\t\t\t<path class=\"st1\" d=\"M134,173.5c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C121,167.6,126.8,173.5,134,173.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M134,138c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C121,132.2,126.8,138,134,138z\"/>\n\t\t\t<path class=\"st1\" d=\"M134,102.5c7.2,0,13-5.8,13-13c0-7.2-5.8-13-13-13s-13,5.8-13,13C121,96.7,126.8,102.5,134,102.5z\"/>\n\t\t\t<path class=\"st1\" d=\"M98.5,138c7.2,0,13-5.8,13-13s-5.8-13-13-13s-13,5.8-13,13C85.6,132.2,91.4,138,98.5,138z\"/>\n\t\t</g>\n\t</g>\n</g>\n</svg>\n");

/***/ })

}]);
//# sourceMappingURL=lib_index_js.26dcae8a8ee9d7d24d36.js.map