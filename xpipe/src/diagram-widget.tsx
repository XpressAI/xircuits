import { ReactWidget } from '@jupyterlab/apputils';
import React, { FC, useState } from 'react';
import styled from '@emotion/styled';
import { BodyWidget } from './components/BodyWidget';
import { Application } from './Application';


// export interface BodyWidgetProps {
// 	app: Application;
// 	projectData: any;
// }

/**
 * React React Diagram.
 *
 * @returns The React component
 */

/**
 * A Counter Lumino Widget that wraps a CounterComponent.
 */
export class ReactDiagramWidget extends ReactWidget {
  /**
   * Constructs a new CounterWidget.
   */
  public app;
  constructor() {
    super();
    var app = new Application();
    this.app=app;

  }
  render(): any {
    console.log("calling from render")
    debugger;
    return <BodyWidget app={this.app} />;
  }
}
