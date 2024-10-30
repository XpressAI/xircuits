import React, { useEffect, useState } from 'react';
import { HTMLSelect } from "@jupyterlab/ui-components";
import {
  StringInput,
  BooleanInput,
  NumberInput,
  TextAreaInput,
  SecretInput
} from './RunDialogComponents';

interface RemoteRunDialogProps {
  remoteRunTypes;
  remoteRunConfigs: { id: string; run_type: string; run_config_name: string; command: string }[];
  lastConfig: { run_type: string; run_config_name: string; command: string } | null;
  childStringNodes: string[];
  childBoolNodes: string[];
  childIntNodes: string[];
  childFloatNodes: string[];
  childSecretNodes: string[];
  childAnyNodes: string[];
}

export const RemoteRunDialog: React.FC<RemoteRunDialogProps> = ({
  remoteRunTypes,
  remoteRunConfigs,
  lastConfig,
  childStringNodes,
  childBoolNodes,
  childIntNodes,
  childFloatNodes,
  childSecretNodes,
  childAnyNodes
}) => {
  const [checkedState, setCheckedState] = useState<{ [key: string]: boolean }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [remoteRunType, setRemoteRunType] = useState("");
  const [remoteRunConfig, setRemoteRunConfig] = useState("");
  const [command, setCommand] = useState("");
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [formattedCommand, setFormattedCommand] = useState("");
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    runType: false,
    runConfig: false,
    commandTemplate: false,
    arguments: false,
    placeholders: false,
    finalCommand: false
  });

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
    let substitutedCmd = cmd.replace(/{([^}]+)}/g, (_, key) => values[key] || `{${key}}`);
    
    // Append argument values
    const argumentValues = [
      ...childStringNodes,
      ...childBoolNodes,
      ...childIntNodes,
      ...childFloatNodes,
      ...childSecretNodes,
      ...childAnyNodes
    ].map(name => {
      if (childBoolNodes.includes(name)) {
        return checkedState[name] ? `--${name}` : '';
      }
      return inputValues[name] ? `--${name} ${inputValues[name]}` : '';
    }).filter(Boolean);

    if (argumentValues.length > 0) {
      substitutedCmd += ' ' + argumentValues.join(' ');
    }

    return substitutedCmd;
  };

  useEffect(() => {
    setFormattedCommand(substituteCommand(command, inputValues));
  }, [command, inputValues, checkedState]);

  const handleInputChange = (name: string, value: string) => {
    const newInputValues = { ...inputValues, [name]: value };
    setInputValues(newInputValues);
  };

  const toggleSection = (section: string) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  const renderCollapsibleSection = (title: string, content: React.ReactNode, section: string) => (
    <div style={styles.collapsibleSection}>
      <h3 
        onClick={() => toggleSection(section)} 
        style={styles.sectionHeader}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = styles.sectionHeaderHover.backgroundColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = styles.sectionHeader.backgroundColor;
        }}
      >
        {title} {sectionsCollapsed[section] ? '▼' : '▲'}
      </h3>
      {!sectionsCollapsed[section] && <div style={styles.sectionContent}>{content}</div>}
    </div>
  );


  const hasArguments = childStringNodes.length > 0 || childBoolNodes.length > 0 || 
                       childIntNodes.length > 0 || childFloatNodes.length > 0 ||
                       childAnyNodes.length > 0;

  return (
    <form>
      <h2>Remote Run</h2>
      
      {renderCollapsibleSection("Available Run Type", (
        <div style={styles.select}>
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
      ), "runType")}

      {renderCollapsibleSection("Available Run Config", (
        <div style={styles.select}>
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
      ), "runConfig")}

      {renderCollapsibleSection("Command Template", (
        <TextAreaInput
          name="commandTemplate"
          title=""
          oldValue={command}
          onChange={() => {}}
          readOnly={true}
        />
      ), "commandTemplate")}

      {hasArguments && renderCollapsibleSection("Arguments", (
        <>
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
          {childSecretNodes.map((name, index) => (
            <SecretInput 
              key={`secret-${index}`} 
              name={name} 
              title={name} 
              oldValue={inputValues[name] || ""} 
              onChange={(value) => handleInputChange(name, value)}
            />
          ))}
          {childAnyNodes.map((name, index) => (
            <StringInput 
              key={`any-${index}`} 
              name={name} 
              title={name} 
              oldValue={inputValues[name] || ""} 
              onChange={(value) => handleInputChange(name, value)}
            />
          ))}
        </>
      ), "arguments")}

      {placeholders.length > 0 && renderCollapsibleSection("Placeholders", (
        <>
          {placeholders.map((name, index) => (
            <StringInput 
              key={`placeholder-${index}`} 
              name={name}
              title={name} 
              oldValue={inputValues[name] || ""} 
              onChange={(value) => handleInputChange(name, value)}
            />
          ))}
        </>
      ), "placeholders")}

      {renderCollapsibleSection("Final Command", (
        <TextAreaInput
          name="formattedCommand"
          title=""
          oldValue={formattedCommand}
          onChange={() => {}}
        />
      ), "finalCommand")}
    </form>
  );
};


const styles = {

  select: {
    width: '100%',
    height: 'auto',
  },

  collapsibleSection: {
    marginBottom: '10px',
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    marginBottom: '0',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  sectionHeaderHover: {
    backgroundColor: '#e0e0e0',
  },
  sectionContent: {
    padding: '10px',
    border: '1px solid #ddd',
    borderTop: 'none',
  },
};