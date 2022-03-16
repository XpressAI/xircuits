import ComponentList from '../tray_library/Component';

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

import { requestAPI } from '../server/handler';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { TrayPanel } from './TrayPanel';
import { TrayItemPanel } from './TrayItemPanel';

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

export interface ComponentsPanelProps {
    lab: JupyterFrontEnd;
    eng?: DiagramEngine;
    nodePosition?: any;
    linkData?: any;
    isParameter?: any;
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

export default function ComponentsPanel(props: ComponentsPanelProps) {
    const [componentList, setComponentList] = React.useState([]);
    const [category, setCategory] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [runOnce, setRunOnce] = useState(false);

    let handleOnChange = (event) => {
        setSearchTerm("");
        setSearchTerm(event.target.value);
    }

    function handleSearchOnClick() {
        setSearchTerm("");
        setSearchTerm(searchTerm);
    }

    async function getConfig(request: string) {
        const dataToSend = { "config_request": request };

        try {
            const server_reply = await requestAPI<any>('get/config', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });

            return server_reply;
        } catch (reason) {
            console.error(
                `Error on POST get/config ${dataToSend}.\n${reason}`
            );
        }
    };

    const fetchComponentList = async () => {
          // get the component list by sending the jupyterlab frontend and base path
        const response_1 = await ComponentList(props.lab.serviceManager);

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

    const consLog = (e) => {
        console.log(e)
    }

    return (
        <Body>
            <Content>
                <TrayPanel>
                        <p className='title-panel'>Add Component</p>
                        <div className="search-input-panel" >
                            <input id='add-component-input' type="text" name="" value={searchTerm} placeholder="SEARCH" className="search-input__text-input-panel" autoFocus onChange={handleOnChange} />
                        </div>
                        {
                            componentList.filter((val) => {
                                if (searchTerm != "" && val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                    return val
                                }
                            }).map((val, i) => {
                                return (
                                    <div key={`index-3-${i}`} className="tray-search">
                                        <TrayItemPanel
                                            model={{ type: val.type, name: val.task }}
                                            name={val.task}
                                            color={val.color}
                                            app={props.lab}
                                            path={val.file_path}
                                            eng={props.eng}
                                            componentList={componentList}
                                            nodePosition={props.nodePosition}
                                            linkData={props.linkData}
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
                                }).map((val, i) => {
                                if (props.linkData != null) {
                                    if (props.isParameter == true) {
                                        // Only allow GENERAL component for parameter inPort
                                        if (val["task"].toString() == "GENERAL") {
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
                                                                        model={{
                                                                            type: componentVal.type,
                                                                            name: componentVal.task
                                                                        }}
                                                                        name={componentVal.task}
                                                                        color={componentVal.color}
                                                                        app={props.lab}
                                                                        path={componentVal.file_path}
                                                                        eng={props.eng}
                                                                                componentList={componentList}
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
                                        }
                                    }
                                    // Except GENERAL component for '▶' port
                                    else if (val["task"].toString() != "GENERAL") {
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
                                                                            model={{
                                                                                type: componentVal.type,
                                                                                name: componentVal.task
                                                                            }}
                                                                            name={componentVal.task}
                                                                            color={componentVal.color}
                                                                            app={props.lab}
                                                                            path={componentVal.file_path}
                                                                            eng={props.eng}
                                                                            componentList={componentList}
                                                                            nodePosition={props.nodePosition}
                                                                            linkData={props.linkData}
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                })
                            }
                                                </AccordionItemPanel>
                                            </AccordionItem>
                                        );
                                    }
                                }
                                // Allow all Components when right-clicking
                                else {
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
                                                                        model={{
                                                                            type: componentVal.type,
                                                                            name: componentVal.task
                                                                        }}
                                                                        name={componentVal.task}
                                                                        color={componentVal.color}
                                            app={props.lab}
                                                                        path={componentVal.file_path}
                                            eng={props.eng}
                                                                        componentList={componentList}
                                                                        nodePosition={props.nodePosition}
                                                                        linkData={props.linkData}
                                            />
                                    </div>
                                );
                                                        }
                            })
                        }
                                            </AccordionItemPanel>
                                        </AccordionItem>
                                    );
                                }
                            })
                        }
                    </Accordion>
                </TrayPanel>
            </Content>
        </Body>
    )
};