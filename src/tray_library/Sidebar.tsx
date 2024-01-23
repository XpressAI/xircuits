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

import { XircuitsFactory } from '../XircuitsFactory';
import TrayContextMenu from '../context-menu/TrayContextMenu';

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

    // Function to map components
    const mapComponents = (components, searchTerm) => {
        return components.filter((componentVal) => {
            if (searchTerm === "") {
                return componentVal;
            } else if (componentVal.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                return componentVal;
            }
        }).map((componentVal, i) => (
            <div key={`component-${i}`}>
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
                    lineNo= {componentVal.lineno} />
            </div>
        ));
    }

    // Function to map categories
    const mapCategories = (categories, components) => {
        return categories.map((val, i) => (
            <AccordionItem key={`category-${i}`}>
                <AccordionItemHeading>
                    <AccordionItemButton onContextMenu={(e) => handleRightClick(e, val["task"])}>{val["task"]}</AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    {mapComponents(components.filter(component => component["category"].toString().toUpperCase() === val["task"].toString()), "")}
                </AccordionItemPanel>
            </AccordionItem>
        ));
    }
    
    const [contextMenuState, setContextMenuState] = useState({
        visible: false,
        x: 0,
        y: 0,
        val: null
    });

    const handleRightClick = (e, val) => {
        e.preventDefault();
        const rect = e.target.getBoundingClientRect();
        setContextMenuState({
            visible: true,
            x: rect.right,
            y: rect.top,
            val: val
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
                        <div className="search-input">
                            <input type="text" name="" value={searchTerm} placeholder="SEARCH" className="search-input__text-input" style={{ width: "75%" }} onChange={handleOnChange} />
                            <a onClick={handleSearchOnClick} className="search-input__button"><i className="fa fa-search "></i></a>
                            <a onClick={handleRefreshOnClick} className="search-input__button"><i className="fa fa-refresh "></i></a>
                        </div>

                        {searchTerm === "" ? (
                            <Accordion allowZeroExpanded>
                                {mapCategories(category, componentList)}
                            </Accordion>
                        ) : (
                            mapComponents(componentList, searchTerm)
                        )}
                    </div>
                </TrayWidget>
            </Content>
            <TrayContextMenu
                app={app}
                x={contextMenuState.x}
                y={contextMenuState.y}
                visible={contextMenuState.visible}
                val={contextMenuState.val}
                onClose={closeContextMenu}
            />
        </Body>
    )
};
