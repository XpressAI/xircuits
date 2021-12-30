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
import { CustomDeleteItemsAction } from './components/CustomNodeWidget';

import { DefaultLinkModel } from '@projectstorm/react-diagrams';

import * as _ from 'lodash';


import { CustomNodeFactory } from "./components/CustomNodeFactory";
import { CustomNodeModel } from './components/CustomNodeModel';

import { XPipeDocChange, XPipeDocModel } from './xpipeModel';

import { ServiceManager } from '@jupyterlab/services';
import { XpipesApplication } from './components/XpipesApp'

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class XPipePanel extends ReactWidget {

  browserFactory: IFileBrowserFactory;
  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  context: Context;
  xpipesApp: XpipesApplication;
  serviceManager: ServiceManager;
  saveXpipeSignal: Signal<this, any>;
  reloadXpipeSignal: Signal<this, any>;
  revertXpipeSignal: Signal<this, any>;
  compileXpipeSignal: Signal<this, any>;
  runXpipeSignal: Signal<this, any>;
  debugXpipeSignal: Signal<this, any>;
  lockNodeSignal: Signal<this, any>;
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
    this.lockNodeSignal = options.lockNodeSignal;
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
    var xpipesApp = new XpipesApplication(this.context);
    this.xpipesApp = xpipesApp;
  }

  render(): any {
    return (
      <BodyWidget
        context={this.context}
        xpipesApp={this.xpipesApp}
        app={this.app}
        shell={this.shell}
        commands={this.commands}
        widgetId={this.parent?.id}
        serviceManager={this.serviceManager}
        saveXpipeSignal={this.saveXpipeSignal}
        reloadXpipeSignal={this.reloadXpipeSignal}
        revertXpipeSignal={this.revertXpipeSignal}
        compileXpipeSignal={this.compileXpipeSignal}
        runXpipeSignal={this.runXpipeSignal}
        debugXpipeSignal={this.debugXpipeSignal}
        lockNodeSignal={this.lockNodeSignal}
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
}