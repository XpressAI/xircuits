import * as React from 'react';
import { TrayWidget } from './TrayWidget';
import { Application } from '../Application';
import { TrayItemWidget } from './TrayItemWidget';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from '../helpers/DemoCanvasWidget';
import styled from '@emotion/styled';

import axios from "axios";
import {CustomNodeModel} from "./CustomNodeModel";

export interface BodyWidgetProps {
	app: Application;
	projectId:string;
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


export class BodyWidget extends React.Component<BodyWidgetProps> {
	componentDidMount() {
		let startNode = new CustomNodeModel({ name:'Start', color:'rgb(255,102,102)', extras:{ "type":"Start" } });
		startNode.addOutPortEnhance('▶', 'out-0');
		startNode.addOutPortEnhance('  ', 'parameter-out-1');
		startNode.setPosition(100, 100);

		let finishedNode = new CustomNodeModel({ name:'Finish', color:'rgb(255,102,102)', extras:{ "type":"Finish" } });
		finishedNode.addInPortEnhance('▶', 'in-0');
		finishedNode.addInPortEnhance('  ', 'parameter-in-1');
		finishedNode.setPosition(800, 100);

		this.props.app.getDiagramEngine().getModel().addAll(startNode, finishedNode);

		this.forceUpdate();
	}

	handleSaveClick = () => {
		let projectId = this.props.projectId;
		let diagramJsonStr = JSON.stringify(this.props.app.getDiagramEngine().getModel().serialize());
		axios.post(`project/training/pipeline/save`, {
			projectId:projectId,
			diagramJsonStr: diagramJsonStr
		}).then(response => {
			alert(response.data.message);
		});
	}

	handleCompileClick = () => {
		let projectId = this.props.projectId;
		let diagramJsonStr = JSON.stringify(this.props.app.getDiagramEngine().getModel().serialize());
		axios.post(`project/training/pipeline/compile`, {
			projectId:projectId,
			diagramJsonStr: diagramJsonStr
		}).then(response => {
			alert(response.data.message);
		});
	}

	handleRunClick = () => {
	  let nodes=this.props.app.getDiagramEngine().getModel().getNodes();

	  for (let i=0; i < nodes.length; i++) {
	  	nodes[i].setSelected(true);
	  }
	  alert('Run');
	}

	handleDebugClick = () => {
		alert('Debug');
	}

