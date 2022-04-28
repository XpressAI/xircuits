import { ReactWidget } from '@jupyterlab/apputils';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import { Context } from '@jupyterlab/docregistry';
import { BodyWidget } from './components/xircuitBodyWidget';
import React, {  } from 'react';
import * as _ from 'lodash';
import { ServiceManager } from '@jupyterlab/services';
import { XircuitsApplication } from './components/XircuitsApp';

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class XPipePanel extends ReactWidget {
  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  context: Context;
  xircuitsApp: XircuitsApplication;
  serviceManager: ServiceManager;
  fetchComponentsSignal: Signal<this,any>;
  saveXircuitSignal: Signal<this, any>;
  compileXircuitSignal: Signal<this, any>;
  runXircuitSignal: Signal<this, any>;
  runTypeXircuitSignal: Signal<this, any>;
  debugXircuitSignal: Signal<this, any>;
  lockNodeSignal: Signal<this, any>;
  breakpointXircuitSignal: Signal<this, any>;
  currentNodeSignal: Signal<this, any>;
  testXircuitSignal: Signal<this, any>;
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
    this.fetchComponentsSignal = options.fetchComponentsSignal;
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
    this.xircuitsApp = new XircuitsApplication(this.app, this.shell);
  }

  handleEvent(event: Event): void {
    if(event.type === 'mouseup'){
      // force focus on the editor in order stop key event propagation (e.g. "Delete" key) into unintended
      // parts of jupyter lab.
      this.node.focus();
      // Just to enable back the loses focus event
      this.node.addEventListener('blur', this, true);
    }else if(event.type === 'blur'){
      // Unselect any selected nodes when the editor loses focus
      const deactivate = x => x.setSelected(false);
      const model = this.xircuitsApp.getDiagramEngine().getModel();
      model.getNodes().forEach(deactivate);
      model.getLinks().forEach(deactivate);
    }else if(event.type === 'contextmenu'){
      // Disable loses focus event when opening context menu
      this.node.removeEventListener('blur', this, true);
    }
  }

  protected onAfterAttach(msg) {
    this.node.addEventListener('mouseup', this, true);
    this.node.addEventListener('blur', this, true);
    this.node.addEventListener('contextmenu', this, true);
  }

  protected onBeforeDetach() {
    this.node.removeEventListener('mouseup', this, true);
    this.node.removeEventListener('blur', this, true);
    this.node.removeEventListener('contextmenu', this, true);
  }

  render(): any {
    return (
      <BodyWidget
        context={this.context}
        xircuitsApp={this.xircuitsApp}
        app={this.app}
        shell={this.shell}
        commands={this.commands}
        widgetId={this.parent?.id}
        serviceManager={this.serviceManager}
        fetchComponentsSignal={this.fetchComponentsSignal}
        saveXircuitSignal={this.saveXircuitSignal}
        compileXircuitSignal={this.compileXircuitSignal}
        runXircuitSignal={this.runXircuitSignal}
        runTypeXircuitSignal={this.runTypeXircuitSignal}
        debugXircuitSignal={this.debugXircuitSignal}
        lockNodeSignal={this.lockNodeSignal}
        breakpointXircuitSignal={this.breakpointXircuitSignal}
        currentNodeSignal={this.currentNodeSignal}
        testXircuitSignal={this.testXircuitSignal}
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
