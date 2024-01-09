import ComponentList from './Component';
import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { TrayItemWidget } from './TrayItemWidget';
import { TrayWidget } from './TrayWidget';
import { JupyterFrontEnd } from '@jupyterlab/application';

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel
} from "react-accessible-accordion";

import { requestAPI } from '../server/handler';
import { XircuitsFactory } from '../XircuitsFactory';
import ReactDOM from 'react-dom';

import '../../style/ContextMenu.css'

export const Body = styled.div`
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  min-height: 100%;
  background-color: black;
  height: 100%;
  overflow-y: auto;
`;

export const Content = styled.div`
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    max-height: auto;
    'border-top': '4px solid #dfe2e5'
`;

const headerList = [
    { task: 'GENERAL', id: 1 }
];

const advancedList = [
    { task: 'ADVANCED', id: 1 }
];

const colorList_adv = [
    { task: "rgb(192,255,0)", id: 1 },
    { task: "rgb(0,102,204)", id: 2 },
    { task: "rgb(255,153,102)", id: 3 },
    { task: "rgb(255,102,102)", id: 4 },
    { task: "rgb(15,255,255)", id: 5 },
    { task: "rgb(255,204,204)", id: 6 },
    { task: "rgb(153,204,51)", id: 7 },
    { task: "rgb(255,153,0)", id: 8 },
    { task: "rgb(255,204,0)", id: 9 },
    { task: "rgb(204,204,204)", id: 10 },
    { task: "rgb(153,204,204)", id: 11 },
    { task: "rgb(153,0,102)", id: 12 },
    { task: "rgb(102,51,102)", id: 13 },
    { task: "rgb(153,51,204)", id: 14 },
    { task: "rgb(102,102,102)", id: 15 },
    { task: "rgb(255,102,0)", id: 16 },
    { task: "rgb(51,51,51)", id: 17 },
];

const colorList_general = [
    { task: "rgb(21,21,51)", id: 1 }
];

export interface SidebarProps {
    app: JupyterFrontEnd;
    factory: XircuitsFactory;
}

const ContextMenu = ({ x, y, ref, val, onInstall, onShowInFileBrowser, onShowReadme, onShowExample, onClose }) => {
    
    const contextMenuStyle = {
        position: 'absolute' as 'absolute',
        left: `${x+5}px`,
        top: `${y}px`,
        zIndex: 1000
    };

    return ReactDOM.createPortal(
        <div className="context-menu" ref={ref} style={contextMenuStyle}>
            <div className="option" onClick={() => { onInstall(val); onClose(); }}>Install</div>
            <div className="option" onClick={() => { onShowInFileBrowser(val); onClose(); }}>Show in File Explorer</div>
            <div className="option" onClick={() => { onShowReadme(val); onClose(); }}>See Readme</div>
            <div className="option" onClick={() => { onShowExample(val); onClose(); }}>Show Example</div>
        </div>,
        document.body
    );
};

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

async function fetchComponent(componentList: string[]) {
    let component_root = componentList.map(x => x["category"]);

    let headers = Array.from(new Set(component_root));
    let headerList: any[] = [];
    let headerList2: any[] = [];
    let displayHeaderList: any[] = [];

    for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
        if (headers[headerIndex] == 'ADVANCED' || headers[headerIndex] == 'GENERAL') {
            headerList.push(headers[headerIndex]);
        } else {
            headerList2.push(headers[headerIndex]);
        }
    }

    if (headerList.length != 0) {
        headerList = headerList.sort((a, b) => a < b ? 1 : a > b ? -1 : 0);
        headers = [...headerList, ...headerList2];
        for (let headerIndex2 = 0; headerIndex2 < headers.length; headerIndex2++) {
            displayHeaderList.push({
                "task": headers[headerIndex2],
                "id": headerIndex2 + 1
            });
        }
    }

    return displayHeaderList;
}

