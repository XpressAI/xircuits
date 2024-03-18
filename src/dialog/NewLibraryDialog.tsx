import React, { useState } from 'react';
import { Dialog } from '@jupyterlab/apputils';
import { formDialogWidget } from './formDialogwidget';
import { LibraryConfig } from '../tray_library/ComponentLibraryConfig';
import TextareaAutosize from 'react-textarea-autosize';

export interface NewLibraryInputDialogProps {
  title: string;
  oldValue: string;
  libraries: LibraryConfig[];
  oldComponentCode: string;
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

export const NewLibraryInput: React.FC<NewLibraryInputDialogProps> = ({ title, oldValue, libraries, oldComponentCode }) => {
  const [selectedLibrary, setSelectedLibrary] = useState(oldValue || '');
  const [customLibrary, setCustomLibrary] = useState('');
  const [componentCode, setComponentCode] = useState(oldComponentCode || '');

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

  const gridContainer = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridGap: '10px',
    padding: '20px',
    width: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const selectStyle = {
    display: 'block',
    width: '100%',
    paddingTop: '5px',
    paddingBottom: '5px',
  };

  return (
    <form>
      <div style={gridContainer} className="jp-mod-styled">
        <label htmlFor="library-select">Component Save Location</label>
        <select
          id="library-select"
          name="library-select"
          value={selectedLibrary}
          onChange={handleLibraryChange}
          style={selectStyle}
          className="jp-mod-styled"
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
              style={{ width: '100%', marginBottom: '10px' }}
              className="jp-mod-styled"
            />
            {/* Hidden input to hold the custom library value */}
            <input type="hidden" name="selectedLibrary" value={customLibrary} />
          </>
        )}
        <label htmlFor="component-code">Component Code</label>
        <TextareaAutosize
          id="component-code"
          name="component-code"
          minRows={12}
          style={{ width: 500, height: 200, fontSize: 12, marginBottom: '10px' }}
          value={componentCode}
          onChange={(e) => setComponentCode(e.target.value)}
          placeholder="Enter component code here"
          className="jp-mod-styled"
        />
      </div>
    </form>
  );
};