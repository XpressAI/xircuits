import React, { useState } from 'react';
import Switch from "react-switch";
import TextareaAutosize from 'react-textarea-autosize';
import * as NumericInput from "react-numeric-input";

interface StringInputProps {
    title: string;
    name: string;
    oldValue: string;
    onChange: (value: string) => void;
}

export const StringInput: React.FC<StringInputProps> = ({ title, name, oldValue, onChange }) => {
    return (
        <div>
            <h4>{title}</h4>
            <input
                name={name}
                style={{ width: 400 }}
                defaultValue={oldValue}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

interface BooleanInputProps {
    title: string;
    name: string;
    oldValue: string;
    onChange: (value: boolean) => void;
}

export const BooleanInput: React.FC<BooleanInputProps> = ({ title, name, oldValue, onChange }) => {
    const [checked, setChecked] = useState<boolean>(oldValue.toLowerCase() === 'true');

    const handleChecked = () => {
        const newValue = !checked;
        setChecked(newValue);
        onChange(newValue);
    };

    return (
        <div>
            <h4>{title}</h4>
            <Switch
                checked={checked}
                name={name}
                onChange={handleChecked}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                handleDiameter={25}
                height={20}
                width={48}
            />
            <input 
                type="hidden" 
                name={name} 
                value={checked ? 'True' : 'False'}
            />
        </div>
    );
}

interface NumberInputProps {
    title: string;
    name: string;
    oldValue: string;
    type: 'int' | 'float';
    onChange: (value: string) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ title, name, oldValue, type, onChange }) => {
    return (
        <div>
            <h4>{title}</h4>
            <NumericInput
                className="form-control"
                name={name}
                value={oldValue}
                min={0}
                type="number"
                step={type === 'float' ? 0.1 : 1}
                precision={type === 'float' ? 2 : 0}
                mobile={true}
                onChange={(valueAsNumber, valueAsString) => onChange(valueAsString)}
                style={{ input: { width: 400 } }}
            />
        </div>
    );
}

interface TextAreaInputProps {
    title: string;
    name: string;
    oldValue: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({ title, name, oldValue, onChange, readOnly = false }) => {
    return (
        <div>
            <h4>{title}</h4>
            <TextareaAutosize
                name={name}
                defaultValue={oldValue}
                minRows={5}
                style={{ width: 400, fontSize: 12 }}
                onChange={(e) => onChange(e.target.value)}
                readOnly={readOnly}
            />
        </div>
    );
}

interface SecretInputProps {
    title: string;
    name: string;
    oldValue: string;
    onChange: (value: string) => void;
  }

export const SecretInput: React.FC<SecretInputProps> = ({
    title,
    name,
    oldValue,
    onChange,
  }) => {
    return (
      <div>
        <h4>{title}</h4>
        <input
          name={name}
          type="password"
          style={{ width: 400 }}
          defaultValue={oldValue}
          autoComplete="off"
          readOnly
          onFocus={(e) => e.target.removeAttribute('readOnly')}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
};
