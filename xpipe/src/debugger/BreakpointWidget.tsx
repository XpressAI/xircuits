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
  const [ids, setIds] = useState("");
  const [types, setTypes] = useState("");
  const [pInLabels, setPInLabel] = useState("");
  const [pOutLabels, setPOutLabel] = useState("");

  xpipeFactory.currentNodeSignal.connect((_, args) => {
    let item = typeof args['item'] === 'undefined' ? '' : (args['item'] as any);

    let name = item.getOptions()["name"]
    let id = item.getOptions()["id"]
		let type = item.getOptions()["extras"]["type"]
    let pInLabel = item["portsIn"][1].getOptions()["label"]
		let pOutLabel = item["portsOut"][1].getOptions()["label"]

    if (name.startsWith("🔴")){
      name = name.split("🔴")[1]
      if (names === name){
        [name, id, type,  pInLabel, pOutLabel] = "";
        handleChanges(name, id, type, pInLabel, pOutLabel)
        return
      }
    }
    handleChanges(name, id, type, pInLabel, pOutLabel);
  });

  function handleChanges(name, id, type, pInLabel, pOutLabel) {
    setNames(name);
    setIds(id);
    setTypes(type);
    setPInLabel(pInLabel);
    setPOutLabel(pOutLabel);
  }

  return (
    <div>
      <p>Selected Node</p>
      <p>Name: {names}</p>
      <p>Id: {ids}</p>
      <p>Type: {types}</p>
      <p>PortInLabel: {pInLabels}</p>
      <p>PortOutLabel: {pOutLabels}</p>
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
    this.addClass('jp-DebuggerWidget');
  }

  render(): JSX.Element {
    return <BreakpointComponent xpipeFactory={this._xpipeFactory}/>;
  }
  private _xpipeFactory: XpipeFactory;
}