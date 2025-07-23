import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { requestAPI } from '../server/handler';
import { startRunOutputStr } from '../components/runner/RunOutput';
import '../../style/ContextMenu.css';
import { buildLocalFilePath, fetchLibraryConfig } from '../tray_library/ComponentLibraryConfig';
import { commandIDs } from "../commands/CommandIDs";
import { downloadIcon, linkIcon, folderIcon, textEditorIcon, kernelIcon, deleteIcon } from "@jupyterlab/ui-components";
import { Notification } from '@jupyterlab/apputils';
import { normalizeLibraryName } from '../tray_library/ComponentLibraryConfig';

export async function handleInstall(
    app,
    libraryName: string,
    refreshTrigger: () => void
): Promise<boolean> {
    const originalName = libraryName;
    const normalizedLibName = normalizeLibraryName(originalName);

    const proceed = confirm(`Do you want to proceed with installing "${originalName}" library?`);
    if (!proceed) return false;

    const installPromise = requestAPI<any>('library/install', {
        method: 'POST',
        body: JSON.stringify({ libraryName: normalizedLibName })
    });

    Notification.promise(installPromise, {
        pending: {
        message: `Installing ${originalName} library...`,
        options: { autoClose: 3000 }
    },
    success: {
        message: () => `Library ${originalName} installed successfully.`,
        options: { autoClose: 3000 }
    },
    error: {
        message: (err) => `Failed to install ${originalName}: ${err}`,
        options: { autoClose: false }
    }
    });

    try {
        const result = await installPromise;
        if (result.status === 'OK') {
        refreshTrigger();
        return true;
        } else {
        console.error(`Installation failed: ${result.error || 'Unknown error'}`);
        return false;
        }
    } catch (err) {
        console.error(`Installation error: ${err}`);
        return false;
    }
}

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

const CORE_LIBS = new Set([ "xai_events", "xai_template", "xai_controlflow", "xai_utils" ]);

const TrayContextMenu = ({ app, x, y, visible, libraryName, status, refreshTrigger, onClose }: TrayContextMenuProps) => {
    const trayContextMenuRef = useRef<HTMLDivElement>(null);
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
        if (trayContextMenuRef.current && !trayContextMenuRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);


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

    const handleUninstall = async (libraryName: string) => {
        if (!confirm(`Uninstall ${libraryName}?`)) return;

        try {
            await requestAPI<any>('library/uninstall', {
            method: 'POST',
            body: JSON.stringify({ libraryName })
            });
            Notification.success(`Library ${libraryName} uninstalled.`, { autoClose: 3000 });
            refreshTrigger();
        } catch (err) {
            Notification.error(`Failed to uninstall ${libraryName}: ${err}`, { autoClose: false });
        }
        };

    if (!visible) {
        return null;
    }

    const isCore = CORE_LIBS.has(libraryName.toLowerCase());

    function addHoverClass(e){
        e.currentTarget.classList.add("lm-mod-active");
    }
    function removeHoverClass(e){
        e.currentTarget.classList.remove("lm-mod-active");
    }

    function Option(props) {
        const {onClick, label, icon} = props;
        const Icon = icon ? icon : 'span';
        return <li className="lm-Menu-item" role="menuitem" onMouseEnter={addHoverClass} onMouseLeave={removeHoverClass}
                   onClick={() => {onClick(); onClose();}}
        >
            <div className="lm-Menu-itemIcon"><Icon /></div>
            <div className="lm-Menu-itemLabel">{label}</div>
        </li>;
    }

    return ReactDOM.createPortal(
      <div className="lm-Menu sidebar-context-menu" ref={trayContextMenuRef}
           style={{ position: "absolute", left: `${x + 5}px`, top: `${y}px`, zIndex: 1000 }}>
          <ul className="lm-Menu-content" role="menu">
            {status === 'remote' ? (
                <>
                    <Option icon={downloadIcon.react} label={`Install ${libraryName}`} onClick={() => handleInstall(app, libraryName, refreshTrigger)} />
                    {validOptions.showPageInNewTab && (
                      <Option icon={linkIcon.react} label="Open Repository" onClick={() => handleShowPageInNewTab(libraryName)} />
                    )}
                </>
            ) : (
                <>
                    {validOptions.showInFileBrowser && (
                      <Option icon={folderIcon.react} label="Show in File Explorer" onClick={() => handleShowInFileBrowser(libraryName)} />
                    )}
                    {validOptions.showReadme && (
                      <Option icon={textEditorIcon.react} label="See Readme" onClick={() => handleShowReadme(libraryName)} />
                    )}
                    {validOptions.showExample && (
                      <Option icon={kernelIcon.react} label="Show Example" onClick={() => handleShowExample(libraryName)} />
                    )}
                    {validOptions.showPageInNewTab && (
                      <Option icon={linkIcon.react} label="Open Repository" onClick={() => handleShowPageInNewTab(libraryName)} />
                    )}
                    {!isCore && (
                      <Option icon={deleteIcon.react} label={`Uninstall ${libraryName}`} onClick={() => handleUninstall(libraryName)} />
                    )}
                </>
            )}
          </ul>
        </div>,
        document.body
    );
};

export default TrayContextMenu;