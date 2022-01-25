import { ReactWidget, UseSignal } from "@jupyterlab/apputils";

import React, { useEffect, useRef, useState } from "react";

import { XircuitFactory } from "../xircuitFactory";

/**
 * React component for a xircuits debugger.
 *
 * @returns The Debugger component
 */
const DebuggerComponent = ({
  xircuitFactory,
  currentNode
}: {
  xircuitFactory: XircuitFactory;
  currentNode: any;
}): JSX.Element => {
  const [names, setNames] = useState("");
  const [ids, setIds] = useState("");
  const [types, setTypes] = useState("");
  const [pInLabels, setPInLabel] = useState([]);
  const [pOutLabels, setPOutLabel] = useState([]);
  const notInitialRender = useRef(false)

  const handleCurrentNode = () => {
    let item = typeof currentNode["item"] === "undefined" ? "" : (currentNode["item"] as any);
    let item2 = typeof currentNode["item2"] === "undefined" ? "" : (currentNode["item2"] as any);
    let name = item.getOptions()["name"];
    let id = item.getOptions()["id"];
    let type = item.getOptions()["extras"]["type"];
    let pInList = [];
    let pInArgList = [], pOutArgList = [];

    let item_output = item2;
    if (typeof (item2) != "string") {
      item_output = item2["output"];
    }

    if (item_output != "") {
      if (item_output.includes("InArg ->") && item_output.includes("OutArg ->")) {
        let temp_out_arg = item_output.split("OutArg -> ");
        let temp_in_arg = temp_out_arg[0].split("InArg -> ");

        for (let i = 0; i < temp_in_arg[1].split("\t").length; i++) {
          pInList.push(temp_in_arg[1].split("\t")[i]);
        }

        for (let i = 0; i < temp_out_arg[1].split("\t").length; i++) {
          if (!temp_out_arg[1].split("\t")[i].includes(": None")) {
            pInList.push(temp_out_arg[1].split("\t")[i]);
          }
        }

      } else if (item_output.includes("InArg ->") && !item_output.includes("OutArg ->")) {
        for (let i = 0; i < item_output.split("InArg -> ")[1].split("\t").length; i++) {
          pInList.push(item_output.split("InArg -> ")[1].split("\t")[i]);
        }
      } else if (!item_output.includes("InArg ->") && item_output.includes("OutArg ->")) {
        for (let i = 0; i < item_output.split("OutArg -> ")[1].split("\t").length; i++) {
          if (!item_output.split("OutArg -> ")[1].split("\t")[i].includes(": None")) {
            pInList.push(item_output.split("OutArg -> ")[1].split("\t")[i]);
          }
        }
      }
    }

    item["portsIn"].forEach((element) => {
      if (element.getOptions()["label"] != "▶") {
        pInArgList.push(element.getOptions()["label"]);
      }
    });

    item["portsOut"].forEach((element) => {
      if (element.getOptions()["label"] != "▶") {
        pOutArgList.push(element.getOptions()["label"]);
      }
    });
    handleChanges(name, id, type, pInList, pOutArgList);
  };

  useEffect(() => {
    if (notInitialRender.current) {
      handleCurrentNode();
    } else {
      notInitialRender.current = true
    }
  }, [currentNode]);

  function handleChanges(name, id, type, pInLabel, pOutLabel) {
    setNames(name);
    setIds(id);
    setTypes(type);
    setPInLabel(pInLabel);
    setPOutLabel(pOutLabel);
  }

  return (
    <div style={{
      minHeight: '800px', height: '100%', width: '100%', minWidth: '150px', flexGrow: 1, flexShrink: 1, margin: '7px', padding: '7px', fontSize: '14px'
    }}>
      <p><b>Selected Node</b></p>
      <p><b>Name:</b> {names}</p>
      <p><b>Id:</b> {ids}</p>
      <p><b>Type:</b> {types}</p>
      <p>
        <b>PortInLabel:</b>{" "}
        {pInLabels.map((value: string, index: number) => (
          <p key={index}>{value.split("\n").map((value2: string, index2: number) => (
            <p key={index2}>{value2}</p>
          ))}</p>
        ))}
      </p>
      <p>
        <b>PortOutLabel:</b>{" "}
        {pOutLabels.map((pOutLabel, i) => (
          <p key={i}>{pOutLabel}</p>
        ))}
      </p>
    </div>
  );
};

/**
 * A Debugger Widget that wraps a BreakpointComponent.
 */
export class DebuggerWidget extends ReactWidget {
  /**
   * Constructs a new DebuggerWidget.
   */
  constructor(xircuitFactory: XircuitFactory) {
    super();
    this._xircuitFactory = xircuitFactory;
    this.addClass("jp-DebuggerWidget");
  }

  render(): JSX.Element {
    return (
      <UseSignal signal={this._xircuitFactory.currentNodeSignal}>
        {(_, args) => {
          return (
            <DebuggerComponent
              xircuitFactory={this._xircuitFactory}
              currentNode={args}
            />
          );
        }}
      </UseSignal>
    );
  }
  private _xircuitFactory: XircuitFactory;
}
