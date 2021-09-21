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

import { XPipeModel } from './xpipeModel';

export class XpipeWidget extends ReactWidget {
  browserFactory: IFileBrowserFactory;
  shell: ILabShell;
  commands: any;
  addFileToXpipeSignal: Signal<this, any>;
  context: Context;

  activeModel: SRD.DiagramModel;
	diagramEngine: SRD.DiagramEngine;

  

  constructor(options: any) {
    super(options);
    this.browserFactory = options.browserFactory;
    this.shell = options.shell;
    this.commands = options.commands;
    this.addFileToXpipeSignal = options.addFileToXpipeSignal;
    this.context = options.context;

    console.log(this.context);

    this.diagramEngine = SRD.default({registerDefaultZoomCanvasAction: false});
		this.activeModel = new SRD.DiagramModel();
		this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory());
		this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({inverseZoom:true}))
    
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

  render(): any {
    return (
      <BodyWidget
        context={this.context}
        browserFactory={this.browserFactory}
        shell={this.shell}
        commands={this.commands}
        addFileToXpipeSignal={this.addFileToXpipeSignal}
        widgetId={this.parent?.id}
        activeModel={this.activeModel}
        diagramEngine={this.diagramEngine}

      />
    );
  }
}