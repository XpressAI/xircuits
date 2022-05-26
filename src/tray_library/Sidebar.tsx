import ComponentList from './Component';

import React, { useEffect, useState } from 'react';

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
import { XircuitFactory } from '../xircuitFactory';

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
    lab: JupyterFrontEnd;
    factory: XircuitFactory;
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
                                                <AccordionItemButton>{val["task"]}</AccordionItemButton>
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
                                                                        app={props.lab}
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
                                            app={props.lab}
                                            path={val.file_path}
                                            lineNo= {val.lineno} />
                                    </div>
                                );
                            })
                        }
                    </div>
                </TrayWidget>
            </Content>
        </Body>
    )
};
