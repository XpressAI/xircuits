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
    libraryName: string;
    status: string;
    refreshTrigger: () => void;
    onClose: () => void;
}

const TrayContextMenu = ({ app, x, y, visible, libraryName, status, refreshTrigger, onClose }: TrayContextMenuProps) => {
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
                const libraryConfig = await fetchLibraryConfig(libraryName);
                setValidOptions({
                    showInFileBrowser: !!libraryConfig.local_path,
                    showReadme: await buildLocalFilePath(libraryName, 'readme') !== null,
                    showExample: await buildLocalFilePath(libraryName, 'default_example_path') !== null,
                    showPageInNewTab: !!libraryConfig.repository
                });
            } catch (error) {
                console.error('Error validating context menu options:', error);
            }
        };

        if (visible) {
            validateOptions();
        }
    }, [libraryName, visible]);

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
    const handleInstall = async (libraryName, refreshTrigger) => {
        const userResponse = confirm(`Do you want to proceed with ${libraryName} library installation?`);
        if (userResponse) {
            try {
                // clone the repository
                const response: any = await requestAPI("library/fetch", {
                    body: JSON.stringify({libraryName}),
                    method: 'POST',
                  });

                if (response.status !== 'OK') {
                    throw new Error(response.message || 'Failed to fetch the library.');
                }

                const libraryConfig = await fetchLibraryConfig(libraryName);
                if (libraryConfig && libraryConfig.local_path) {
                    let code = startRunOutputStr();
                    code += `!pip install -r ${libraryConfig.local_path}/requirements.txt`;
                    app.commands.execute(commandIDs.executeToOutputPanel, { code });
                    console.log(`${libraryName} library successfully installed.`);
                } else {
                    alert(`Library configuration not found for: ${libraryName}`);
                }
                refreshTrigger();
            } catch (error) {
                alert(`Failed to install ${libraryName}. Please check the console for more details.`);
                console.error(`Failed to install ${libraryName}:`, error);
            }
        }
    };

    const handleShowInFileBrowser = async (libraryName) => {
        try {
            const libraryConfig = await fetchLibraryConfig(libraryName);
    
            if (libraryConfig && libraryConfig.local_path) {
                await app.commands.execute('filebrowser:go-to-path', { path: libraryConfig.local_path });
            }
        } catch (error) {
            alert(`Failed to Show in File Browser: ${error}`);
        }
    };

    const handleShowReadme = async (libraryName) => {
    try {
        const readmePath = await buildLocalFilePath(libraryName, 'readme');
        if (readmePath) {
            await app.commands.execute('markdownviewer:open', { path: readmePath, options: { mode: 'split-right' } });
        }
    } catch (error) {
        alert('Failed to Show Readme: ' + error);
        }
    };

    const handleShowExample = async (libraryName) => {
        try {
            const examplePath = await buildLocalFilePath(libraryName, 'default_example_path');
            if (examplePath) {
                await app.commands.execute('docmanager:open', { path: examplePath });
                await app.commands.execute('filebrowser:activate', { path: examplePath });
                await app.commands.execute('filebrowser:go-to-path', { path: examplePath });
            }
        } catch (error) {
            alert('Failed to Show Example: ' + error);
        }
    };
    
    const handleShowPageInNewTab = async (libraryName) => {
        try {
            const libraryConfig = await fetchLibraryConfig(libraryName);
    
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
                    <div className="context-menu-option" onClick={() => { handleInstall(libraryName, refreshTrigger); onClose(); }}>Install</div>
                    {validOptions.showPageInNewTab && (
                        <div className="context-menu-option" onClick={() => { handleShowPageInNewTab(libraryName); onClose(); }}>Open Repository</div>
                    )}
                </>
            ) : (
                <>
                    {validOptions.showInFileBrowser && (
                        <div className="context-menu-option" onClick={() => { handleShowInFileBrowser(libraryName); onClose(); }}>Show in File Explorer</div>
                    )}
                    {validOptions.showReadme && (
                        <div className="context-menu-option" onClick={() => { handleShowReadme(libraryName); onClose(); }}>See Readme</div>
                    )}
                    {validOptions.showExample && (
                        <div className="context-menu-option" onClick={() => { handleShowExample(libraryName); onClose(); }}>Show Example</div>
                    )}
                    {validOptions.showPageInNewTab && (
                        <div className="context-menu-option" onClick={() => { handleShowPageInNewTab(libraryName); onClose(); }}>Open Repository</div>
                    )}
                </>
            )}
        </div>,
        document.body
    );
};

export default TrayContextMenu;