export default function Sidebar(props: SidebarProps) {
    
    const app = props.app

    const [componentList, setComponentList] = React.useState([]);
    const [category, setCategory] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [runOnce, setRunOnce] = useState(false);

    let handleOnChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearchTerm("");
        setSearchTerm(event.target.value);
    }

    function handleSearchOnClick() {
        setSearchTerm("");
        setSearchTerm(searchTerm);
    }

    const fetchComponentList = async () => {
          // get the component list 
        const response_1 = await ComponentList();

        // get the header from the components
        const response_2 = await fetchComponent(response_1);

        // to ensure the component list is empty before setting the component list
        if (response_1.length > 0) {
            setComponentList([]);
            setCategory([]);
        }

        setComponentList(response_1);
        setCategory(response_2);
    }

    useEffect(() => {
        if (!runOnce) {
            fetchComponentList();
            setRunOnce(true);
        }

    }, [category, componentList]);

    function handleRefreshOnClick() {
        fetchComponentList();
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchComponentList();
        }, 600000); // every 10 minutes should re-fetch the component list
        return () => clearInterval(intervalId);
    }, [category, componentList]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            await props.factory.fetchComponentsSignal.emit(componentList);
        }, 300); // Send component list to canvas once render or when refresh
        return () => clearInterval(intervalId);
    },[componentList, handleRefreshOnClick]);



    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, val: null });
     // Ref for the context menu
     const contextMenuRef = useRef(null);

    // Function to handle right-click
    const handleRightClick = (e, val) => {
        e.preventDefault();

        // Get the bounding rectangle of the clicked element
        const rect = e.target.getBoundingClientRect();

        const posX = rect.right;
        const posY = rect.top;

        setContextMenu({
            visible: true,
            x: posX,
            y: posY,
            val: val
        });
    };
 
    // Function to close context menu
    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, val: null });
    };
 
     // Function to check if a click is outside the context menu
     const handleClickOutside = (event) => {
        console.log("this is handle click outside")
         if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
             closeContextMenu();
         }
     };
 
    // Effect for handling click outside
    useEffect(() => {
        // Only add event listener if context menu is visible
        if (contextMenu.visible) {
            document.addEventListener('click', handleClickOutside, true);
        }
        // Cleanup function to remove event listener
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [contextMenu.visible]); // Dependency on contextMenu.visible

    
    
    const handleInstall = async (val) => {
        try {
            const response = await requestLibrary(val, "library/install");
            console.log('Installation Response:', response);
          } catch (error) {
            console.error('Installation Failed:', error);
          }
    };
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
    

    useEffect(() => {
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);
    
    

    return (
        <Body>
            <Content>
                <TrayWidget>
                    <div>
                        <div className="search-input">
                            <input type="text" name="" value={searchTerm} placeholder="SEARCH" className="search-input__text-input" style={{ width: "75%" }} onChange={handleOnChange} />
                            <a onClick={handleSearchOnClick} className="search-input__button"><i className="fa fa-search "></i></a>
                            <a onClick={handleRefreshOnClick} className="search-input__button"><i className="fa fa-refresh "></i></a>
                        </div>

                        <Accordion allowZeroExpanded>
                            {
                                category.filter((val) => {
                                    if (searchTerm == "") {
                                        return val;
                                    }
                                }).map((val, i) => {
                                    return (
                                        <AccordionItem key={`index-1-${val["task"].toString()}`}>
                                            <AccordionItemHeading>
                                                <AccordionItemButton onContextMenu={(e) => handleRightClick(e, val["task"])}>{val["task"]}</AccordionItemButton>
                                            </AccordionItemHeading>
                                            <AccordionItemPanel>
                                                {
                                                    componentList.filter((componentVal) => {
                                                        if (searchTerm == "") {
                                                            return componentVal;
                                                        }
                                                    }).map((componentVal, i2) => {
                                                        if (componentVal["category"].toString().toUpperCase() == val["task"].toString()) {
                                                            return (
                                                                <div key={`index-1-${i2}`}>
                                                                    <TrayItemWidget
                                                                        model={{
                                                                            type: componentVal.type,
                                                                            name: componentVal.task,
                                                                            color: componentVal.color,
                                                                            path: componentVal.file_path,
                                                                            docstring: componentVal.docstring,
                                                                            lineNo: componentVal.lineno
                                                                        }}
                                                                        name={componentVal.task}
                                                                        color={componentVal.color}
                                                                        app={props.app}
                                                                        path={componentVal.file_path}
                                                                        lineNo= {componentVal.lineno}/>
                                                                </div>
                                                            );
                                                        }
                                                    })
                                                }
                                            </AccordionItemPanel>
                                        </AccordionItem>
                                    );
                                })
                            }

                        </Accordion>
                        {
                            componentList.filter((val) => {
                                if (searchTerm != "" && val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                    return val
                                }
                            }).map((val, i) => {
                                return (
                                    <div key={`index-3-${i}`}>
                                        <TrayItemWidget
                                            model={{ 
                                                type: val.type, 
                                                name: val.task,
                                                color: val.color,
                                                path: val.file_path,
                                                docstring: val.docstring,
                                                lineNo: val.lineno
                                            }}
                                            name={val.task}
                                            color={val.color}
                                            app={props.app}
                                            path={val.file_path}
                                            lineNo= {val.lineno} />
                                    </div>
                                );
                            })
                        }
                    </div>
                </TrayWidget>
            </Content>
            {contextMenu.visible && (
            <ContextMenu
                ref={contextMenuRef}
                x={contextMenu.x}
                y={contextMenu.y}
                val={contextMenu.val}
                onInstall={handleInstall}
                onShowInFileBrowser={handleShowInFileBrowser}
                onShowReadme={handleShowReadme}
                onShowExample={handleShowExample}
                onClose={closeContextMenu}
                />
            )}
        </Body>
    )
};
