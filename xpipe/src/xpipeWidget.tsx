import { Dialog, ReactWidget, showDialog } from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import {
  DocumentRegistry,
  ABCWidgetFactory,
  DocumentWidget,
  Context
} from '@jupyterlab/docregistry';
import { BodyWidget } from './components/xpipeBodyWidget';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as SRD from '@projectstorm/react-diagrams';
import { ActionEventBus, ZoomCanvasAction, CanvasWidget, Action, ActionEvent, InputType } from '@projectstorm/react-canvas-core';

import { DefaultLinkModel } from '@projectstorm/react-diagrams';

import * as _ from 'lodash';


import { CustomNodeFactory } from "./components/CustomNodeFactory";
import { CustomNodeModel } from './components/CustomNodeModel';

import { XPipeDocChange, XPipeDocModel } from './xpipeModel';

import { ServiceManager } from '@jupyterlab/services';

import { commandIDs } from './components/xpipeBodyWidget';

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class XPipeWidget extends DocumentWidget<
  XPipePanel,
  XPipeDocModel
> {
  constructor(options: DocumentWidget.IOptions<XPipePanel, XPipeDocModel>) {
    super(options);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }
}

interface CustomDeleteItemsActionOptions {
	keyCodes?: number[];
}

class CustomDeleteItemsAction extends Action {
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

            if (model.getOptions()["name"] !== "undefined"){
              let modelName = model.getOptions()["name"];
              if (modelName !== 'Start' && modelName !== 'Finish') {
                model.remove();
              }
              else{
                alert("Start and Finish node cannot be deleted!");
              }
          }
          });
          this.engine.repaintCanvas();
						
					
				}
			}
		});
	}
}



export class XPipePanel extends ReactWidget {

  browserFactory: IFileBrowserFactory;
  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  context: any;
  serviceManager: ServiceManager;
  saveXpipeSignal: Signal<this, any>;
  reloadXpipeSignal: Signal<this, any>;
  revertXpipeSignal: Signal<this, any>;
  compileXpipeSignal: Signal<this, any>;
  runXpipeSignal: Signal<this, any>;
  debugXpipeSignal: Signal<this, any>;
  breakpointXpipeSignal: Signal<this, any>;
  currentNodeSignal: Signal<this, any>;
  testXpipeSignal: Signal<this, any>;
  continueDebugSignal: Signal<this, any>;
  nextNodeDebugSignal: Signal<this, any>;
  stepOverDebugSignal: Signal<this, any>;
  terminateDebugSignal: Signal<this, any>;
  stepInDebugSignal: Signal<this, any>;
  stepOutDebugSignal: Signal<this, any>;
  evaluateDebugSignal: Signal<this, any>;
  debugModeSignal: Signal<this, any>;

  activeModel: SRD.DiagramModel;
  diagramEngine: SRD.DiagramEngine;

  private _clients: { [id: string]: HTMLElement };

  postConstructorFlag: boolean = false;


  constructor(options: any) {
    super(options);
    this.browserFactory = options.browserFactory;
    this.app = options.app;
    this.shell = options.shell;
    this.commands = options.commands;
    this.context = options.context;
    this.serviceManager = options.serviceManager;
    this.saveXpipeSignal = options.saveXpipeSignal;
    this.reloadXpipeSignal = options.reloadXpipeSignal;
    this.revertXpipeSignal = options.revertXpipeSignal;
    this.compileXpipeSignal = options.compileXpipeSignal;
    this.runXpipeSignal = options.runXpipeSignal;
    this.debugXpipeSignal = options.debugXpipeSignal;
    this.breakpointXpipeSignal = options.breakpointXpipeSignal;
    this.currentNodeSignal = options.currentNodeSignal;
    this.testXpipeSignal = options.testXpipeSignal;
    this.continueDebugSignal = options.continueDebugSignal;
    this.nextNodeDebugSignal = options.nextNodeDebugSignal;
    this.stepOverDebugSignal = options.stepOverDebugSignal;
    this.terminateDebugSignal = options.terminateDebugSignal;
    this.stepInDebugSignal = options.stepInDebugSignal;
    this.stepOutDebugSignal = options.stepOutDebugSignal;
    this.evaluateDebugSignal = options.evaluateDebugSignal;
    this.debugModeSignal = options.debugModeSignal;

    //debugger;
    console.log(this.context);

    this.diagramEngine = SRD.default({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
    this.activeModel = new SRD.DiagramModel();
    this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory());
    this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({ inverseZoom: true }))
    this.diagramEngine.getActionEventBus().registerAction(new CustomDeleteItemsAction());

    this.diagramEngine.setModel(this.activeModel);

    this.context.ready.then((value) => {

      this.context.model.sharedModelChanged.connect(this._onContentChanged);
      this.context.model.clientChanged.connect(this._onClientChanged);

      const model = this.context.model.getSharedObject();

      //check if model.id is empty / does not have an id
      if (model.id != '') {
        console.log("deserializing using custom method");
        //this.activeModel.deserializeModel(model, this.diagramEngine);
        let deserializedModel = this.customDeserializeModel(model, this.diagramEngine);
        this.diagramEngine.setModel(deserializedModel);

        let currentModel = this.diagramEngine.getModel().serialize();
        this.context.model.setSerializedModel(currentModel);
      }

      else {

        console.log("init new model!")
        let startNode = new CustomNodeModel({ name: 'Start', color: 'rgb(255,102,102)', extras: { "type": "Start" } });
        startNode.addOutPortEnhance('▶', 'out-0');
        startNode.addOutPortEnhance('  ', 'parameter-out-1');
        startNode.setPosition(100, 100);

        let finishedNode = new CustomNodeModel({ name: 'Finish', color: 'rgb(255,102,102)', extras: { "type": "Finish" } });
        finishedNode.addInPortEnhance('▶', 'in-0');
        finishedNode.addInPortEnhance('  ', 'parameter-in-1');
        finishedNode.setPosition(700, 100);

        this.activeModel.addAll(startNode, finishedNode);
        this.diagramEngine.setModel(this.activeModel);

        let currentModel = this.diagramEngine.getModel().serialize();
        this.context.model.setSerializedModel(currentModel);

      }

      this.postConstructorFlag = true;
      this.update();

    });
  }

