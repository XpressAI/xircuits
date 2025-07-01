// ComponentPreviewWidget.tsx
import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react';
import { marked } from 'marked';
import styled from '@emotion/styled';
import { infoIcon } from '../ui-components/icons';

const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 24px 26px;

  color: var(--jp-ui-font-color0);
  background: var(--jp-layout-color1);

  border-left: 1px solid var(--jp-border-color1);
  box-shadow: inset 4px 0 6px rgba(0, 0, 0, 0.04);

  h3 {
    margin: 0 0 20px;
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0.2px;
  }

  .docstring-box {
    background: var(--jp-layout-color2);
    border: 1px solid var(--jp-border-color2);
    border-radius: 10px;
    padding: 20px 22px;
    line-height: 1.6;
    font-size: 0.75rem;

    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  .docstring-box strong,
  .docstring-box b {
    color: var(--jp-ui-font-color1);
    font-weight: 600;
  }

  ul {
    margin: 8px 0 8px 24px;
    padding-inline-start: 0;
  }

  code {
    font-family: var(--jp-code-font-family);
    background: var(--jp-layout-color3);
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 85%;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--jp-layout-color3);
    border-radius: 4px;
  }
`;

export interface IComponentInfo { name: string; docstring: string; }

export class ComponentPreviewWidget extends ReactWidget {
  private _model: IComponentInfo | null = null;

  constructor(model: IComponentInfo | null = null) {
    super();
    this.id = 'xircuits-doc-preview';
    this.title.label = '';                 
    this.title.caption = 'Component Info';
    this.title.icon = infoIcon;
    this.title.closable = false;           
    this.setModel(model);
  }

  setModel(model: IComponentInfo | null) {
    this._model = model;
    if (model) this.node.dataset.componentName = model.name;
    else delete this.node.dataset.componentName;
    this.update();
  }

  render() {
    if (!this._model) {
      return <Container>Please click the "ℹ" icon on any component to view its description here</Container>;
    }
    return (
      <Container>
        <h3>{this._model.name}</h3>
        <div
          className="docstring-box"
          dangerouslySetInnerHTML={{ __html: marked(this._model.docstring || '_No docstring provided._') }}
        />
      </Container>
    );
  }
}