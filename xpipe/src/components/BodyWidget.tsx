import React, { FC, useState, useCallback, useEffect } from 'react';
import * as NumericInput from "react-numeric-input";
import { Application } from '../Application';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from '../helpers/DemoCanvasWidget';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { LinkModel } from '@projectstorm/react-diagrams';
import { NodeModel } from "@projectstorm/react-diagrams-core/src/entities/node/NodeModel";
import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';


import styled from '@emotion/styled';

import { CustomNodeModel } from "./CustomNodeModel";

export interface BodyWidgetProps {
	app: Application;
}


export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
		height: 800px;
	`;

export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;

export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;


//create your forceUpdate hook
function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}


export const BodyWidget: FC<BodyWidgetProps> = ({ app }) => {

    const [prevState, updateState] = useState(0);
    const forceUpdate = useCallback(() => updateState(prevState => prevState + 1), []);
    const [saved, setSaved] = useState(false);
    const [compiled, setCompiled] = useState(false);
	const [displaySavedAndCompiled, setDisplaySavedAndCompiled] = useState(false);
	const [displayDebug, setDisplayDebug] = useState(false);
	const [displayHyperparameter, setDisplayHyperparameter] = useState(false);
	const [stringNodes, setStringNodes] = useState<string[]>(["name"]);
	const [intNodes, setIntNodes] = useState<string[]>([]);
	const [floatNodes, setFloatNodes] = useState<string[]>([]);
	const [boolNodes, setBoolNodes] = useState<string[]>([]);
	const [stringNodesValue, setStringNodesValue] = useState<string[]>([""]);
	const [intNodesValue, setIntNodesValue] = useState<number[]>([0]);
	const [floatNodesValue, setFloatNodesValue] = useState<number[]>([0.00]);
	const [boolNodesValue, setBoolNodesValue] = useState<boolean[]>([false]);
	const [engine, setEngine] = useState(null)

	// useEffect(() => {
	//   const engine = app.getDiagramEngine();
	//   /*  operations with engine */
	//   setEngine(engine);
	// }, [])


	const getTargetNodeModelId = (linkModels: LinkModel[], sourceId: string): string | null => {

		for (let i = 0; i < linkModels.length; i++) {
			let linkModel = linkModels[i];

			if (linkModel.getSourcePort().getNode().getID() === sourceId) {
				return linkModel.getTargetPort().getNode().getID();
			}
		}
		return null;
	}

	const getNodeModelByName = (nodeModels: any[], name: string): NodeModel | null => {
		for (let i = 0; i < nodeModels.length; i++) {
			let nodeModel = nodeModels[i];

			if (nodeModel.getOptions()["name"] === name) {
				return nodeModel;
			}
		}
		return null;
	}

	const getNodeModelById = (nodeModels: any[], id: string): NodeModel | null => {
		for (let i = 0; i < nodeModels.length; i++) {
			let nodeModel = nodeModels[i];

			if (nodeModel.getID() === id) {
				return nodeModel;
			}
		}
		return null;
	}

	const getAllNodesFromStartToFinish = (): NodeModel[] | null => {

		let model = app.getDiagramEngine().getModel();
		let nodeModels = model.getNodes();
		let startNodeModel = getNodeModelByName(nodeModels, 'Start');

		if (startNodeModel) {
			let sourceNodeModelId = startNodeModel.getID();
			let retNodeModels: NodeModel[] = new Array();
			retNodeModels.push(startNodeModel);

			while (getTargetNodeModelId(model.getLinks(), sourceNodeModelId) != null) {
				let getTargetNode = getTargetNodeModelId(model.getLinks(), sourceNodeModelId)

				if (getTargetNode) {
					let nodeModel = getNodeModelById(nodeModels, getTargetNode);

					if (nodeModel) {
						retNodeModels.push(nodeModel)
					}
				}

			}
			return retNodeModels;
		}

		return null;
	}

	const handleSaveClick = () => {
	    alert("Saved.")
	    setSaved(true);
	}

	const handleCompileClick = () => {
	    alert("Compiled.")
	    setCompiled(true);
	}

    const handleUnsaved = () => {

        onHide('displaySavedAndCompiled');
        handleSaveClick();
        handleCompileClick();
    }

	const handleRunClick = () => {
		let nodesCount = app.getDiagramEngine().getModel().getNodes().length;

		console.log(app.getDiagramEngine().getModel().getNodes());
		console.log("node count: ", nodesCount)
            for (let i = 0; i < nodesCount; i++) {
                let nodeName = app.getDiagramEngine().getModel().getNodes()[i].getOptions()["name"];
                if (nodeName.startsWith("Hyperparameter")){
                    let regEx = /\(([^)]+)\)/;
                    let result = nodeName.match(regEx);
                    let nodeText = nodeName.split(": ");
                    if(result[1] == 'String'){
                        setStringNodes(stringNodes => ([...stringNodes, nodeText[nodeText.length - 1]].sort()));
                    }
                    else if(result[1] == 'Int'){
                        setIntNodes(intNodes => ([...intNodes, nodeText[nodeText.length - 1]].sort()));
                    }
                    else if(result[1] == 'Float'){
                        setFloatNodes(floatNodes => ([...floatNodes, nodeText[nodeText.length - 1]].sort()));
                    }
                    else if(result[1] == 'Boolean'){
                        setBoolNodes(boolNodes => ([...boolNodes, nodeText[nodeText.length - 1]].sort()));
                    }
                }
            }

        if(compiled && saved){
		    onClick('displayHyperparameter');
        }
        else{
		    onClick('displaySavedAndCompiled');
        }
	}

	const handleStringChange = (e, i) => {
	    let newStringNodeValue = [...stringNodesValue];
	    newStringNodeValue[i] = e.target.value;
	    setStringNodesValue(newStringNodeValue);
	    console.log("String change: ", stringNodesValue)
	}

	const handleBoolChange = (e, i) => {
	    let newBoolNodeValue = [...boolNodesValue];
	    newBoolNodeValue[i] = e.target.value;
	    setBoolNodesValue(newBoolNodeValue);
	    console.log("Boolean change: ", boolNodesValue)
	}

	const handleIntSpinnerChange = (e, i) => {
	    let newIntNodeValue = [...intNodesValue];
	    newIntNodeValue[i] = e;
	    setIntNodesValue(newIntNodeValue);
	    console.log("Integer change: ", intNodesValue)
	}

	const handleFloatSpinnerChange = (e, i) => {
	    let newFloatNodeValue = [...floatNodesValue];
	    newFloatNodeValue[i] = e;
	    setFloatNodesValue(newFloatNodeValue);
	    console.log("Float change: ", floatNodesValue)
	}

	const handleDebugClick = () => {

        if(compiled && saved){
		    onClick('displayDebug');
        }
        else{
		    onClick('displaySavedAndCompiled');
        }
	}

    const handleToggleBreakpoint = () => {

        app.getDiagramEngine().getModel().getNodes().forEach((item) => {
            if (item.getOptions()["selected"] == true){
                let name = item.getOptions()["name"]
                console.log(name)
                if (name.startsWith("🔴")){
                    item.getOptions()["name"] = name.split("🔴")[1]
                }
                else{
                    item.getOptions()["name"] = "🔴" + name
                }
                item.setSelected(true);
                item.setSelected(false);
            }

		});
    }

	const handleStart = () => {
        let stringNode = stringNodes.map(function(x){
            x = x.replace(" ","_");
            return x.toLowerCase();
        });
	    let stringValue = stringNodesValue;
        let floatNode = floatNodes.map(function(x){
            x = x.replace(" ","_");
            return x.toLowerCase();
        });
	    let floatNodeValue = floatNodesValue;
        let intNode = intNodes.map(function(x){
            x = x.replace(" ","_");
            return x.toLowerCase();
        });
	    let intNodeValue = intNodesValue;
        let boolNode = boolNodes.map(function(x){
            x = x.replace(" ","_");
            return x.toLowerCase();
        });
	    let boolNodeValue = boolNodesValue;

        var result = {};
        stringNode.forEach((key, i) => result[key] = stringValue[i]);
        floatNode.forEach((key, i) => result[key] = floatNodeValue[i]);
        intNode.forEach((key, i) => result[key] = intNodeValue[i]);
        boolNode.forEach((key, i) => result[key] = boolNodeValue[i]);

	    let commandStr = JSON.stringify(result);
		console.log(stringNodes);
		console.log(commandStr);

		setStringNodesValue([]);
		setIntNodesValue([]);
		setFloatNodesValue([]);
		setBoolNodesValue([]);
		onHide('displayHyperparameter');
    }

	const dialogFuncMap = {
		'displayDebug': setDisplayDebug,
		'displayHyperparameter': setDisplayHyperparameter,
		'displaySavedAndCompiled': setDisplaySavedAndCompiled
	}

	const onClick = (name: string) => {
		dialogFuncMap[`${name}`](true);
	}

	const onHide = (name: string) => {
		dialogFuncMap[`${name}`](false);
		if (name == "displayHyperparameter"){
		    setStringNodes(["name"]);
		    setIntNodes([]);
		    setFloatNodes([]);
		    setBoolNodes([]);
		}
	}

	const renderFooter = () => {
		return (
			<div>
			    <Button label="Saving & Compiling" icon="pi pi-check" onClick={handleUnsaved} />
                <Button label="Cancel" icon="pi pi-times" onClick={() => onHide('displaySavedAndCompiled')} />
            </div>
		);
	}

	const renderHyperparameterFooter = () => {
		return (
			<div>
				<Button label="Start" icon="pi pi-check" onClick={handleStart} className="p-button-text" />
				<Button label="Cancel" icon="pi pi-times" onClick={() => onHide('displayHyperparameter')} autoFocus />
			</div>
		);
	}

	const renderDebugFooter = () => {
		return (
    	    <div>
                <Button label="Quit Debugging" icon="pi pi-times" onClick={() => onHide('displayDebug')} />
            </div>
		);
	}

	return (
		<Body>
			{/* <Header>
				<div className="title">Sample Project | Main Workflow ▽</div>
				<span className='diagram-header-span'>
					<button className='diagram-header-button' onClick={handleSaveClick} >Save</button>
					<button className='diagram-header-button' onClick={handleCompileClick} >Compile</button>
					<Dialog header="Save & Compile?" visible={displaySavedAndCompiled} modal style={{ width: '350px' }} footer={renderFooter()} onHide={() => onHide('displaySavedAndCompiled')}>
                        <div className="p-fluid" style={{display: 'flex', alignItems: 'center'}}>
                            <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', marginRight:'1rem' }} />
                            <span>You must Save & Compile before running and debugging.</span>
                        </div>
                    </Dialog>
					<button className='diagram-header-button' onClick={handleRunClick} >Run</button>
					<Dialog header="Run" visible={displayHyperparameter} maximizable modal style={{ width: '50vw' }} footer={renderHyperparameterFooter()} onHide={() => onHide('displayHyperparameter')}>
						<div>
							<div className="p-grid p-fluid">
                    		    <h3 style={{marginTop: 0, marginLeft: '8px', marginBottom: 0}}>Hyperparameter:</h3>
                    		    <div className="p-col-12" ><h4 style={{marginTop: 0, marginBottom: 0}}>String</h4></div>
                    		    {stringNodes.map((stringNode, i) =>
                    		    <div className="p-col-12" key={`index-${i}`}>{stringNode}
                    		        <div>
                    		        <InputText style={{ width: '10vw' }} value={ stringNodesValue[i] || '' } onChange={(e) => handleStringChange(e, i)}/>
                    		        </div>
                    		    </div>)}
                    		    <div className="p-col-12">
                    		        {
                    		            boolNodes.length != 0 ?
                                        <h4 style={{marginTop: 0, marginBottom: 0}}>Boolean</h4> : null
                    		        }
                    		    </div>
                    		    {boolNodes.map((boolNode, i) =>
                                <div className="p-col-4 p-fluid" key={`index-${i}`}>{boolNode}
                                    <div>
                                    <InputSwitch checked={boolNodesValue[i] || false} onChange={(e) => handleBoolChange(e, i)} />
                                    </div>
                                </div>)}
                                <div className="p-col-12">
                                    {
                                        intNodes.length != 0 ?
                                        <h4 style={{marginTop: 0, marginBottom: 0}}>Integer</h4> : null
                                    }
                    		    </div>
                    		    {intNodes.map((intNode, i) =>
                                <div className="p-col-12" key={`index-${i}`}>{intNode}
                                    <div>
                                    <NumericInput
                                        className="form-control"
                                        min={0}
                                        step={1}
                                        precision={0}
                                        mobile={true}
                                        value={intNodesValue[i] || 0 }
                                        onChange={(e) => handleIntSpinnerChange(e, i)}
                                        style={{
                                            wrap: {
                                                boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
                                                padding: '2px 2.26ex 2px 2px',
                                                borderRadius: '6px 3px 3px 6px',
                                                fontSize: 20,
                                                width: '20vw'
                                            },
                                            input: {
                                                borderRadius: '6px 3px 3px 6px',
                                                padding: '0.1ex 1ex',
                                                border: '#ccc',
                                                marginRight: 4,
                                                display: 'block',
                                                fontWeight: 100,
                                                width: '20vw'
                                            },
                                            plus: {
                                                background: 'rgba(255, 255, 255, 100)'
                                            },
                                            minus: {
                                                background: 'rgba(255, 255, 255, 100)'
                                            },
                                            btnDown: {
                                                background: 'rgba(211, 47, 47, 100)'
                                            },
                                            btnUp: {
                                                background: 'rgba(83, 127, 45, 100)'
                                            }
                                        }}
                                    />
                                    </div>
                                </div>)}
                                <div className="p-col-12">
                                    {
                                        floatNodes.length != 0 ?
                                        <h4 style={{marginTop: 0, marginBottom: 0}}>Float</h4> : null
                                    }
                    		    </div>
                    		    {floatNodes.map((floatNode, i) =>
                                <div className="p-col-12" key={`index-${i}`}>{floatNode}
                                    <div>
                                    <NumericInput
                                        className="form-control"
                                        min={0}
                                        step={0.1}
                                        precision={2}
                                        mobile={true}
                                        value={floatNodesValue[i] || '0.00'}
                                        onChange={(e) => handleFloatSpinnerChange(e, i)}
                                        style={{
                                            wrap: {
                                                boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
                                                padding: '2px 2.26ex 2px 2px',
                                                borderRadius: '6px 3px 3px 6px',
                                                fontSize: 20,
                                                width: '20vw'
                                            },
                                            input: {
                                                borderRadius: '6px 3px 3px 6px',
                                                padding: '0.1ex 1ex',
                                                border: '#ccc',
                                                marginRight: 4,
                                                display: 'block',
                                                fontWeight: 100,
                                                width: '20vw'
                                            },
                                            plus: {
                                                background: 'rgba(255, 255, 255, 100)'
                                            },
                                            minus: {
                                                background: 'rgba(255, 255, 255, 100)'
                                            },
                                            btnDown: {
                                                background: 'rgba(211, 47, 47, 100)'
                                            },
                                            btnUp: {
                                                background: 'rgba(83, 127, 45, 100)'
                                            }
                                        }}
                                    />
                                    </div>
                                </div>)}
							</div>
						</div>
					</Dialog>
					<button className='diagram-header-button' onClick={handleDebugClick} >Debug</button>
					<Dialog header="Debug" visible={displayDebug} modal={false} style={{ width: '35vw', top: '65%' }} footer={renderDebugFooter()} onHide={() => onHide('displayDebug')}>
						<div className="p-grid">
							<div className="p-col-12 p-md-6 p-lg-4">
								<Button label="Toggle breakpoint on Component" onClick={handleToggleBreakpoint} />
							</div>
							<div className="p-col-12 p-md-6 p-lg-4">
								<Button label="Step to next Component" onClick={() => alert('Next component')} />
							</div>
							<div className="p-col-12 p-md-6 p-lg-4">
								<Button label="Continue execute until finish" onClick={() => alert('Continue')} />
							</div>
							<div className="p-col-12">
								<Panel header="Component">
									<p>Content.</p>
								</Panel>
							</div>
						</div>
					</Dialog>
				</span>
			</Header> */}
			<Content>
				<Layer
					onDrop={(event) => {
						debugger;
						var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));

						let node = null;
						// note:  can not use the same port name in the same node,or the same name port can not link to other ports
						// you can use shift + click and then use delete to delete link
						if (data.type === 'in') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(192,255,0)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Dataset Name', 'parameter-string-in-1');

							node.addOutPortEnhance('▶', 'out-0');
							node.addOutPortEnhance('Dataset', 'parameter-out-1');

						} else if (data.type === 'out') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(0,102,204)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Dataset Name', 'parameter-string-in-1');
							node.addInPortEnhance('Random Crop', 'parameter-boolean-in-2');
							node.addInPortEnhance('Horizontal Flip', 'parameter-boolean-in-3');
							node.addInPortEnhance('Vertical Flip', 'parameter-boolean-in-4');
							node.addInPortEnhance('Add Noise', 'parameter-boolean-in-5');

							node.addOutPortEnhance('▶', 'out-0');
							node.addInPortEnhance('Resized Dataset', 'parameter-in-6');

						} else if (data.type === 'split') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(255,153,102)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Dataset', 'parameter-string-in-1');
							node.addInPortEnhance('Train', 'parameter-float-in-1');
							node.addInPortEnhance('Test', 'parameter-float-in-2');

							node.addOutPortEnhance('▶', 'out-0');


						} else if (data.type === 'train') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(255,102,102)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('model', 'parameter-string-in-1');
							node.addInPortEnhance('Training Data', 'parameter-string-in-2');
							node.addInPortEnhance('Training Epochs', 'parameter-int-in-3');

							node.addOutPortEnhance('▶', 'out-0');
							node.addOutPortEnhance('Trained Model', 'parameter-out-1');

						} else if (data.type === 'eval') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(255,204,204)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('model', 'parameter-string-in-1');
							node.addInPortEnhance('Eval Dataset', 'parameter-in-2');

							node.addOutPortEnhance('▶', 'out-0');
							node.addOutPortEnhance('Results', 'parameter-out-1');

						} else if (data.type === 'runnb') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(153,204,51)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Input Data', 'parameter-in-1');

							node.addOutPortEnhance('▶', 'out-0');

						} else if (data.type === 'if') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(255,153,0)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Test', 'in-1');

							node.addOutPortEnhance('If True  ▶', 'out-0');
							node.addOutPortEnhance('If False ▶', 'out-1');
							node.addOutPortEnhance('Finished ▶', 'out-2');

						} else if (data.type === 'math') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(255,204,0)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('A', 'in-1');
							node.addInPortEnhance('B', 'in-2');

							node.addOutPortEnhance('▶', 'out-0');
							node.addOutPortEnhance('value', 'out-1');


						} else if (data.type === 'convert') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(204,204,204)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('model', 'parameter-string-in-1');

							node.addOutPortEnhance('▶', 'out-0');
							node.addOutPortEnhance('converted', 'parameter-out-1');

						} else if (data.type === 'string') {

							if ((data.name).startsWith("Literal")){

								let theResponse = window.prompt('Enter String Value (Without Quotes):');
								node = new CustomNodeModel({ name: data.name, color: 'rgb(21,21,51)',  extras: { "type": data.type } });
								node.addOutPortEnhance(theResponse, 'out-0');

							} else{

								let theResponse = window.prompt('notice', 'Enter String Name (Without Quotes):');
								node = new CustomNodeModel({ name: "Hyperparameter (String): " + theResponse, color: 'rgb(153,204,204)', extras: { "type": data.type } });
								node.addOutPortEnhance('▶', 'parameter-out-0');

							}

						} else if (data.type === 'int') {

							if ((data.name).startsWith("Literal")){
								
								let theResponse = window.prompt('Enter Int Value (Without Quotes):');
								node = new CustomNodeModel({ name: data.name, color: 'rgb(21,21,51)',  extras: { "type": data.type } });
								node.addOutPortEnhance(theResponse, 'out-0');

							} else{
								
								let theResponse = window.prompt('notice', 'Enter Int Name (Without Quotes):');
								node = new CustomNodeModel({ name: "Hyperparameter (Int): " + theResponse, color: 'rgb(153,0,102)', extras: {"type":data.type} });
								node.addOutPortEnhance('▶', 'parameter-out-0');

							}

						} else if (data.type === 'float') {

							if ((data.name).startsWith("Literal")){
								
								let theResponse = window.prompt('Enter Float Value (Without Quotes):');
								node = new CustomNodeModel({ name: data.name, color: 'rgb(21,21,51)',  extras: { "type": data.type } });
								node.addOutPortEnhance(theResponse, 'out-0');

							} else{

								let theResponse = window.prompt('notice', 'Enter Float Name (Without Quotes):');
								node = new CustomNodeModel({ name: "Hyperparameter (Float): " + theResponse, color: 'rgb(102,51,102)', extras: { "type": data.type } });
								node.addOutPortEnhance('▶', 'parameter-out-0');

							}

						}else if (data.type === 'boolean') {

							if ((data.name).startsWith("Literal")){

								node = new CustomNodeModel({ name: data.name, color: 'rgb(21,21,51)', extras: { "type": data.type } });
								node.addOutPortEnhance('Value', 'out-0');

							} else{

								let theResponse = window.prompt('notice','Enter Boolean Name (Without Quotes):');
								node=new CustomNodeModel({name: "Hyperparameter (Boolean): " + theResponse,color:'rgb(153,51,204)',extras:{"type":data.type}});
								node.addOutPortEnhance('▶','parameter-out-0');

							}

                        } else if (data.type === 'model') {
							node = new CustomNodeModel({ name: data.name, color: 'rgb(102,102,102)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Training Data', 'parameter-string-in-1');
							node.addInPortEnhance('Model Type', 'parameter-string-in-2');

							node.addOutPortEnhance('▶', 'out-0');
							node.addOutPortEnhance('Model', 'parameter-out-1');

						} else if (data.type === 'debug') {
							node = new CustomNodeModel({ name: data.name, color: 'rgb(255,102,0)', extras: { "type": data.type } });
							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Data Set', 'parameter-in-1');
							node.addOutPortEnhance('▶', 'out-0');

						} else if (data.type === 'enough') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(51,51,51)', extras: { "type": data.type } });

							node.addInPortEnhance('▶', 'in-0');
							node.addInPortEnhance('Target Accuracy', 'parameter-float-in-1');
							node.addInPortEnhance('Max Retries', 'parameter-int-in-2');
							node.addInPortEnhance('Metrics', 'parameter-string-in-3');

							node.addOutPortEnhance('▶', 'out-0');
							node.addOutPortEnhance('Should Retrain', 'parameter-out-1');
						} else if (data.type === 'literal') {

							node = new CustomNodeModel({ name: data.name, color: 'rgb(21,21,51)', extras: { "type": data.type } });
							node.addOutPortEnhance('Value', 'out-0');
						}


						if (node != null) {
							let point = app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							app.getDiagramEngine().getModel().addNode(node);
							node.registerListener({
                               entityRemoved: () => {
							        setSaved(false);
							        setCompiled(false);
                               }
                            });
							forceUpdate();
						}
					}}
					onDragOver={(event) => {
						console.log("onDragOver")
						event.preventDefault();
						//forceUpdate();
					}}>
					<DemoCanvasWidget>
						<CanvasWidget engine={app.getDiagramEngine()} />
					</DemoCanvasWidget>
				</Layer>
			</Content>
		</Body>
	);
}