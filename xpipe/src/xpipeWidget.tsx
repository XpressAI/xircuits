import { Dialog, ReactWidget, showDialog } from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILabShell } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import {
  DocumentRegistry,
  ABCWidgetFactory,
  DocumentWidget,
  Context
} from '@jupyterlab/docregistry';
import { BodyWidget } from './components/xpipeBodyWidget';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ActionEventBus, ZoomCanvasAction } from '@projectstorm/react-canvas-core';
import * as SRD from '@projectstorm/react-diagrams';
import {CustomNodeFactory} from "./components/CustomNodeFactory";
import { CustomNodeModel } from './components/CustomNodeModel';

import { XPipeDocChange, XPipeDocModel } from './xpipeModel';

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
export class XPipePanel extends ReactWidget {
  browserFactory: IFileBrowserFactory;
  shell: ILabShell;
  commands: any;
  addFileToXpipeSignal: Signal<this, any>;
  context: any;

  activeModel: SRD.DiagramModel;
	diagramEngine: SRD.DiagramEngine;

  private _clients: { [id: string]: HTMLElement };


  constructor(options: any) {
    super(options);
    this.browserFactory = options.browserFactory;
    this.shell = options.shell;
    this.commands = options.commands;
    this.addFileToXpipeSignal = options.addFileToXpipeSignal;
    this.context = options.context;
    
    //debugger;
    console.log(this.context);

    this.diagramEngine = SRD.default({registerDefaultZoomCanvasAction: false});
		this.activeModel = new SRD.DiagramModel();
		this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory());
		this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({inverseZoom:true}))
    this.diagramEngine.setModel(this.activeModel);
    
    this.context.ready.then((value) => {

      this.context.model.sharedModelChanged.connect(this._onContentChanged);
      this.context.model.clientChanged.connect(this._onClientChanged);

      const model = this.context.model.getSharedObject();

      //check if model has a node and link layer
      if (model.layers){
      console.log("loading deseralized model!")
      this.activeModel.deserializeModel(model, this.diagramEngine);
			this.diagramEngine.setModel(this.activeModel);
     }
     else {
      console.log("init new model!")
      let startNode = new CustomNodeModel({ name:'Start', color:'rgb(255,102,102)', extras:{ "type":"Start" } });
      startNode.addOutPortEnhance('▶', 'out-0');
      startNode.addOutPortEnhance('  ', 'parameter-out-1');
      startNode.setPosition(100, 100);
  
      let finishedNode = new CustomNodeModel({ name:'Finish', color:'rgb(255,102,102)', extras:{ "type":"Finish" } });
      finishedNode.addInPortEnhance('▶', 'in-0');
      finishedNode.addInPortEnhance('  ', 'parameter-in-1');
      finishedNode.setPosition(700, 100);
  
      this.activeModel.addAll(startNode, finishedNode);
      this.diagramEngine.setModel(this.activeModel);
     }

     debugger;

      this.update();
    });
  }

  render(): any {
    return (
      <BodyWidget
        context={this.context}
        browserFactory={this.browserFactory}
        shell={this.shell}
        commands={this.commands}
        //addFileToXpipeSignal={this.addFileToXpipeSignal}
        widgetId={this.parent?.id}
        activeModel={this.activeModel}
        diagramEngine={this.diagramEngine}

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
      //this._cube.style.left = change.positionChange.x + 'px';
      //this._cube.style.top = change.positionChange.y + 'px';
      // updating the widgets to re-render it
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