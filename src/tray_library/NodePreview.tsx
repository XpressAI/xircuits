import { getNodeIcon, S as NodeStyle } from "../components/node/CustomNodeWidget";
import { S as PortStyle, symbolMap } from "../components/port/CustomPortLabel";
import React from "react";

export function NodePreview(props: { model: any }) {
  const { model } = props;
  let icon = getNodeIcon(model.type === "xircuits_workflow" ? "workflow" : model.type);
  const PortComponent = (props) => {
    const isInPort = props.direction === "in";
    const isOutPort = props.direction === "out";

    const label = <PortStyle.Label style={{ textAlign: isInPort ? "left" : "right" }}>
      {props.port.name}
    </PortStyle.Label>;

    let port = null;
    let symbolLabel = null;
    if (["BaseComponent", "OutFlow"].includes(props.port.kind)) {
      port = <PortStyle.Port isOutPort={isOutPort} hasLinks={false}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 12h12" />
          <path d="M17 16l4 -4l-4 -4" />
          <path d="M12 3a9 9 0 1 0 0 18" />
        </svg>
      </PortStyle.Port>;
    } else if (props.port.kind === "InFlow") {
      port = <PortStyle.Port isOutPort={isOutPort} hasLinks={false}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 12h12" />
          <path d="M11 8l4 4l-4 4" />
          <path d="M12 21a9 9 0 0 0 0 -18" />
        </svg>
      </PortStyle.Port>;
    } else {
      // TODO: Get rid of the remapping by using compatible type names everywhere
      let type_name_remappings = {
        "bool": "boolean",
        "str": "string"
      };
      symbolLabel = symbolMap[type_name_remappings[props.port.type] || props.port.type] || "◎";
    }

    const symbol = <PortStyle.SymbolContainer symbolType={symbolLabel} selected={false} isOutPort={isOutPort}>
      <PortStyle.Symbol isOutPort={isOutPort} selected={false}>
        {symbolLabel}
      </PortStyle.Symbol>
    </PortStyle.SymbolContainer>;

    return <PortStyle.PortLabel>
      {isOutPort ? label : null}
      <div>{port == null ? symbol : port}</div>
      {isInPort ? label : null}
    </PortStyle.PortLabel>;
  };
  const PortsComponent = () => {
    const inPorts = model.variables.filter(v => ["InArg", "InCompArg"].includes(v.kind));
    const outPorts = model.variables.filter(v => !["InArg", "InCompArg"].includes(v.kind));

    if(model.name.startsWith("Literal ") || model.name.startsWith("Get Argument ")){
      let type = null;
      if(model.name.startsWith("Literal ")){
        type = model.name.match(/^Literal (.+)$/)[1].toLowerCase()
      }else{
        type = model.name.match(/^Get Argument (.+) Name$/)[1].toLowerCase()
      }
      outPorts.unshift({ name: "", kind: "OutArg", type: type });
    }else{
      outPorts.unshift({ name: "", kind: "OutFlow" });
      if (model.type !== "Start") {
        inPorts.unshift({ name: "", kind: "InFlow" });
      }
    }

    return <NodeStyle.Ports>
      <NodeStyle.PortsContainer>{inPorts.map(p => <PortComponent port={p} direction="in"
                                                                 key={p.name} />)}</NodeStyle.PortsContainer>
      <NodeStyle.PortsContainer>{outPorts.map(p => <PortComponent port={p} direction="out"
                                                                  key={p.name} />)}</NodeStyle.PortsContainer>
    </NodeStyle.Ports>;
  };


  return <div style={{maxWidth: "300px", margin: "auto"}}>
    <NodeStyle.Node
    borderColor={model.color}
    selected={false}
    background={null}
    className={model.type === "xircuits_workflow" ? "workflow-node" : null}
    style={{ backgroundColor: "black" }}
  >
    <NodeStyle.Title background={model.color}>
      {icon ? <NodeStyle.IconContainer>{icon}</NodeStyle.IconContainer> : null}
      <NodeStyle.TitleName>{model.name}</NodeStyle.TitleName>
    </NodeStyle.Title>
    <PortsComponent />
  </NodeStyle.Node>
  </div>;
}