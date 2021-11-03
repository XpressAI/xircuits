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
    basePath: string;
}

async function fetcComponent(componentList: string[]) {
    let component_root = componentList.map(x => x["rootFile"]);

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
    const [rootFile, setRootFile] = React.useState([]);
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
        const response_1 = await ComponentList(props.lab.serviceManager, props.basePath);
        const response_2 = await fetcComponent(response_1);

        if (response_1.length > 0) {
            setComponentList([]);
            setRootFile([]);
        }

        setComponentList(response_1);
        setRootFile(response_2);
    }

    useEffect(() => {
        if (!runOnce) {
            fetchComponentList();
            setRunOnce(true);
        }

    }, [rootFile, componentList]);

    function handleRefreshOnClick() {
        fetchComponentList();
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchComponentList();
        }, 600000); // 10 minutes
        return () => clearInterval(intervalId);
    }, [rootFile, componentList]);

    return (
        <Body>
            <Content>
                <TrayWidget>
                    <div>
                        <div className="search-input">
                            <input type="text" name="" value={searchTerm} placeholder="SEARCH" className="search-input__text-input" style={{ width: "80%" }} onChange={handleOnChange} />
                            <a onClick={handleSearchOnClick} className="search-input__button"><i className="fa fa-search "></i></a>
                            <a onClick={handleRefreshOnClick} className="search-input__button"><i className="fa fa-refresh "></i></a>
                        </div>

                        <Accordion allowZeroExpanded>
                            {
                                rootFile.filter((val) => {
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
                                                        if (componentVal["rootFile"].toString().toUpperCase() == val["task"].toString()) {
                                                            return (
                                                                <div key={`index-1-${i2}`}>
                                                                    <TrayItemWidget
                                                                        model={{
                                                                            type: componentVal.type,
                                                                            name: componentVal.task
                                                                        }}
                                                                        name={componentVal.task}
                                                                        color={componentVal.color}
                                                                        app={props.lab}
                                                                        path={componentVal.path} />
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
                                            model={{ type: val.type, name: val.task }}
                                            name={val.task}
                                            color={val.color}
                                            app={props.lab}
                                            path={val.path} />
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
