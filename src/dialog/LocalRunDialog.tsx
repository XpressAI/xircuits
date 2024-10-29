import React, { useState } from 'react';
import {
  StringInput,
  BooleanInput,
  NumberInput,
  SecretInput
} from './RunDialogComponents';

interface LocalRunDialogProps {
  childStringNodes: string[];
  childBoolNodes: string[];
  childIntNodes: string[];
  childFloatNodes: string[];
  childSecretNodes: string[];
  childAnyNodes: string[];
}

export const LocalRunDialog: React.FC<LocalRunDialogProps> = ({
  childStringNodes,
  childBoolNodes,
  childIntNodes,
  childFloatNodes,
  childSecretNodes,
  childAnyNodes
}) => {
  const [checked, setChecked] = useState<boolean[]>(childBoolNodes.map(() => false));

  const handleChecked = (value: boolean, index: number) => {
    let newChecked = [...checked];
    newChecked[index] = value;
    setChecked(newChecked);
    console.log("Boolean change: ", newChecked);
  };

  const hasAnyArguments = 
    childStringNodes.length > 0 || 
    childBoolNodes.length > 0 || 
    childIntNodes.length > 0 || 
    childFloatNodes.length > 0 ||
    childSecretNodes.length > 0 ||
    childAnyNodes.length > 0;

  if (!hasAnyArguments) {
    return null;
  }

  return (
    <form>
      <h3 style={{ marginTop: 0, marginBottom: 5 }}>Arguments:</h3>
      
      {childStringNodes.map((stringNode, i) => (
        <StringInput key={`string-${i}`} name={stringNode} title={stringNode} oldValue="" onChange={() => {}} />
      ))}

      {childBoolNodes.map((boolNode, i) => (
        <BooleanInput 
          key={`bool-${i}`} 
          name={boolNode} 
          title={boolNode} 
          oldValue={checked[i] ? "true" : "false"} 
          onChange={(value) => handleChecked(value, i)} 
        />
      ))}

      {childIntNodes.map((intNode, i) => (
        <NumberInput key={`int-${i}`} name={intNode} title={intNode} oldValue="0" type="int" onChange={() => {}} />
      ))}

      {childFloatNodes.map((floatNode, i) => (
        <NumberInput key={`float-${i}`} name={floatNode} title={floatNode} oldValue="0.00" type="float" onChange={() => {}} />
      ))}
      {childSecretNodes.map((secretNode, i) => (
        <SecretInput key={`secret-${i}`} name={secretNode} title={secretNode} oldValue="" onChange={() => {}}/>
      ))}
      {childAnyNodes.map((anyNode, i) => (
        <StringInput key={`any-${i}`} name={anyNode} title={anyNode} oldValue="" onChange={() => {}}/>
      ))}
    </form>
  );
}