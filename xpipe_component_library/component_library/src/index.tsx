
import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react';
import styled from '@emotion/styled';
import { TrayItemWidget } from './TrayItemWidget';
import { TrayWidget } from './TrayWidget';

export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		min-height: 100%;
		height: 500px;
	`;
​
export const Content = styled.div`
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    'padding-top': '2em',
    'padding-bottom': '2em',
    'border-top': '1px solid #dfe2e5'
  `;

class BodyWidget extends ReactWidget{
  render() {
    return (
      <Body>
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
        </Content>
      </Body>
    );
  }
}

/**
 * Initialization data for the xpipe_component_library extension.
 */
const xpipe_component_library: JupyterFrontEndPlugin<void> = {
  id: 'xpipe_component_library:plugin',
  autoStart: true,
  requires: [ILabShell, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd, 
    labShell:ILabShell, 
    restorer: ILayoutRestorer
    ) => {
    console.log('JupyterLab extension xpipe_component_library is activated!');
    
    const widget = new BodyWidget();
    widget.id = 'xai-jupyterlab-component-library';
    restorer.add(widget, widget.id);
    labShell.add(widget, "left", { rank: 1000 });
  }
};
​
export default xpipe_component_library;