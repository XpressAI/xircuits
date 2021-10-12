import { ReactWidget } from '@jupyterlab/apputils';

import React, { useState } from 'react';
import { XpipeFactory } from '../xpipeFactory';

/**
 * React component for a breakpoint debugger.
 *
 * @returns The Brekpoint component
 */
 const BreakpointComponent = ({
  xpipeFactory
}: {
  xpipeFactory: XpipeFactory;
}): JSX.Element => {

  const [names, setNames] = useState("");
  xpipeFactory.currentNodeSignal.connect((_, args) => {
    let name = typeof args['name'] === 'undefined' ? '' : (args['name'] as string);
    if (name.startsWith("🔴")){
      name = name.split("🔴")[1]
      if (names === name){
        name = "";
        handleNames(name)
        return
      }
    }
    handleNames(name);
  });
  function handleNames(e) {
    setNames(e);
  }

  return (
    <div>
      <p>{names}</p>
    </div>
  );
};

/**
 * A Breakpoint Widget that wraps a BreakpointComponent.
 */
export class BreakpointWidget extends ReactWidget {
  /**
   * Constructs a new BreakpointWidget.
   */
  constructor(xpipeFactory: XpipeFactory) {
    super();
    this._xpipeFactory = xpipeFactory;
    this.addClass('jp-ReactWidget');
  }

  render(): JSX.Element {
    return <BreakpointComponent xpipeFactory={this._xpipeFactory}/>;
  }
  private _xpipeFactory: XpipeFactory;
}