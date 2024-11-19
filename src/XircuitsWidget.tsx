import { ReactWidget } from '@jupyterlab/apputils';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import { Context } from '@jupyterlab/docregistry';
import { BodyWidget } from './components/XircuitsBodyWidget';
import React from 'react';
import { ServiceManager } from '@jupyterlab/services';
import { XircuitsApplication } from './components/XircuitsApp';

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class XircuitsPanel extends ReactWidget {
  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  context: Context;
  xircuitsApp: XircuitsApplication;
  serviceManager: ServiceManager;
  fetchComponentsSignal: Signal<this,any>;
  fetchRemoteRunConfigSignal: Signal<this,any>;
  saveXircuitSignal: Signal<this, any>;
  compileXircuitSignal: Signal<this, any>;
  runXircuitSignal: Signal<this, any>;
  runTypeXircuitSignal: Signal<this, any>;
  lockNodeSignal: Signal<this, any>;
  triggerCanvasUpdateSignal: Signal<this, any>;
  triggerLoadingAnimationSignal: Signal<this, any>;
  reloadAllNodesSignal: Signal<this, any>;
  toggleAllLinkAnimationSignal: Signal<this, any>;

  // Add mousePosition state
  mousePosition = { x: 0, y: 0 };

  constructor(options: any) {
    super();
    this.app = options.app;
    this.shell = options.shell;
    this.commands = options.commands;
    this.context = options.context;
    this.serviceManager = options.serviceManager;
    this.fetchComponentsSignal = options.fetchComponentsSignal;
    this.fetchRemoteRunConfigSignal = options.fetchRemoteRunConfigSignal;
    this.saveXircuitSignal = options.saveXircuitSignal;
    this.compileXircuitSignal = options.compileXircuitSignal;
    this.runXircuitSignal = options.runXircuitSignal;
    this.runTypeXircuitSignal = options.runTypeXircuitSignal;
    this.lockNodeSignal = options.lockNodeSignal;
    this.triggerCanvasUpdateSignal = options.triggerCanvasUpdateSignal;
    this.triggerLoadingAnimationSignal = options.triggerLoadingAnimationSignal;
    this.reloadAllNodesSignal = options.reloadAllNodesSignal;
    this.toggleAllLinkAnimationSignal = options.toggleAllLinkAnimationSignal;
    this.xircuitsApp = new XircuitsApplication(this.app, this.shell, () => this.parent?.id);
  }

  handleEvent(event: Event): void {
    if (event instanceof MouseEvent && event.type === 'mouseup') {
      // Update mousePosition state with current mouse position
      this.mousePosition = { x: event.clientX, y: event.clientY };
      
      this.node.focus();
      this.node.addEventListener('blur', this, true);
    } else if (event.type === 'blur') {
      const deactivate = x => x.setSelected(false);
      const model = this.xircuitsApp.getDiagramEngine().getModel();
      model.getNodes().forEach(deactivate);
      model.getLinks().forEach(deactivate);
    } else if (event.type === 'contextmenu') {
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
        fetchRemoteRunConfigSignal={this.fetchRemoteRunConfigSignal}
        saveXircuitSignal={this.saveXircuitSignal}
        compileXircuitSignal={this.compileXircuitSignal}
        runXircuitSignal={this.runXircuitSignal}
        runTypeXircuitSignal={this.runTypeXircuitSignal}
        lockNodeSignal={this.lockNodeSignal}
        triggerCanvasUpdateSignal={this.triggerCanvasUpdateSignal}
        triggerLoadingAnimationSignal={this.triggerLoadingAnimationSignal}
        reloadAllNodesSignal={this.reloadAllNodesSignal}
        toggleAllLinkAnimationSignal={this.toggleAllLinkAnimationSignal}
      />
    );
  }
}
