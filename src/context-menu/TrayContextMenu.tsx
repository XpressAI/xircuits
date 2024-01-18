import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { requestAPI } from '../server/handler';
import { commandIDs } from '../components/XircuitsBodyWidget';
import { startRunOutputStr } from '../components/runner/RunOutput';
import '../../style/ContextMenu.css';

export interface TrayContextMenuProps {
    app: any; // Specify the correct type
    x: number;
    y: number;
    visible: boolean;
    val: any; // Type this appropriately
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

const TrayContextMenu = ({ app, x, y, visible, val, onClose }: TrayContextMenuProps) => {
    // Ref for the context menu
    const trayContextMenuRef = useRef(null);

    // Function to check if a click is outside the context menu
    const handleClickOutside = (event) => {
        if (event.target.className !== "context-menu-option") {
            onClose();
        }
    };

    // Effect for handling click outside
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
            const response = await requestLibrary(val, "library/get_directory");
            if (response['path']) {
                await app.commands.execute('filebrowser:go-to-path', { path: response['path'] });
            } else if (response['message']) {
                alert(response['message']);
            }
        } catch (error) {
            alert('Failed to Show in File Browser: ' + error);
        }
    };
    
    const handleShowReadme = async (val) => {
        try {
            const response = await requestLibrary(val, "library/get_readme");
            if (response['path']) {
                await app.commands.execute('markdownviewer:open', { path: response['path'], options: { mode: 'split-right'} });
            } else if (response['message']) {
                alert(response['message']);
            }
        } catch (error) {
            alert('Failed to Show Readme: ' + error);
        }
    };
    
    const handleShowExample = async (val) => {
        try {
            const response = await requestLibrary(val, "library/get_example");
            if (response['path']) {
                await app.commands.execute('docmanager:open', { path: response['path'] });
            } else if (response['message']) {
                alert(response['message']);
            }
        } catch (error) {
            alert('Failed to Show Example: ' + error);
        }
    };

    if (!visible) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="context-menu" ref={trayContextMenuRef} style={{ position: 'absolute', left: `${x+5}px`, top: `${y}px`, zIndex: 1000 }}>
            <div className="context-menu-option" onClick={() => { handleInstall(val); onClose(); }}>Install</div>
            <div className="context-menu-option" onClick={() => { handleShowInFileBrowser(val); onClose(); }}>Show in File Explorer</div>
            <div className="context-menu-option" onClick={() => { handleShowReadme(val); onClose(); }}>See Readme</div>
            <div className="context-menu-option" onClick={() => { handleShowExample(val); onClose(); }}>Show Example</div>
        </div>,
        document.body
    );
};

export default TrayContextMenu;