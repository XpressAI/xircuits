import React, { useEffect, useState } from 'react';
import { HTMLSelect } from "@jupyterlab/ui-components";
import {
  StringInput,
  BooleanInput,
  NumberInput,
  TextAreaInput
} from './RunDialogComponents';

interface RemoteRunDialogProps {
  remoteRunTypes,
  remoteRunConfigs: { id: string; run_type: string; run_config_name: string; command: string }[];
  lastConfig: { run_type: string; run_config_name: string; command: string } | null;
  childStringNodes: string[];
  childBoolNodes: string[];
  childIntNodes: string[];
  childFloatNodes: string[];
}

export const RemoteRunDialog: React.FC<RemoteRunDialogProps> = ({
  remoteRunTypes,
  remoteRunConfigs,
  lastConfig,
  childStringNodes,
  childBoolNodes,
  childIntNodes,
  childFloatNodes
}) => {
  const [checkedState, setCheckedState] = useState<{ [key: string]: boolean }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [remoteRunType, setRemoteRunType] = useState("");
  const [remoteRunConfig, setRemoteRunConfig] = useState("");
  const [command, setCommand] = useState("");
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [formattedCommand, setFormattedCommand] = useState("");

  useEffect(() => {
    if (remoteRunTypes.length > 0) {
      setRemoteRunType(remoteRunTypes[0].run_type);
    }

    if (lastConfig) {
      setRemoteRunType(lastConfig.run_type);
      setRemoteRunConfig(lastConfig.run_config_name);
      setCommand(lastConfig.command);
      const extractedPlaceholders = extractPlaceholders(lastConfig.command);
      setPlaceholders(extractedPlaceholders);
      setInputValues(prefillInputValues(lastConfig, extractedPlaceholders));
    }
  }, []);

  const handleChecked = (name: string, value: boolean) => {
    setCheckedState(prev => {
      const newState = { ...prev, [name]: value };
      console.log("Boolean change for", name, ":", newState[name]);
      return newState;
    });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const type = event.target.value;
    setRemoteRunType(type);
    setRemoteRunConfig("-");
    setCommand("");
    setPlaceholders([]);
    setInputValues({});
  };

  const handleConfigChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const configName = event.target.value;
    setRemoteRunConfig(configName);
    if (configName === "-") {
      setCommand("");
      setPlaceholders([]);
      setInputValues({});
    } else {
      const selectedConfig = remoteRunConfigs.find(config => config.run_config_name === configName);
      if (selectedConfig) {
        setCommand(selectedConfig.command);
        const extractedPlaceholders = extractPlaceholders(selectedConfig.command);
        setPlaceholders(extractedPlaceholders);
        setInputValues(prefillInputValues(selectedConfig, extractedPlaceholders));
      }
    }
  };

  const extractPlaceholders = (cmd: string): string[] => {
    const matches = cmd.match(/{[^}]+}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  };

  const prefillInputValues = (config: any, placeholders: string[]): { [key: string]: string } => {
    const newInputValues: { [key: string]: string } = {};
    placeholders.forEach(placeholder => {
      newInputValues[placeholder] = config[placeholder] || "";
    });
    return newInputValues;
  };

  const substituteCommand = (cmd: string, values: { [key: string]: string }) => {
    return cmd.replace(/{([^}]+)}/g, (_, key) => values[key] || `{${key}}`);
  };

  useEffect(() => {
    setFormattedCommand(substituteCommand(command, inputValues));
  }, [command, inputValues]);

  const handleInputChange = (name: string, value: string) => {
    const newInputValues = { ...inputValues, [name]: value };
    setInputValues(newInputValues);
    setFormattedCommand(substituteCommand(command, newInputValues));
  };

  return (
    <form>
      <h2>Remote Run</h2>
      <div>
        <h3>Available Run Type:</h3>
        <HTMLSelect
          onChange={(e) => handleTypeChange(e)}
          value={remoteRunType}
          aria-label={'Available Run Types'}
          title={'Select the run type'}
          name='remoteRunType'
        >
          {remoteRunTypes.map((type, i) => (
            <option id={type.id} key={`index-type-${i}`} value={type.run_type}>
              {type.run_type}
            </option>
          ))}
        </HTMLSelect>
      </div>
      <div>
        <h3>Available Run Config:</h3>
        <HTMLSelect
          onChange={(e) => handleConfigChange(e)}
          value={remoteRunConfig}
          aria-label={'Run Configuration'}
          title={'Select which config to run'}
          name='remoteRunConfig'
        >
          <option value="-">-</option>
          {remoteRunConfigs.map((c, i) => (
            c.run_type === remoteRunType && (
              <option id={c.id} key={`index-config-${i}`} value={c.run_config_name}>
                {c.run_config_name}
              </option>
            )
          ))}
        </HTMLSelect>
      </div>
      <div>
        <h3>Command Template:</h3>
        <TextAreaInput
          name="commandTemplate"
          title=""
          oldValue={command}
          onChange={() => {}}
        />
      </div>

      <h3>Arguments:</h3>
      {childStringNodes.map((name, index) => (
        <StringInput 
          key={`string-${index}`} 
          name={name} 
          title={name} 
          oldValue={inputValues[name] || ""} 
          onChange={(value) => handleInputChange(name, value)}
        />
      ))}
      {childBoolNodes.map((name, index) => (
        <BooleanInput 
          key={`bool-${index}`} 
          name={name} 
          title={name} 
          oldValue={checkedState[name] ? "true" : "false"} 
          onChange={(value) => handleChecked(name, value)}
        />
      ))}
      {childIntNodes.map((name, index) => (
        <NumberInput 
          key={`int-${index}`} 
          name={name} 
          title={name} 
          oldValue={inputValues[name] || "0"} 
          type="int" 
          onChange={(value) => handleInputChange(name, value)}
        />
      ))}
      {childFloatNodes.map((name, index) => (
        <NumberInput 
          key={`float-${index}`} 
          name={name} 
          title={name} 
          oldValue={inputValues[name] || "0.00"} 
          type="float" 
          onChange={(value) => handleInputChange(name, value)}
        />
      ))}

      <h3>Placeholders:</h3>
      {placeholders.map((name, index) => (
        <StringInput 
          key={`placeholder-${index}`} 
          name={name}
          title={name} 
          oldValue={inputValues[name] || ""} 
          onChange={(value) => handleInputChange(name, value)}
        />
      ))}

      <h3>Final Command:</h3>
      <TextAreaInput
        name="formattedCommand"
        title=""
        oldValue={formattedCommand}
        onChange={() => {}}
      />
    </form>
  );
};