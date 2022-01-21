import { ReactWidget } from '@jupyterlab/apputils';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import {
  Context
} from '@jupyterlab/docregistry';
import { BodyWidget } from './components/xpipeBodyWidget';
import React, {  } from 'react';
import * as _ from 'lodash';
import { ServiceManager } from '@jupyterlab/services';
import { XpipesApplication } from './components/XpipesApp'

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class XPipePanel extends ReactWidget {
  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  context: Context;
  xpipesApp: XpipesApplication;
  serviceManager: ServiceManager;
  saveXpipeSignal: Signal<this, any>;
  compileXpipeSignal: Signal<this, any>;
  runXpipeSignal: Signal<this, any>;
  runTypeXpipeSignal: Signal<this, any>;
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
    this.app = options.app;
    this.shell = options.shell;
    this.commands = options.commands;
    this.context = options.context;
    this.serviceManager = options.serviceManager;
    this.saveXpipeSignal = options.saveXpipeSignal;
    this.compileXpipeSignal = options.compileXpipeSignal;
    this.runXpipeSignal = options.runXpipeSignal;
    this.runTypeXpipeSignal = options.runTypeXpipeSignal;
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
    var xpipesApp = new XpipesApplication();
    this.xpipesApp = xpipesApp;
  }

  handleEvent(event: Event): void {
    if(event.type === 'mouseup'){
      // force focus on the editor in order stop key event propagation (e.g. "Delete" key) into unintended
      // parts of jupyter lab.
      this.node.focus();
    }else if(event.type === 'blur'){
      // Unselect any selected nodes when the editor loses focus
      const deactivate = x => x.setSelected(false);
      const model = this.xpipesApp.getDiagramEngine().getModel();
      model.getNodes().forEach(deactivate);
      model.getLinks().forEach(deactivate);
    }
  }

  protected onAfterAttach(msg) {
    this.node.addEventListener('mouseup', this, true);
    this.node.addEventListener('blur', this, true);
  }

  protected onBeforeDetach() {
    this.node.removeEventListener('mouseup', this, true);
    this.node.removeEventListener('blur', this, true);
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
        compileXpipeSignal={this.compileXpipeSignal}
        runXpipeSignal={this.runXpipeSignal}
        runTypeXpipeSignal={this.runTypeXpipeSignal}
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
      />
    );
  }
}