	render() {
		return (
			<Body>
				<Header>
					<div className="title">Sample Project | Main Workflow ▽</div>
					<span className='diagram-header-span'>
					<button className='diagram-header-button' onClick={this.handleSaveClick} >Save</button>
					<button className='diagram-header-button' onClick={this.handleCompileClick} >Compile</button>
					<button className='diagram-header-button' onClick={this.handleRunClick} >Run</button>
					<button className='diagram-header-button' onClick={this.handleDebugClick} >Debug</button>
					</span>
				</Header>
				<Content>
					<TrayWidget>
						<TrayItemWidget model={{ type: 'in' ,name:'Read Data Set'}} name="Read Data Set" color="rgb(192,255,0)" />
						<TrayItemWidget model={{ type: 'out' ,name:'Augment Image Data'}} name="Argument Image Data" color="rgb(0,102,204)" />
						<TrayItemWidget model={{ type: 'split' ,name:'Train/Test Split'}} name="Train/Test Split" color="rgb(255,153,102)" />
						<TrayItemWidget model={{ type: 'train' ,name:'Train Face Detector'}} name="Train Face Detector" color="rgb(255,102,102)" />
						<TrayItemWidget model={{ type: 'train' ,name:'Train Object Detector'}} name="Train Object Detector" color="rgb(15,255,255)" />
						<TrayItemWidget model={{ type: 'eval' ,name:'Evaluate mAP'}} name="Evaluate mAP" color="rgb(255,204,204)" />
						<TrayItemWidget model={{ type: 'runnb' ,name:'Run Notebook'}} name="Run Notebook" color="rgb(153,204,51)" />
						<TrayItemWidget model={{ type: 'if' ,name:'If'}} name="If" color="rgb(255,153,0)" />
						<TrayItemWidget model={{ type: 'math' ,name:'Math Operation'}} name="Math Operation" color="rgb(255,204,0)" />
						<TrayItemWidget model={{ type: 'convert' ,name:'Convert to Aurora'}} name="Convert to Aurora" color="rgb(204,204,204)" />
						<TrayItemWidget model={{ type: 'string'  ,name:'Get Hyper-parameter String Value' }} name="Get Hyper-parameter String Value" color="rgb(153,204,204)" />
						<TrayItemWidget model={{ type: 'int'    ,name:'Get Hyper-parameter Int Value'}} name="Get Hyper-parameter Int Value" color="rgb(153,0,102)" />
						<TrayItemWidget model={{ type: 'float'  ,name:'Get Hyper-parameter Float Value'}} name="Get Hyper-parameter Float Value" color="rgb(102,51,102)" />
						<TrayItemWidget model={{ type: 'model'  ,name:'Create Object Detector Model'}} name="Create Object Detector Model" color="rgb(102,102,102)" />
						<TrayItemWidget model={{ type: 'debug'  ,name:'Debug Image' }} name="Debug Image" color="rgb(255,102,0)" />
						<TrayItemWidget model={{ type: 'enough' ,name:'Reached Target Accuracy' }} name="Reached Target Accuracy" color="rgb(51,51,51)" />
						<TrayItemWidget model={{ type: 'literal' ,name:'Literal True' }} name="Literal True" color="rgb(21,21,51)" />
						<TrayItemWidget model={{ type: 'literal' ,name:'Literal False' }} name="Literal False" color="rgb(21,21,51)" />
					</TrayWidget>

					<Layer
						onDrop={(event) => {

							let data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));

							let node= null;
							// note:  can not use the same port name in the same node,or the same name port can not link to other ports
							// you can use shift + click and then use delete to delete link
							if (data.type === 'in') {

								node=new CustomNodeModel({name:data.name,color:'rgb(192,255,0)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Dataset Name','parameter-in-1');

								node.addOutPortEnhance('▶','out-0');
								node.addOutPortEnhance('Dataset','parameter-out-1');

							} else if (data.type === 'out') {

								node=new CustomNodeModel({name:data.name,color:'rgb(0,102,204)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Dataset Name','parameter-in-1');
								node.addInPortEnhance('Random Crop','parameter-in-2');
								node.addInPortEnhance('Horizontal Flip','parameter-in-3');
								node.addInPortEnhance('Vertical Flip','parameter-in-4');
								node.addInPortEnhance('Add Noise','parameter-in-5');

								node.addOutPortEnhance('▶','out-0');
								node.addInPortEnhance('Resized Dataset','parameter-in-6');

							}else if (data.type === 'split') {

								node=new CustomNodeModel({name:data.name,color:'rgb(255,153,102)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Dataset','parameter-in-1');
								node.addInPortEnhance('Train','parameter-in-1');
								node.addInPortEnhance('Test','parameter-in-2');

								node.addOutPortEnhance('▶','out-0');


							}else if (data.type === 'train') {

								node=new CustomNodeModel({name:data.name,color:'rgb(255,102,102)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('model','parameter-in-1');
								node.addInPortEnhance('Training Data','parameter-in-2');
								node.addInPortEnhance('Training Epochs','parameter-in-3');

								node.addOutPortEnhance('▶','out-0');
								node.addOutPortEnhance('Trained Model','parameter-out-1');

							}else if (data.type === 'eval') {

								node=new CustomNodeModel({name:data.name,color:'rgb(255,204,204)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('model','parameter-in-1');
								node.addInPortEnhance('Eval Dataset','parameter-in-2');

								node.addOutPortEnhance('▶','out-0');
								node.addOutPortEnhance('Results','parameter-out-1');

							}else if (data.type === 'runnb') {

								node=new CustomNodeModel({name:data.name,color:'rgb(153,204,51)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Input Data','parameter-in-1');

								node.addOutPortEnhance('▶','out-0');

							}else if (data.type === 'if') {

								node=new CustomNodeModel({name:data.name,color:'rgb(255,153,0)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Test','in-1');

								node.addOutPortEnhance('If True  ▶','out-0');
								node.addOutPortEnhance('If False ▶','out-1');
								node.addOutPortEnhance('Finished ▶','out-2');

							}else if (data.type === 'math') {

								node=new CustomNodeModel({name:data.name,color:'rgb(255,204,0)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('A','in-1');
								node.addInPortEnhance('B','in-2');

								node.addOutPortEnhance('▶','out-0');
								node.addOutPortEnhance('value','out-1');


							}else if (data.type === 'convert') {

								node=new CustomNodeModel({name:data.name,color:'rgb(204,204,204)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('model','parameter-in-1');

								node.addOutPortEnhance('▶','out-0');
								node.addOutPortEnhance('converted','parameter-out-1');
							}else if (data.type === 'string') {
								let theResponse = window.prompt('notice','Enter String Value (Without Quotes):');
								node=new CustomNodeModel({name:theResponse || '',color:'rgb(153,204,204)',extras:{"type":data.type}});
								node.addOutPortEnhance('▶','parameter-out-0');
							}else if (data.type === 'int') {
								let theResponse = window.prompt('notice','Enter Int Value (Without Quotes):');
								node=new CustomNodeModel({name:theResponse || '',color:'rgb(153,0,102)',extras:{}});
								node.addOutPortEnhance('▶','parameter-out-0');
							}else if (data.type === 'float') {
								let theResponse = window.prompt('notice','Enter Float Value (Without Quotes):');
								node=new CustomNodeModel({name:theResponse || '',color:'rgb(102,51,102)',extras:{"type":data.type}});
								node.addOutPortEnhance('▶','parameter-out-0');
							}else if (data.type === 'model') {

								node=new CustomNodeModel({name:data.name,color:'rgb(102,102,102)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Training Data','parameter-in-1');
								node.addInPortEnhance('Model Type','parameter-in-2');

								node.addOutPortEnhance('▶','out-0');
								node.addOutPortEnhance('Model','parameter-out-1');
							}else if (data.type === 'debug') {
								node=new CustomNodeModel({name:data.name,color:'rgb(255,102,0)',extras:{"type":data.type}});
								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Data Set','parameter-in-1');
								node.addOutPortEnhance('▶','out-0');

							}else if (data.type === 'enough') {

								node=new CustomNodeModel({name:data.name,color:'rgb(51,51,51)',extras:{"type":data.type}});

								node.addInPortEnhance('▶','in-0');
								node.addInPortEnhance('Target Accuracy','parameter-in-1');
								node.addInPortEnhance('Max Retries','parameter-in-2');
								node.addInPortEnhance('Metrics','parameter-in-3');

								node.addOutPortEnhance('▶','out-0');
								node.addOutPortEnhance('Should Retrain','parameter-out-1');
							}else if (data.type === 'literal') {

								node=new CustomNodeModel({name:data.name,color:'rgb(21,21,51)',extras:{"type":data.type}});
								node.addOutPortEnhance('Value','out-0');
							}


							if (node != null) {
								let point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
								node.setPosition(point);
								this.props.app.getDiagramEngine().getModel().addNode(node);
								this.forceUpdate();
							}
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}>
						<DemoCanvasWidget>
							<CanvasWidget engine={this.props.app.getDiagramEngine()} />
						</DemoCanvasWidget>
					</Layer>
				</Content>
			</Body>
		);
	}
}
