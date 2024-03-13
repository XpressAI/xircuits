import React, { useState } from 'react';
import { Dialog } from '@jupyterlab/apputils';
import { formDialogWidget } from './formDialogwidget';
import { LibraryConfig } from '../tray_library/ComponentLibraryConfig';


export interface NewLibraryInputDialogProps {
  title: string;
  oldValue: string;
  libraries: LibraryConfig[];
}

export function newLibraryInputDialog(props: NewLibraryInputDialogProps) {
  const { title } = props;
  return {
    title,
    body: formDialogWidget(<NewLibraryInput{...props} />),
    buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Submit' })],
    defaultButton: 1,
  };
}

export const NewLibraryInput: React.FC<NewLibraryInputDialogProps> = ({ title, oldValue, libraries }) => {
  const [selectedLibrary, setSelectedLibrary] = useState(oldValue || '');
  const [customLibrary, setCustomLibrary] = useState('');

  const handleLibraryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedLibrary(value);
    if (value === 'custom-option') {
      setCustomLibrary('');
    }
  };

  const handleCustomLibraryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomLibrary(value);
  };

  const installedLibraries = libraries.filter(library => library.status === 'installed');

  return (
    <form>
      <div style={{ padding: '20px', width: '400px', margin: 'auto' }}>
        <label htmlFor="library-select">{title}</label>
        <select
          id="library-select"
          name="library-select"
          value={selectedLibrary}
          onChange={handleLibraryChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        >
          <option value="" disabled>Select a library</option>
          {installedLibraries.map(library => (
            <option key={library.library_id} value={library.library_id}>
              {library.library_id}
            </option>
          ))}
          <option value="custom-option">Other (Specify Below)</option>
        </select>
        {selectedLibrary === 'custom-option' && (
          <>
            <input
              type="text"
              name="customLibrary"
              value={customLibrary}
              onChange={handleCustomLibraryChange}
              placeholder="Enter library name"
              style={{ width: '100%' }}
            />
            {/* Hidden input to hold the custom library value */}
            <input type="hidden" name="selectedLibrary" value={customLibrary} />
          </>
        )}
      </div>
    </form>
  );
};

