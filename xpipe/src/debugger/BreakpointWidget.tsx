import { ReactWidget } from "@jupyterlab/apputils";

import React, { useState } from "react";
import { XpipeFactory } from "../xpipeFactory";

/**
 * React component for a breakpoint debugger.
 *
 * @returns The Brekpoint component
 */
const BreakpointComponent = ({
  xpipeFactory,
}: {
  xpipeFactory: XpipeFactory;
}): JSX.Element => {
  const [names, setNames] = useState("");
  const [ids, setIds] = useState("");
  const [types, setTypes] = useState("");
  const [pInLabels, setPInLabel] = useState([]);
  const [pOutLabels, setPOutLabel] = useState([]);

  xpipeFactory.currentNodeSignal.connect((_, args) => {
    let item = typeof args["item"] === "undefined" ? "" : (args["item"] as any);
    let name = item.getOptions()["name"];
    let id = item.getOptions()["id"];
    let type = item.getOptions()["extras"]["type"];
    let pInList = [],
      pOutList = [];

    if (name.startsWith("🔴")) {
      name = name.split("🔴")[1];
      if (names === name) {
        [name, id, type] = "";
        (pInList = []), (pOutList = []);
        handleChanges(name, id, type, pInList, pOutList);
        return;
      }
    }

    item["portsIn"].forEach((element) => {
      if (element.getOptions()["label"] != "▶") {
        pInList.push(element.getOptions()["label"]);
      }
    });

    item["portsOut"].forEach((element) => {
      if (element.getOptions()["label"] != "▶") {
        pOutList.push(element.getOptions()["label"]);
      }
    });
    handleChanges(name, id, type, pInList, pOutList);
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
      <p>
        PortInLabel:{" "}
        {pInLabels.map((pInLabel, i) => (
          <li key={i}>{pInLabel}</li>
        ))}
      </p>
      <p>
        PortOutLabel:{" "}
        {pOutLabels.map((pOutLabel, i) => (
          <li key={i}>{pOutLabel}</li>
        ))}
      </p>
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
    this.addClass("jp-DebuggerWidget");
  }

  render(): JSX.Element {
    return <BreakpointComponent xpipeFactory={this._xpipeFactory} />;
  }
  private _xpipeFactory: XpipeFactory;
}
