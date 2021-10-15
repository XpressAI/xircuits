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
    { task: 'General', id: 1 }
];

const advancedList = [
    { task: 'Advanced', id: 1 }
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



function exportTrayWidget(val: any) {
    let color: any = colorList_adv[0]["task"];

    if (val.task != "" && val.task.toLowerCase().includes("literal")) {
        color = colorList_general[0]["task"];

    } else if (val.id < colorList_adv.length) {
        color = colorList_adv[val.id]["task"];
    } else {
        let index = val.id % colorList_adv.length;
        color = colorList_adv[index]["task"]
    }

    return color;
}

export default function Sidebar(props: SidebarProps) {
    const [componentList, setComponentList] = React.useState([]);

    const [searchTerm, setSearchTerm] = useState('');

    const fetchComponentList = async () => {
        const response = await ComponentList(props.lab.serviceManager, props.basePath);
        if (response.length > 0) {
            setComponentList([]);
        }
        setComponentList(response);
    }

    let handleOnChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearchTerm("");
        setSearchTerm(event.target.value);
    }

    function handleOnClick() {
        setSearchTerm("");
        setSearchTerm(searchTerm);
    }

    useEffect(() => {
        fetchComponentList();
    }, []);

    return (
        <Body>
            <Content>
                <TrayWidget>
                    <div>
                        <div className="search">
                            <input type="text" name="" value={searchTerm} placeholder="SEARCH" className="text" style={{ width: "80%" }} onChange={handleOnChange} />
                            <a onClick={handleOnClick} className="btn"><i className="fa fa-search "></i></a>
                        </div>
                        <Accordion allowZeroExpanded>
                            {
                                headerList.filter((val) => {
                                    if (searchTerm == "") {
                                        return val
                                    }
                                }).map((val, i) => {
                                    return (
                                        <AccordionItem key={headerList[0]["task"].toString()}>
                                            <AccordionItemHeading>
                                                <AccordionItemButton>{val.task}</AccordionItemButton>
                                            </AccordionItemHeading>
                                            <AccordionItemPanel>
                                                {
                                                    componentList.filter((val) => {
                                                        if (searchTerm == "") {
                                                            return val
                                                        }
                                                    }).map((val, i) => {
                                                        if (val.header == "GENERAL") {
                                                            return (
                                                                <div key={`index-1-${i}`}>
                                                                    <TrayItemWidget
                                                                        model={{ type: val.type, name: val.task }}
                                                                        name={val.task}
                                                                        color={val.color}
                                                                        app={props.lab}
                                                                        path={val.path} />
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

                            {
                                advancedList.filter((val) => {
                                    if (searchTerm == "") {
                                        return val
                                    }
                                }).map((val, i) => {
                                    return (
                                        <AccordionItem key={advancedList[0]["task"].toString()}>
                                            <AccordionItemHeading>
                                                <AccordionItemButton>{val.task}</AccordionItemButton>
                                            </AccordionItemHeading>
                                            <AccordionItemPanel>
                                                {
                                                    componentList.filter((val) => {
                                                        if (searchTerm == "") {
                                                            return val
                                                        }
                                                    }).map((val, i) => {
                                                        if (val.header == "ADVANCED") {
                                                            return (
                                                                <div key={`index-2-${i}`}>
                                                                    <TrayItemWidget
                                                                        model={{ type: val.type, name: val.task }}
                                                                        name={val.task}
                                                                        color={val.color}
                                                                        app={props.lab}
                                                                        path={val.path} />
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
