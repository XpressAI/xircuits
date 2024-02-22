import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { requestAPI } from '../server/handler';
import { commandIDs } from '../components/XircuitsBodyWidget';
import { startRunOutputStr } from '../components/runner/RunOutput';
import '../../style/ContextMenu.css';
import { buildLocalFilePath, fetchLibraryConfig } from '../tray_library/ComponentLibraryConfig';

export interface TrayContextMenuProps {
    app: any;
    x: number;
    y: number;
    visible: boolean;
    val: any;
    status: string;
    onClose: () => void;
}

async function requestLibrary(libraryName, endpoint) {
    const data = { libraryName };
  
    try {
      return await requestAPI(endpoint, {
        body: JSON.stringify(data),
        method: 'POST',
      });
    } catch (reason) {
      console.error(`Error on POST /${endpoint}`, data, reason);
    }
}

const TrayContextMenu = ({ app, x, y, visible, val, status, onClose }: TrayContextMenuProps) => {
    const trayContextMenuRef = useRef(null);
    const [validOptions, setValidOptions] = useState({
        showInFileBrowser: false,
        showReadme: false,
        showExample: false,
        showPageInNewTab: false
    });

    useEffect(() => {
        // Initialize all options as invalid
        setValidOptions({
            showInFileBrowser: false,
            showReadme: false,
            showExample: false,
            showPageInNewTab: false
        });

        const validateOptions = async () => {
            try {
                const libraryConfig = await fetchLibraryConfig(val);
                setValidOptions({
                    showInFileBrowser: !!libraryConfig.local_path,
                    showReadme: await buildLocalFilePath(val, 'readme') !== null,
                    showExample: await buildLocalFilePath(val, 'default_example_path') !== null,
                    showPageInNewTab: !!libraryConfig.repository
                });
            } catch (error) {
                console.error('Error validating context menu options:', error);
            }
        };

        if (visible) {
            validateOptions();
        }
    }, [val, visible]);

    const handleClickOutside = (event) => {
        if (event.target.className !== "context-menu-option") {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    // Context menu action handlers
    const handleInstall = async (val) => {
        const userResponse = confirm("Do you want to proceed with " + val + " library installation?");
        if (userResponse) {
            try {
                await requestLibrary(val, "library/fetch");
                const response = await requestLibrary(val, "library/get_directory");
                if (response['path']) {
                    let code = startRunOutputStr()
                    code += "!pip install -r " + response['path'] + "/requirements.txt"
                    app.commands.execute(commandIDs.executeToOutputPanel, { code });
                    console.log(`${val} library sucessfully installed.`);
                } else if (response['message']) {
                    alert(response['message']);
                }
            } catch (error) {
                alert(`Failed to install ${val}: ` + error);
            }
          }
    }
    
    const handleShowInFileBrowser = async (val) => {
        try {
            const libraryConfig = await fetchLibraryConfig(val);
    
            if (libraryConfig && libraryConfig.local_path) {
                await app.commands.execute('filebrowser:go-to-path', { path: libraryConfig.local_path });
            }
        } catch (error) {
            alert(`Failed to Show in File Browser: ${error}`);
        }
    };

    const handleShowReadme = async (val) => {
    try {
        const readmePath = await buildLocalFilePath(val, 'readme');
        if (readmePath) {
            await app.commands.execute('markdownviewer:open', { path: readmePath, options: { mode: 'split-right' } });
        }
    } catch (error) {
        alert('Failed to Show Readme: ' + error);
        }
    };

    const handleShowExample = async (val) => {
        try {
            const examplePath = await buildLocalFilePath(val, 'default_example_path');
            if (examplePath) {
                await app.commands.execute('docmanager:open', { path: examplePath });
            }
        } catch (error) {
            alert('Failed to Show Example: ' + error);
        }
    };
    
    const handleShowPageInNewTab = async (libName) => {
        try {
            const libraryConfig = await fetchLibraryConfig(libName);
    
            if (libraryConfig && libraryConfig.repository) {
                window.open(libraryConfig.repository, '_blank');
            }
        } catch (error) {
            alert(`Failed to Open Page: ${error}`);
        }
    };

    if (!visible) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="context-menu" ref={trayContextMenuRef} style={{ position: 'absolute', left: `${x+5}px`, top: `${y}px`, zIndex: 1000 }}>
            {status === 'remote' ? (
                <>
                    <div className="context-menu-option" onClick={() => { handleInstall(val); onClose(); }}>Install</div>
                    {validOptions.showPageInNewTab && (
                        <div className="context-menu-option" onClick={() => { handleShowPageInNewTab(val); onClose(); }}>Open Repository</div>
                    )}
                </>
            ) : (
                <>
                    {validOptions.showInFileBrowser && (
                        <div className="context-menu-option" onClick={() => { handleShowInFileBrowser(val); onClose(); }}>Show in File Explorer</div>
                    )}
                    {validOptions.showReadme && (
                        <div className="context-menu-option" onClick={() => { handleShowReadme(val); onClose(); }}>See Readme</div>
                    )}
                    {validOptions.showExample && (
                        <div className="context-menu-option" onClick={() => { handleShowExample(val); onClose(); }}>Show Example</div>
                    )}
                    {validOptions.showPageInNewTab && (
                        <div className="context-menu-option" onClick={() => { handleShowPageInNewTab(val); onClose(); }}>Open Repository</div>
                    )}
                </>
            )}
        </div>,
        document.body
    );
};

export default TrayContextMenu;