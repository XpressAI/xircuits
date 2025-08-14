import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { LabIcon, caretLeftIcon, caretRightIcon } from '@jupyterlab/ui-components';
import { DiagramEngine, NodeModel } from '@projectstorm/react-diagrams';
import React from 'react';
import { marked } from 'marked';
import { infoIcon, fitIcon, fileCodeIcon, workflowComponentIcon, xircuitsIcon } from '../ui-components/icons';
import { centerNodeInView } from '../helpers/notificationEffects';
import { togglePreviewWidget } from './previewHelper';
import { getMainPath } from './nodeNavigation';
import { collectParamIO } from './portPreview';
import { CollapsibleSection } from './CollapsibleSection';
import { IONodeTree } from './IONodeTree';
import type { IONode } from './portPreview';

export interface IComponentInfo {
  name: string;
  docstring: string;
  filePath?: string;
  node?: any;
  engine?: DiagramEngine;
}

export class ComponentPreviewWidget extends ReactWidget {
  private _app: JupyterFrontEnd;
  private _model: IComponentInfo | null;

  constructor(app: JupyterFrontEnd, model: IComponentInfo | null = null) {
    super();
    this._app = app;
    this._model = model;

    this.id = 'xircuits-doc-preview';
    this.title.caption = 'Component Info';
    this.title.icon = infoIcon;
    this.title.closable = false;

    if (model?.node) {
      this.node.dataset.componentName = model.name;
      this.node.dataset.componentId   = model.node.getID();
    } else {
      delete this.node.dataset.componentName;
      delete this.node.dataset.componentId;
    }
  }

  setApp(app: JupyterFrontEnd): void {
    this._app = app;
  }

  setModel(model: IComponentInfo | null): void {
    this._model = model;
    if (model?.node) {
      this.node.dataset.componentName = model.name;
      this.node.dataset.componentId   = model.node.getID();
    } else {
      delete this.node.dataset.componentName;
      delete this.node.dataset.componentId;
    }
    this.update();
  }

  private handleOpenScript = () => {
    const { node } = this._model ?? {};
    if (!node) return;

    const nodePath   = node.extras?.path;
    const nodeLineNo = node.extras?.lineNo;
    const nodeName   = node.name ?? node.getOptions?.().name;

    if (nodePath && nodeLineNo && nodeName) {
      this._app.commands.execute('Xircuit-editor:open-node-script', {
        nodePath,
        nodeLineNo,
        nodeName
      });
    } else {
      console.warn('Open-script: missing data', { nodePath, nodeLineNo, nodeName });
    }
  };

  private handleCenterNode = () => {
    const { node, engine } = this._model ?? {};
    if (!node || !engine) return;

    engine.getModel().clearSelection();
    node.setSelected(true);
    centerNodeInView(engine, node.getID());
  };

  private handleOpenWorkflow = () => {
    const { node } = this._model ?? {};
    if (!node) return;

    let workflowPath: string | undefined = node.extras?.path;
    if (workflowPath?.endsWith('.py')) {
      workflowPath = workflowPath.replace(/\.py$/, '.xircuits');
    }

    if (workflowPath) {
      this._app.commands.execute('Xircuit-editor:open-xircuits-workflow', {
          nodePath: node.extras?.path,
          nodeName: node.name,
          nodeLineNo: node.extras?.lineNo
      }).catch(err => console.error('Failed to open workflow:', err));
    } else {
      console.warn('Open‑workflow: no valid path found', {
        originalPath: node.extras?.path
      });
    }
  };

  private isWorkflowNode = (): boolean => {
    const node = this._model?.node;
    if (!node) return false;

    const nodeType = node.extras?.type
      ?? node.getOptions?.().extras?.type
      ?? '';

    return nodeType === 'xircuits_workflow';
  };

  private navigate = (step: -1 | 1) => {
    const { node } = this._model ?? {};
    if (!node) return;

    const nodes = getMainPath(node);
    if (nodes.length <= 1) return;

    const idx = nodes.findIndex((n: NodeModel) => n.getID() === node.getID());
    if (idx === -1) return;

    const nextIdx = idx + step;
    if (nextIdx < 0 || nextIdx >= nodes.length) return;

    const next = nodes[nextIdx] as any;

    togglePreviewWidget(this._app, {
      node: next,
      engine: this._model?.engine,
      name: next.getOptions().name,
      docstring: next.extras?.description ?? '',
      filePath: next.extras?.path ?? ''
    }, true);

    this._model?.engine?.getModel().clearSelection();
    next.setSelected(true);
    centerNodeInView(this._model?.engine!, next.getID());
  };

