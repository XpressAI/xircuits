import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { JupyterFrontEnd } from '@jupyterlab/application';

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel
} from "react-accessible-accordion";

import { DefaultLinkModel, DiagramEngine } from '@projectstorm/react-diagrams';
import { TrayPanel } from './TrayPanel';
import { TrayItemPanel } from './TrayItemPanel';
import { ComponentList } from '../tray_library/Component';

export const Body = styled.div`
  display: flex;
  flex-wrap: wrap;
  background-color: black;
  height: 270px;
  border-top: 10px;
  border-radius: 12px;
  overflow-y: auto;
`;

export const Content = styled.div`
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    max-height: auto;
    'border-top': '4px solid #dfe2e5'
`;

export interface ComponentsPanelProps {
    lab: JupyterFrontEnd;
    eng?: DiagramEngine;
    nodePosition?: {x: number, y: number};
    linkData?: DefaultLinkModel;
    isParameter?: boolean;
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

function fetchAllowableComponents(props: ComponentsPanelProps, componentList: string[], headerList: string[]) {
    let allowComponentList: any[] = [];
    let allowHeaderList: any[] = [];

    // Get allowable components
    componentList.map((val) => {
        if (props.linkData != null) {
            if (props.isParameter == true) {
                // Only allow GENERAL components for parameter inPort
                if (val["category"].toString() == "GENERAL") {
                    allowComponentList.push(val);
                }
            }
            // Only allow ADVANCED components for '▶' port
            else if (val["category"].toString() != "GENERAL") {
                allowComponentList.push(val);
            }
        }
        // Allow all Components when right-clicking
        else {
            allowComponentList.push(val);
        }
    })

    // Get allowable components's header
    headerList.map((val) => {
        if (props.linkData != null) {
            if (props.isParameter == true) {
                // Only allow GENERAL components for parameter inPort
                if (val["task"].toString() == "GENERAL") {
                    allowHeaderList.push(val);
                }
            }
            // Only allow ADVANCED components for '▶' port
            else if (val["task"].toString() != "GENERAL") {
                allowHeaderList.push(val);
            }
        }
        // Allow all Components when right-clicking
        else {
            allowHeaderList.push(val);
        }
    })
    return { allowComponentList, allowHeaderList };
}

export default function ComponentsPanel(props: ComponentsPanelProps) {
    const [componentList, setComponentList] = React.useState([]);
    const [category, setCategory] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [allowableComponents, setAllowableComponents] = useState([]);

    let handleOnChange = (event) => {
        setSearchTerm("");
        setSearchTerm(event.target.value);
    }

    const fetchComponentList = async () => {
        // get the component list
        const response_1 = await ComponentList();

        // get the header from the components
        const response_2 = await fetchComponent(response_1);

        const response_3 = await fetchAllowableComponents(props, response_1, response_2)

        // to ensure the component list is empty before setting the component list
        if (response_1.length > 0) {
            setAllowableComponents([]);
            setComponentList([]);
            setCategory([]);
        }

        setComponentList(response_1);
        setCategory(response_3.allowHeaderList);
        setAllowableComponents(response_3.allowComponentList);
    }

    useEffect(() => {
        fetchComponentList();
    }, []);

    function focusInput() {
        document.getElementById("add-component-input").focus();
    }

    return (
        <Body>
            <Content onBlur={focusInput}>
                <TrayPanel>
                    <div>
                        <p className='title-panel'>Add Component</p>
                        <div className="search-input-panel" >
                            <input
                                    id="add-component-input"
                                    type="text"
                                    name=""
                                    value={searchTerm}
                                    placeholder="SEARCH"
                                    className="search-input__text-input-panel"
                                    autoFocus
                                    onChange={handleOnChange}
                                    onKeyDown={(event) => {
                                        if (event.key !== 'Escape') { // allow Escape for it to be dismissed on the XircuitsBodyWidget level.
                                            event.stopPropagation();
                                        }
                                    }}
                                />
                        </div>
                        {
                            allowableComponents.filter((val) => {
                                if (searchTerm != "" && (val.task.toLowerCase().includes(searchTerm.toLowerCase()) || (val.docstring && val.docstring.toLowerCase().includes(searchTerm.toLowerCase())))) {
                                    return val
                                }
                            }).map((val, i) => {
                                return (
                                    <div key={`index-3-${i}`} className="tray-search">
                                        <TrayItemPanel
                                            currentNode={val}
                                            app={props.lab}
                                            eng={props.eng}
                                            nodePosition={props.nodePosition}
                                            linkData={props.linkData}
                                            isParameter={props.isParameter}
                                        />
                                    </div>
                                );
                            })
                        }
                    </div>
                    <Accordion allowZeroExpanded>
                        {
                            category.filter((val) => {
                                if (searchTerm == "") {
                                    return val;
                                }
                            }).map((val) => {
                                return (
                                    <AccordionItem key={`index-1-${val["task"].toString()}`} className='accordion__item_panel'>
                                        <AccordionItemHeading >
                                            <AccordionItemButton className='accordion__button_panel'>{val["task"]}</AccordionItemButton>
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
                                                                <TrayItemPanel
                                                                    currentNode={componentVal}
                                                                    app={props.lab}
                                                                    eng={props.eng}
                                                                    nodePosition={props.nodePosition}
                                                                    linkData={props.linkData}
                                                                    isParameter={props.isParameter}
                                                                />
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
                </TrayPanel>
            </Content>
        </Body>
    )
};