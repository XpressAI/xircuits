import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { LabIcon } from '@jupyterlab/ui-components';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import React from 'react';
import styled from '@emotion/styled';
import { marked } from 'marked';

import { infoIcon, fitIcon, fileCodeIcon } from '../ui-components/icons';
import { centerNodeInView } from '../helpers/notificationEffects';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background: var(--jp-layout-color1);
  color: var(--jp-ui-font-color0);
  border-left: var(--jp-border-width) solid var(--jp-border-color1);

  .content {
    flex: 1 1 auto;
    padding: 24px 26px;
    overflow-y: auto;
  }

  .docstring-box {
    background: var(--jp-layout-color1);
    border: 1px solid var(--jp-border-color2);
    border-left: 4px solid var(--jp-brand-color1, var(--jp-brand-color0));
    border-radius: 4px;
    padding: 16px 18px;
    line-height: 1.55;
    font-size: 0.85rem;
  }

  h3 {
    margin: 12px 0 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--jp-ui-font-color1);
  }

  /* Jupyter-style header */
  .jp-SidePanel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .jp-SidePanel-header h2 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
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

  constructor(app: JupyterFrontEnd, model: IComponentInfo | null = null) {
    super();
    this._app = app;
    this._model = model;

    this.id = 'xircuits-doc-preview';
    this.title.caption = 'Component Info';
    this.title.icon = infoIcon;
    this.title.closable = false;
    this.node.style.minWidth = '340px';

    if (model) this.node.dataset.componentName = model.name;
  }

  setApp(app: JupyterFrontEnd): void {
    this._app = app;
  }
  setModel(model: IComponentInfo | null): void {
    this._model = model;
    if (model) this.node.dataset.componentName = model.name;
    else delete this.node.dataset.componentName;
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

  render(): JSX.Element {
    return (
      <Container className="jp-SidePanel">
        <header className="jp-SidePanel-header">
          <h2>Component Preview</h2>

          {/* minimal toolbar */}
          <div className="jp-mod-minimal">
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
          </div>
        </header>

        <div className="content">
          {this._model ? (
            <>
              <h3>{this._model.name}</h3>
              <div
                className="docstring-box"
                dangerouslySetInnerHTML={{ __html: marked(this._model.docstring || '_No docstring provided._') }}
              />
            </>
          ) : (
            <p>
              Please click the <strong>ℹ</strong> icon on any component to view its
              description here.
            </p>
          )}
        </div>
      </Container>
    );
  }
}