  customDeserializeModel = (modelContext: any, diagramEngine: SRD.DiagramEngine) => {

    let tempModel = new SRD.DiagramModel();
    let links = modelContext["layers"][0]["models"];
    let nodes = modelContext["layers"][1]["models"];

    for (let nodeID in nodes) {

      let node = nodes[nodeID];
      let newNode = new CustomNodeModel({
        id: node.id, type: node.type, name: node.name,
        color: node.color, extras: node.extras
      });
      newNode.setPosition(node.x, node.y);

      for (let portID in node.ports) {

        let port = node.ports[portID];
        if (port.alignment == "right") newNode.addOutPortEnhance(port.label, port.name, true, port.id);
        if (port.alignment == "left") newNode.addInPortEnhance(port.label, port.name, true, port.id);

      }

      tempModel.addAll(newNode);
      diagramEngine.setModel(tempModel);

    }

    for (let linkID in links) {


      let link = links[linkID];

      if (link.sourcePort && link.targetPort) {

        let newLink = new DefaultLinkModel();

        let sourcePort = tempModel.getNode(link.source).getPortFromID(link.sourcePort);
        newLink.setSourcePort(sourcePort);

        let targetPort = tempModel.getNode(link.target).getPortFromID(link.targetPort);
        newLink.setTargetPort(targetPort);

        tempModel.addAll(newLink);
        diagramEngine.setModel(tempModel);

      }

    }

    return tempModel

  }


  render(): any {
    return (
      <BodyWidget
        context={this.context}
        browserFactory={this.browserFactory}
        app={this.app}
        shell={this.shell}
        commands={this.commands}
        widgetId={this.parent?.id}
        activeModel={this.activeModel}
        diagramEngine={this.diagramEngine}
        serviceManager={this.serviceManager}
        postConstructorFlag={this.postConstructorFlag}
        saveXpipeSignal={this.saveXpipeSignal}
        reloadXpipeSignal={this.reloadXpipeSignal}
        revertXpipeSignal={this.revertXpipeSignal}
        compileXpipeSignal={this.compileXpipeSignal}
        runXpipeSignal={this.runXpipeSignal}
        debugXpipeSignal={this.debugXpipeSignal}
        breakpointXpipeSignal={this.breakpointXpipeSignal}
        currentNodeSignal={this.currentNodeSignal}
        testXpipeSignal={this.testXpipeSignal}
        continueDebugSignal={this.continueDebugSignal}
        nextNodeDebugSignal={this.nextNodeDebugSignal}
        stepOverDebugSignal={this.stepOverDebugSignal}
        terminateDebugSignal={this.terminateDebugSignal}
        stepInDebugSignal={this.stepInDebugSignal}
        stepOutDebugSignal={this.stepOutDebugSignal}
        evaluateDebugSignal={this.evaluateDebugSignal}
        debugModeSignal={this.debugModeSignal}
        customDeserializeModel={this.customDeserializeModel}
      />
    );
  }


  /**
   * Callback to listen for changes on the model. This callback listens
   * to changes on shared model's content.
   *
   * @param sender The DocumentModel that triggers the changes.
   * @param change The changes on the model
   */
  private _onContentChanged = (
    sender: XPipeDocModel,
    change: XPipeDocChange
  ): void => {
    // Wrapping the updates into a flag to prevent apply changes triggered by the same client
    if (change.positionChange) {
      //this._cube.style.left = change.positionChange.x + 'px';
      //this._cube.style.top = change.positionChange.y + 'px';
      // updating the widgets to re-render it
      this.update();
    }

    if (change.layersChange) {

      // updating the widgets to re-render it
      console.log("layer change detected from xpipeWidget!")
      this.context.model.getSharedObject
      this.update();
    }
  };

  /**
   * Callback to listen for changes on the model. This callback listens
   * to changes on the different clients sharing the document.
   *
   * @param sender The DocumentModel that triggers the changes.
   * @param clients The list of client's states.
   */
  private _onClientChanged = (
    sender: XPipeDocModel,
    clients: Map<number, any>
  ): void => {
    clients.forEach((client, key) => {
      if (this.context.model.getClientId() !== key) {
        const id = key.toString();

        if (client.mouse && this._clients[id]) {
          this._clients[id].style.left = client.mouse.x + 'px';
          this._clients[id].style.top = client.mouse.y + 'px';
        } else if (client.mouse && !this._clients[id]) {
          const el = document.createElement('div');
          el.className = 'jp-example-client';
          el.style.left = client.mouse.x + 'px';
          el.style.top = client.mouse.y + 'px';
          el.style.backgroundColor = client.user.color;
          el.innerText = client.user.name;
          this._clients[id] = el;
          this.node.appendChild(el);
        } else if (!client.mouse && this._clients[id]) {
          this.node.removeChild(this._clients[id]);
          this._clients[id] = undefined;
        }
      }
    });

    // updating the widgets to re-render it
    this.update();
  };
}