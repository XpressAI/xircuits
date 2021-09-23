
import { Accordion, AccordionSummary, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import { TrayItemWidget } from './TrayItemWidget';
import styled from '@emotion/styled';
import { TrayWidget } from './TrayWidget';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

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
    max-height:auto;
    'border-top': '4px solid #dfe2e5'
`;

const componentList = [
    { task: 'Read Data Set', id: 1 },
    { task: 'Augment Image Data', id: 2 },
    { task: 'Train/Test Split', id: 3 },
    { task: 'Train Face Detector', id: 4 },
    { task: 'Train Object Detector', id: 5 },
    { task: 'Evaluate mAP', id: 6 },
    { task: "Run Notebook", id: 7 },
    { task: "If", id: 8 },
    { task: "Math Operation", id: 9 },
    { task: "Convert to Aurora", id: 10 },
    { task: "Get Hyper-parameter String Value", id: 11 },
    { task: "Get Hyper-parameter Int Value", id: 12 },
    { task: "Get Hyper-parameter Float Value", id: 13 },
    { task: "Create Object Detector Model", id: 14 },
    { task: "Debug Image", id: 15 },
    { task: "Reached Target Accuracy", id: 16 },
    { task: "Literal True", id: 17 },
    { task: "Literal False", id: 18 }
];

const headerList = [
    { task: 'General', id: 1 }
];


export default function Sidebar() {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <Body>
            <Content>
                <TrayWidget>
                    <div style={{}} className="test2">

                        <Autocomplete
                            id="accordion_search_bar"
                            freeSolo
                            options={componentList.map(option => option.task)}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label="Search.."
                                    margin="normal"
                                    variant="outlined"
                                    onFocus={event => {
                                        setSearchTerm(event.target.value);
                                    }}
                                    onChange={event => {
                                        if (searchTerm != event.target.value) {
                                            setSearchTerm(event.target.value);
                                        }
                                    }}
                                    onBlur={event => {
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
                                }).map((val) => {
                                    return (
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1c-content"
                                            id="panel1c-header"
                                        >
                                            <div className={classes.column}>
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
                                    if (searchTerm == "") {
                                        return val
                                    } else if (val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return val
                                    }
                                }).map((val) => {
                                    if (val.id == 1) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'in', name: 'Read Data Set' }} name="Read Data Set" color="rgb(192,255,0)" />
                                            </div>
                                        );
                                    } else if (val.id == 2) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'out', name: 'Augment Image Data' }} name="Argument Image Data" color="rgb(0,102,204)" />
                                            </div>
                                        );
                                    } else if (val.id == 3) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'split', name: 'Train/Test Split' }} name="Train/Test Split" color="rgb(255,153,102)" />
                                            </div>
                                        );
                                    } else if (val.id == 4) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'train', name: 'Train Face Detector' }} name="Train Face Detector" color="rgb(255,102,102)" />
                                            </div>
                                        );
                                    } else if (val.id == 5) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'train', name: 'Train Object Detector' }} name="Train Object Detector" color="rgb(15,255,255)" />
                                            </div>
                                        );
                                    } else if (val.id == 6) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'eval', name: 'Evaluate mAP' }} name="Evaluate mAP" color="rgb(255,204,204)" />
                                            </div>
                                        );
                                    } else if (val.id == 7) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'runnb', name: 'Run Notebook' }} name="Run Notebook" color="rgb(153,204,51)" />
                                            </div>
                                        );
                                    } else if (val.id == 8) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'if', name: 'If' }} name="If" color="rgb(255,153,0)" />
                                            </div>
                                        );
                                    } else if (val.id == 9) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'math', name: 'Math Operation' }} name="Math Operation" color="rgb(255,204,0)" />
                                            </div>
                                        );
                                    } else if (val.id == 10) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'convert', name: 'Convert to Aurora' }} name="Convert to Aurora" color="rgb(204,204,204)" />
                                            </div>
                                        );
                                    } else if (val.id == 11) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'string', name: 'Get Hyper-parameter String Value' }} name="Get Hyper-parameter String Value" color="rgb(153,204,204)" />
                                            </div>
                                        );
                                    } else if (val.id == 12) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'int', name: 'Get Hyper-parameter Int Value' }} name="Get Hyper-parameter Int Value" color="rgb(153,0,102)" />
                                            </div>
                                        );
                                    } else if (val.id == 13) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'float', name: 'Get Hyper-parameter Float Value' }} name="Get Hyper-parameter Float Value" color="rgb(102,51,102)" />
                                            </div>
                                        );
                                    } else if (val.id == 14) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'model', name: 'Create Object Detector Model' }} name="Create Object Detector Model" color="rgb(102,102,102)" />
                                            </div>
                                        );
                                    } else if (val.id == 15) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'debug', name: 'Debug Image' }} name="Debug Image" color="rgb(255,102,0)" />
                                            </div>
                                        );
                                    } else if (val.id == 16) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'enough', name: 'Reached Target Accuracy' }} name="Reached Target Accuracy" color="rgb(51,51,51)" />
                                            </div>
                                        );
                                    } else if (val.id == 17) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'literal', name: 'Literal True' }} name="Literal True" color="rgb(21,21,51)" />
                                            </div>
                                        );
                                    } else if (val.id == 18) {
                                        return (
                                            <div>
                                                <TrayItemWidget model={{ type: 'literal', name: 'Literal False' }} name="Literal False" color="rgb(21,21,51)" />
                                            </div>
                                        )
                                    }
                                })
                            }
                            <Divider /></Accordion></div>
                </TrayWidget>
            </Content>
        </Body>

    )
};
