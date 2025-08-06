import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { LabIcon, caretLeftIcon, caretRightIcon, caretDownIcon } from '@jupyterlab/ui-components';
import { DiagramEngine, NodeModel } from '@projectstorm/react-diagrams';
import React from 'react';
import styled from '@emotion/styled';
import { marked } from 'marked';
import { infoIcon, fitIcon, fileCodeIcon, workflowComponentIcon, xircuitsIcon } from '../ui-components/icons';
import { centerNodeInView } from '../helpers/notificationEffects';
import { togglePreviewWidget } from './previewHelper';
import { getMainPath } from './nodeNavigation';
import { collectParamIO } from './portPreview';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--jp-layout-color1);
  color: var(--jp-ui-font-color0);
  border-left: var(--jp-border-width) solid var(--jp-border-color1);

  .jp-SidePanel-header,
  .jp-SidePanel-header h2,
  .title {
    font-size: 0.85rem;   
    font-weight: 700;     
    line-height: 1;
    margin: 0;
    text-transform: none; 
  }

  .header-bar {
    height: var(--jp-private-toolbar-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    border-bottom: var(--jp-border-width) solid var(--jp-border-color2);
  }

  .toolbar-buttons {
    display: flex;
    gap: 4px;
  }

  .content {
    flex: 1 1 auto;
    padding: 20px 24px 20px 0;
    overflow-y: auto;
  }

  .section-toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 900;
    font-size: 0.8rem;
    margin: 2px 0;
  }

  .arrow {
    display: inline-flex;
    margin-right: 4px;
    border-radius: 4px;
    padding: 2px;
    transition: background 0.2s;
  }
  .arrow:hover { background: var(--jp-layout-color2); }

  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0.45;
    filter: grayscale(100%);
    user-select: none;
    pointer-events: none;
    text-align: center;
  }
  .empty-state svg {
    width: 120px;
    height: 120px;
  }
  .empty-state p {
    margin-top: 12px;
    font-size: 0.8rem;
    color: var(--jp-ui-font-color1);
    opacity: 0.9;
    }

    .jp-SidePanel-header,           
  .header-bar {                    
    height: var(--jp-private-toolbar-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px !important;     
    border-bottom: var(--jp-border-width) solid var(--jp-border-color2);
    box-sizing: border-box;
  }

  .jp-SidePanel-header::before {
    content: none !important;
  }

  .jp-SidePanel-header h2,
  .title {
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1;
    margin: 0;
    padding: 0;                   
  }

  .section-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 900;
  font-size: 0.8rem;
  margin: 2px 0;
}

.section-content {
  margin-left: 40px;
  margin-bottom: 8px;
  font-size: 0.8rem;
}

.section-content-compact {
  margin-left: 18px;
  margin-bottom: 8px;
  font-size: 0.8rem;
}

`;

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

  private _docCollapsed = false;
  private _inCollapsed = false;
  private _outCollapsed = false;

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
    ) return null;

    const ArrowDoc = this._docCollapsed ? caretRightIcon.react : caretDownIcon.react;

    return (
      <>
        <div
          className="section-toggle"
          onClick={() => {
            this._docCollapsed = !this._docCollapsed;
            this.update();
          }}
        >
          <span className="arrow">
            <ArrowDoc width="12" height="12" tag="span" />
          </span>
          &nbsp;Docstring
        </div>
        {!this._docCollapsed && (
          <div
            className="section-content"
            dangerouslySetInnerHTML={{ __html: marked(this._model.docstring) }}
          />
        )}
      </>
    );
  }

  private renderInputs(inputs: string[]): JSX.Element | null {
    if (inputs.length === 0) return null;

    const ArrowIn = this._inCollapsed ? caretRightIcon.react : caretDownIcon.react;
    const inputsMd = inputs.join('\n');

    return (
      <>
        <div
          className="section-toggle"
          onClick={() => {
            this._inCollapsed = !this._inCollapsed;
            this.update();
          }}
        >
          <span className="arrow">
            <ArrowIn width="12" height="12" tag="span" />
          </span>
          &nbsp;Inputs ({inputs.length})
        </div>
        {!this._inCollapsed && (
          <div
            className="section-content-compact"
            dangerouslySetInnerHTML={{ __html: marked(inputsMd) }}
          />
        )}
      </>
    );
  }

  private renderOutputs(outputs: string[]): JSX.Element | null {
    if (outputs.length === 0) return null;

    const ArrowOut = this._outCollapsed ? caretRightIcon.react : caretDownIcon.react;
    const outputsMd = outputs.join('\n');

    return (
      <>
        <div
          className="section-toggle"
          onClick={() => {
            this._outCollapsed = !this._outCollapsed;
            this.update();
          }}
        >
          <span className="arrow">
            <ArrowOut width="12" height="12" tag="span" />
          </span>
          &nbsp;Outputs ({outputs.length})
        </div>
        {!this._outCollapsed && (
          <div
            className="section-content-compact"
            dangerouslySetInnerHTML={{ __html: marked(outputsMd) }}
          />
        )}
      </>
    );
  }
  
  render(): JSX.Element {
    const { inputs, outputs } = this._model?.node
      ? collectParamIO(this._model.node)
      : { inputs: [], outputs: [] };

    const inputsMd = inputs.join('\n');
    const outputsMd = outputs.join('\n');

    const ArrowDoc = this._docCollapsed ? caretRightIcon.react : caretDownIcon.react;
    const ArrowIn  = this._inCollapsed  ? caretRightIcon.react : caretDownIcon.react;
    const ArrowOut = this._outCollapsed ? caretRightIcon.react : caretDownIcon.react;

    return (
      <Container className="jp-SidePanel">
        <div className="jp-SidePanel-header">
          <h2 className="jp-text-truncated">Component Preview</h2>
        </div>

        {/* ---------------------------- header --------------------------- */}
        <div className="header-bar">
          <span className="title">
            {(this._model?.node as any)?.getOptions?.()?.name ?? ''}
          </span>

          <div className="toolbar-buttons">
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
            {this.isWorkflowNode() && (
              <ToolbarButtonComponent
                icon={workflowComponentIcon as LabIcon}
                tooltip="Open workflow"
                enabled
                onClick={this.handleOpenWorkflow}
              />
            )}
          </div>
        </div>

        <div className="content">
          {this._model ? (
            <>
              {this._model.name === 'Start' && (
                <p style={{ marginLeft: '40px' }}>
                  <em>This is the <strong>start</strong> of your workflow.</em>
                </p>
              )}

              {this._model.name === 'Finish' && (
                <p style={{ marginLeft: '40px' }}>
                  <em>This is the <strong>end</strong> of your workflow.</em>
                </p>
              )}

              {this.isWorkflowNode() && (
                <p style={{ marginLeft: '40px' }}>
                  <em>
                    Sub‑workflow component – click <strong>Open workflow</strong> in the preview to inspect
                    the inner graph.
                  </em>
                </p>
              )}

              {/* Docstring */}
                {this.renderDocstring()}

              {/* Inputs */}
                {this.renderInputs(inputs)}

              {/* Outputs */}
                {this.renderOutputs(outputs)}

            </>
          ) : (
            <div className="empty-state">
              <xircuitsIcon.react />
              <p>Select a component's `i` icon to show its detail here.</p>
            </div>
          )}
        </div>
      </Container>
    );
  }
}