  private renderDocstring(): JSX.Element | null {
    if (
      !this._model?.docstring?.trim() ||
      ['Start', 'Finish'].includes(this._model.name) ||
      this.isWorkflowNode()
    ) {
      return null;
    }

    return (
      <CollapsibleSection label="DESCRIPTION">
        <div 
        dangerouslySetInnerHTML={{ __html: marked(this._model.docstring) }} 
        />
      </CollapsibleSection>
    );
  }

  private renderInputs(tree: IONode[]): JSX.Element | null {
    if (tree.length === 0) return null;
    return (
      <CollapsibleSection label={`INPUTS (${tree.length})`} compact>
        <IONodeTree data={tree} />
      </CollapsibleSection>
    );
  }

  private renderOutputs(tree: IONode[]): JSX.Element | null {
    if (tree.length === 0) return null;
    return (
      <CollapsibleSection label={`OUTPUTS (${tree.length})`} compact>
        <IONodeTree data={tree} />
      </CollapsibleSection>
    );
  }

  render(): JSX.Element {
    const { inputs: inputTree, outputs: outputTree } = this._model?.node
      ? collectParamIO(this._model.node)
      : { inputs: [], outputs: [] };

    return (
      <div className="component-preview-container jp-SidePanel">
        <div className="jp-SidePanel-header">
          <h2 className="jp-text-truncated">Component Preview</h2>
        </div>

        {/* title row (Accordion style) */}
        <div className="lm-AccordionPanel">
          <h3 className="lm-AccordionPanel-title jp-AccordionPanel-title x-title-row">
            <span className="lm-AccordionPanel-toggleIcon jp-icon3 x-title-icon" />
            <span className="lm-AccordionPanel-titleLabel">
              {(this._model?.node as any)?.getOptions?.()?.name ?? ''}
            </span>
            <span className="x-toolbar">
              {this.isWorkflowNode() && (
                <ToolbarButtonComponent
                  icon={workflowComponentIcon as LabIcon}
                  tooltip="Open workflow"
                  enabled
                  onClick={this.handleOpenWorkflow}
                />
              )}
              <ToolbarButtonComponent
                icon={caretLeftIcon}
                tooltip="Previous node"
                enabled={!!this._model?.node}
                onClick={() => this.navigate(-1)}
              />
              <ToolbarButtonComponent
                icon={caretRightIcon}
                tooltip="Next node"
                enabled={!!this._model?.node}
                onClick={() => this.navigate(1)}
              />
              <ToolbarButtonComponent
                icon={fileCodeIcon as LabIcon}
                tooltip="Open script"
                enabled={!!this._model?.node}
                onClick={this.handleOpenScript}
              />
              <ToolbarButtonComponent
                icon={fitIcon as LabIcon}
                tooltip="Center node"
                enabled={!!this._model?.node && !!this._model?.engine}
                onClick={this.handleCenterNode}
              />
            </span>
          </h3>
        </div>

        <div className="content">
          {this._model ? (
            <>
              {this._model.name === 'Start' && (
                <p className="x-inset">
                  <em>This is the <strong>start</strong> of your workflow.</em>
                </p>
              )}

              {this._model.name === 'Finish' && (
                <p className="x-inset">
                  <em>This is the <strong>end</strong> of your workflow.</em>
                </p>
              )}

              {this.isWorkflowNode() && (
                <p className="x-inset">
                  <em>
                    Sub-workflow component – click <strong>Open workflow</strong> in the preview to inspect
                    the inner graph.
                  </em>
                </p>
              )}

              {/* Docstring */}
              {this.renderDocstring()}

              {/* Inputs */}
              {this.renderInputs(inputTree)}

              {/* Outputs */}
              {this.renderOutputs(outputTree)}
            </>
          ) : (
            <div className="empty-state">
              <xircuitsIcon.react />
              <p>Select a component's `i` icon to show its detail here.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}