import { ComponentList, refreshComponentListCache } from "./Component";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import styled from "@emotion/styled";
import { TrayItemWidget } from "./TrayItemWidget";
import { TrayWidget } from "./TrayWidget";
import { JupyterFrontEnd } from "@jupyterlab/application";

import {
    Accordion,
    AccordionItem,
    AccordionItemButton,
    AccordionItemHeading,
    AccordionItemPanel
} from "react-accessible-accordion";

import { XircuitsFactory } from "../XircuitsFactory";
import TrayContextMenu from "../context-menu/TrayContextMenu";

import "../../style/ContextMenu.css";
import { ComponentLibraryConfig, refreshComponentLibraryConfigCache } from "./ComponentLibraryConfig";
import ReactTooltip from "react-tooltip";
import { marked } from "marked";
import { MenuSvg } from "@jupyterlab/ui-components";
import { commandIDs } from "../commands/CommandIDs";
import { NodePreview } from "./NodePreview";
import { ellipsesIcon } from "@jupyterlab/ui-components";


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

export interface SidebarProps {
    app: JupyterFrontEnd;
    factory: XircuitsFactory;
}

async function fetchComponent(componentList) {
    let headers = Array.from(new Set(componentList.map(x => x.category)));
    let parameterComponentList = [];
    let libraryComponentList = [];
    let displayHeaderList = [];

    for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
        const currentHeader = headers[headerIndex];
        if (currentHeader === 'ADVANCED' || currentHeader === 'GENERAL') {
            parameterComponentList.push(currentHeader);
        } else {
            libraryComponentList.push(currentHeader);
        }
    }

    libraryComponentList.sort();

    if (parameterComponentList.length !== 0) {
        parameterComponentList.sort((a, b) => a < b ? 1 : a > b ? -1 : 0);
        headers = [...parameterComponentList, ...libraryComponentList];
    }

    for (const header of headers) {
        const componentsUnderHeader = componentList.filter(component => component.category === header);
        const headerDetails = componentsUnderHeader.map(component => ({
            category: component.category,
            file_path: component.file_path,
            package_name: component.package_name
        }));

        displayHeaderList.push({
            task: header,
            id: displayHeaderList.length + 1,
            components: headerDetails
        });
    }

    return displayHeaderList;
}

