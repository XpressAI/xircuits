import Autocomplete from '@material-ui/lab/Autocomplete';
import ComponentList from './Component';
import Divider from '@material-ui/core/Divider';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import styled from '@emotion/styled';
import { Accordion, AccordionSummary, makeStyles, Typography } from '@material-ui/core';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { TrayItemWidget } from './TrayItemWidget';
import { TrayWidget } from './TrayWidget';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        height: 5,
        color: "rgb(255,255,255)"
    },
    heading: {
        fontSize: theme.typography.pxToRem(14)
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(14),
        color: theme.palette.text.secondary
    },
    icon: {
        verticalAlign: 'bottom',
        height: 5,
        width: 5
    },
    details: {
        alignItems: 'center'
    },
    column: {
        flexBasis: '40%'
    },
    helper: {
        borderLeft: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(0, 1)
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline'
        }
    }
}));

export const Body = styled.div`
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  min-height: 100%;
  background-color:black;
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
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useState('');

    const fetchComponentList = async () => {
        const response = await ComponentList(props.lab, props.basePath);
        if (response.length > 0) {
            setComponentList([]);
        }
        setComponentList(response);
    }

    useEffect(() => {
        fetchComponentList();
    }, []);


    // ComponentList(props.lab, props.basePath).then((e) => {
    //     componentList = [...e];
    // });
    return (
        <Body>
            <Content>
                <TrayWidget>
                    <div style={{}} className="test2">
                        <Autocomplete
                            id="xpipe_search_bar"
                            freeSolo
                            options={componentList.map((option) => option.task)}
                            onInputChange={(event, newInputValue) => {
                                setSearchTerm(newInputValue);
                            }}
                            renderInput={
                                params => (
                                    <TextField
                                        {...params}
                                        label="Search.."
                                        margin="normal"
                                        variant="outlined"
                                        onChange={event => {
                                            if (searchTerm != event.target.value) {
                                                setSearchTerm(event.target.value);
                                            }
                                        }}
                                    />
                                )}
                        />
                    </div>
                    <div>
                        <Accordion>
                            {
                                headerList.filter((val) => {
                                    if (searchTerm == "") {
                                        return val
                                    } else if (val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return val
                                    }
                                }).map((val, i) => {
                                    return (
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1c-content"
                                            id="panel-xpipe-1"
                                            key={headerList[0]["task"].toString()}
                                        >
                                            <div className={classes.column} key={`index-${i}`}>
                                                <Typography className={classes.secondaryHeading}>
                                                    {val.task}
                                                </Typography>
                                            </div>
                                        </AccordionSummary>
                                    );
                                })
                            }

                            {
                                componentList.filter((val) => {
                                    debugger;
                                    if (searchTerm == "") {
                                        return val
                                    } else if (val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return val
                                    }
                                }).map((val, i) => {
                                    if (val.header == "GENERAL") {
                                        let color = exportTrayWidget(val);
                                        return (
                                            <div key={val.id}>
                                                <TrayItemWidget
                                                    model={{ type: val.type, name: val.task }}
                                                    name={val.task}
                                                    color={color}
                                                    app={props.lab}
                                                    path={val.path} />
                                            </div>
                                        );
                                    }
                                })
                            }
                            <Divider />
                        </Accordion>
                        <Accordion>
                            {
                                advancedList.filter((val) => {
                                    if (searchTerm == "") {
                                        return val
                                    } else if (val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return val
                                    }
                                }).map((val, i) => {
                                    return (
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1c-content"
                                            id="panel-xpipe-1"
                                            key={headerList[0]["task"].toString()}
                                        >
                                            <div className={classes.column} key={`index-${i}`}>
                                                <Typography className={classes.secondaryHeading}>
                                                    {val.task}
                                                </Typography>
                                            </div>
                                        </AccordionSummary>
                                    );
                                })
                            }

                            {
                                componentList.filter((val) => {
                                    debugger;
                                    if (searchTerm == "") {
                                        return val
                                    } else if (val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return val
                                    }
                                }).map((val, i) => {
                                    if (val.header == "ADVANCED") {
                                        let color = exportTrayWidget(val);
                                        return (
                                            <div key={val.id}>
                                                <TrayItemWidget
                                                    model={{ type: val.type, name: val.task }}
                                                    name={val.task}
                                                    color={color}
                                                    app={props.lab}
                                                    path={val.path} />
                                            </div>
                                        );
                                    }
                                })
                            }
                            <Divider />
                        </Accordion>
                    </div>
                </TrayWidget>
            </Content>
        </Body>
    )
};