export default function Sidebar(props: SidebarProps) {
    const app = props.app
    const factory = props.factory

    const [componentList, setComponentList] = React.useState([]);
    const [category, setCategory] = React.useState([]);
    const [remoteLibList, setRemoteLibList] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [runOnce, setRunOnce] = useState(false);
    const [displayNodesInLibrary, setDisplayNodesInLibrary] = React.useState(() => {
        const initial = localStorage.getItem("displayNodesInLibrary");
        if(initial){
            return JSON.parse(initial);
        }else{
            return true;
        }
    });

    let searchDelay = useRef(null);
    let handleOnChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        if(searchDelay.current != null){
            clearTimeout(searchDelay.current);
        }
        searchDelay.current = setTimeout(() => {
            searchDelay.current = null;
            setSearchTerm(event.target.value);
        }, 150)
    }

    function handleSearchOnClick() {
        setSearchTerm(searchTerm);
    }

    const fetchComponentList = async () => {

        await refreshComponentLibraryConfigCache();

        // get the component list 
        const component_list = await ComponentList();

        // get the header from the components
        const component_library_name = await fetchComponent(component_list);

        // to ensure the component list is empty before setting the component list
        if (component_list.length > 0) {
            setComponentList([]);
            setCategory([]);
        }

        setComponentList(component_list);
        setCategory(component_library_name);

        const libraryConfig = await ComponentLibraryConfig();
        const remoteLibraries = libraryConfig.filter(library => library.status === "remote");
        setRemoteLibList(remoteLibraries);
    }

    useEffect(() => {
        if (!runOnce) {
            fetchComponentList();
            setRunOnce(true);
        }

    }, [category, componentList]);

    function handleRefreshOnClick() {
        refreshComponentListCache();
        fetchComponentList();
    }

    useEffect(() => {
        const refreshComponents = () => {
            handleRefreshOnClick();
        };

        factory.refreshComponentsSignal.connect(refreshComponents);

        const toggleDisplayNodes = () => {
            setDisplayNodesInLibrary((prevState) => {
                const newState = !prevState;
                localStorage.setItem("displayNodesInLibrary", JSON.stringify(newState));
                return newState;
            })
        }
        factory.toggleDisplayNodesInLibrary.connect(toggleDisplayNodes);

        // Return a cleanup function to unsubscribe
        return () => {
            factory.refreshComponentsSignal.disconnect(refreshComponents);
            factory.toggleDisplayNodesInLibrary.disconnect(toggleDisplayNodes);
        };
    }, []);

    
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

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [componentList, searchTerm, {displayNodesInLibrary}])

    const menu = new MenuSvg({ commands: app.commands });
    // Add commands to the menu
    menu.addItem({ command: commandIDs.refreshComponentList });
    menu.addItem({
        command: commandIDs.createNewComponentLibrary,
        args: { componentCode: exampleComponent }
    });
    menu.addItem({ type: "separator" });
    menu.addItem({ command: commandIDs.toggleDisplayNodesInLibrary });

    function showMenu(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
      const bbox = e.currentTarget.getBoundingClientRect();
      menu.open(bbox.x, bbox.bottom);
    }

    function matchesHeader(componentVal, searchTerm){
        return componentVal.task.toLowerCase().includes(searchTerm.toLowerCase());
    }

    function matchesDocString(componentVal, searchTerm){
        return componentVal.docstring && componentVal.docstring.toLowerCase().includes(searchTerm.toLowerCase());
    }

    // Function to map components
    const mapComponents = (components, searchTerm) => {
        let found = components;
        if(searchTerm !== ""){
            found = components.filter((componentVal) => {
                if (searchTerm === "") {
                    return componentVal;
                } else if (matchesHeader(componentVal, searchTerm) || matchesDocString(componentVal, searchTerm)) {
                    return componentVal;
                }
            })
            found.sort((a, b) => {
                const aHeader = matchesHeader(a, searchTerm);
                const bHeader = matchesHeader(b, searchTerm);
                if(aHeader && bHeader){ return 0; }
                if(aHeader){ return -1; }
                if(bHeader){ return 1; }
                return 0;
            })
        }
        return found.map((componentVal, i) => (
            <div key={`component-${i}`}>
                <TrayItemWidget
                    model={{ 
                        type: componentVal.type, 
                        name: componentVal.task,
                        color: componentVal.color,
                        path: componentVal.file_path,
                        docstring: componentVal.docstring,
                        lineNo: componentVal.lineno,
                        variables: componentVal.variables
                    }}
                    name={componentVal.task}
                    color={componentVal.color}
                    app={props.app}
                    path={componentVal.file_path}
                    lineNo={componentVal.lineno}
                    displayNode={displayNodesInLibrary}
                />
            </div>
        ));
    }

    // Function to map categories
    const mapCategories = (categories, components) => {
        return categories.map((libraryName, i) => (
            <AccordionItem key={`category-${i}`}>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        <span>{libraryName["task"]}</span>
                        {libraryName['task'] !== 'GENERAL' && <a
                          title="More actions..."
                          className="button"
                          onClick={(event) => showContextMenu(event, libraryName["task"], "installed")}>
                            <ellipsesIcon.react />
                        </a>}
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    {mapComponents(components.filter(component => component["category"].toString().toUpperCase() === libraryName["task"].toString()), "")}
                </AccordionItemPanel>
            </AccordionItem>
        ));
    }

    const mapRemoteLibraries = () => {
        const sortedRemoteLibList = remoteLibList.sort((a, b) => a.library_id.localeCompare(b.library_id));
    
        return sortedRemoteLibList.map((lib, i) => (
            <AccordionItem key={`remote-lib-${i}`}>
                <AccordionItemHeading>
                    <AccordionItemButton className="accordion__button accordion__button--remote">
                            <span>{lib.library_id}</span>
                            <a className="button"
                               title="More actions..."
                               onClick={(event) => showContextMenu(event, lib.library_id, 'remote')}>
                                <ellipsesIcon.react />
                            </a>
                    </AccordionItemButton>
                </AccordionItemHeading>
            </AccordionItem>
        ));
    };
    
    const [contextMenuState, setContextMenuState] = useState({
        visible: false,
        x: 0,
        y: 0,
        libraryName: null,
        status: 'installed'
    });

    const showContextMenu = (e, libraryName, status) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent context menu from appearing for GENERAL component library
        if (libraryName === 'GENERAL') {
            return;
        }
        
        const rect = e.target.getBoundingClientRect();
        setContextMenuState({
            visible: true,
            x: rect.right,
            y: rect.top,
            libraryName: libraryName,
            status: status
        });
    };

    const closeContextMenu = () => {
        setContextMenuState({ ...contextMenuState, visible: false });
    };

    return (
      <Body>
          <Content>
              <TrayWidget>
                  <div>
                      <div className="sidebar-header">
                          <div className="search-input">
                              <a onClick={handleSearchOnClick} className="search-input__button"><i
                                className="fa fa-search "></i></a>
                              <input type="text" name="" placeholder="SEARCH"
                                     className="search-input__text-input" style={{ width: "75%" }}
                                     onChange={handleOnChange} />
                          </div>
                          <a onClick={showMenu} className="button" title="More actions...">
                              <ellipsesIcon.react />
                          </a>
                      </div>
                      {searchTerm === "" ? (
                        <>
                            <Accordion allowMultipleExpanded={true} allowZeroExpanded={true}>
                                {mapCategories(category, componentList)}
                            </Accordion>

                            <hr style={{ marginTop: "10px", marginBottom: "10px" }} />
                            <h6 style={{ paddingLeft: "10px", margin: "0px", marginBottom: "8px" }}>AVAILABLE FOR
                                INSTALLATION</h6>
                            <Accordion>
                                {mapRemoteLibraries()}
                            </Accordion>
                        </>
                      ) : (
                        <div style={{margin: "10px"}}>
                            {mapComponents(componentList, searchTerm)}
                        </div>
                      )}
                  </div>
              </TrayWidget>
          </Content>
          <TrayContextMenu
            app={app}
            x={contextMenuState.x}
            y={contextMenuState.y}
            visible={contextMenuState.visible}
            libraryName={contextMenuState.libraryName}
            status={contextMenuState.status}
            refreshTrigger={handleRefreshOnClick}
            onClose={closeContextMenu}
          />
          {ReactDOM.createPortal(
              <ReactTooltip id="sidebar-tooltip" type="dark" place="right" effect="solid"
                        delayShow={300}
                        getContent={toolTipStr => {
                            if (toolTipStr) {
                                const model = JSON.parse(toolTipStr).model;
                                if(!model.docstring && displayNodesInLibrary) return null;

                                return <div style={{ maxWidth: "50vw", marginBottom: "20px" }}>
                                    {model.docstring ?
                                      <div dangerouslySetInnerHTML={{ __html: marked(model.docstring) }} /> : null}
                                    {displayNodesInLibrary ? null : <NodePreview model={model} />}
                                </div>;
                            }
                        }}
          />,
            document.body
          )}
      </Body>
    )
};

const exampleComponent = `from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component, dynalist

@xai_component(color='blue')
class ExampleComponent(Component):
    """Brief description of the component.
    
    ##### inPorts:
    - input_port (type): Description of input_port.

    ##### outPorts:
    - output_port (type): Description of output_port.

    """
    input_port: InArg[type]
    output_port: OutArg[type]
    
    def execute(self, ctx) -> None:
        input_port = self.input_port.value
        print(f'The input_port value is {input_port}.')
        self.output_port.value = input_port
`