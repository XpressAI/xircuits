import { LabIcon } from '@jupyterlab/ui-components';
import xircuitsSvg from '../../style/icons/xpress-logo.svg';
import debuggerSvg from '../../style/icons/debugger.svg';
import lockSvg from '../../style/icons/lock.svg';
import breakpointSvg from '../../style/icons/breakpoint.svg';
import nextSvg from '../../style/icons/next.svg';
import revertSvg from '../../style/icons/revert.svg';
import compileSvg from '../../style/icons/compile.svg';
import compileRunSvg from '../../style/icons/compile-run.svg';
import componentLibSvg from '../../style/icons/component-library.svg';
import reloadAllSvg from '../../style/icons/reload-all.svg';
import toggleAnimationSvg from '../../style/icons/low-power.svg';
import BranchComponentSvg from '../../style/icons/branch-component.svg';
import WorkflowComponentSvg from '../../style/icons/workflow-component.svg';
import startFinishComponentSvg from '../../style/icons/start-finish-component.svg';
import functionComponentSvg from '../../style/icons/function-component.svg';
import setVariableComponentSvg from '../../style/icons/set-variable-component.svg';
import getVariableComponentSvg from '../../style/icons/get-variable-component.svg';
import variableComponentSvg from '../../style/icons/variable-component.svg';
import infoSvg from '../../style/icons/info.svg';


export const xircuitsFaviconLink = 'https://raw.githubusercontent.com/XpressAI/xircuits/master/style/icons/xpress-logo.ico';
export const xircuitsIcon = new LabIcon({ name: 'xircuits:xircuits', svgstr: xircuitsSvg });
export const debuggerIcon = new LabIcon({ name: 'xircuits:debuggerIcon', svgstr: debuggerSvg });
export const lockIcon = new LabIcon({ name: 'xircuits:lockIcon', svgstr: lockSvg });
export const breakpointIcon = new LabIcon({ name: 'xircuits:breakpointIcon', svgstr: breakpointSvg });
export const nextIcon = new LabIcon({ name: 'xircuits:nextIcon', svgstr: nextSvg });
export const revertIcon = new LabIcon({ name: 'xircuits:revertIcon', svgstr: revertSvg });
export const compileIcon = new LabIcon({ name: 'xircuits:compileIcon', svgstr: compileSvg });
export const compileRunIcon = new LabIcon({ name: 'xircuits:compileRunIcon', svgstr: compileRunSvg });
export const reloadAllIcon = new LabIcon({ name: 'xircuits:reloadAllIcon', svgstr: reloadAllSvg });
export const toggleAnimationIcon = new LabIcon({ name: 'xircuits:toggleAnimationIcon', svgstr: toggleAnimationSvg });
export const componentLibIcon = new LabIcon({ name: 'xircuits:componentLibIcon', svgstr: componentLibSvg });
export const branchComponentIcon = new LabIcon({ name: 'xircuits:BranchComponentIcon', svgstr: BranchComponentSvg });
export const workflowComponentIcon = new LabIcon({ name: 'xircuits:workflowComponentIcon', svgstr: WorkflowComponentSvg });
export const startFinishComponentIcon = new LabIcon({ name: 'xircuits:startFinishComponentIcon', svgstr: startFinishComponentSvg });
export const functionComponentIcon = new LabIcon({ name: 'xircuits:functionComponentIcon', svgstr: functionComponentSvg });
export const setVariableComponentIcon = new LabIcon({ name: 'xircuits:setVariableComponentIcon', svgstr: setVariableComponentSvg });
export const getVariableComponentIcon = new LabIcon({ name: 'xircuits:getVariableComponentIcon', svgstr: getVariableComponentSvg });
export const variableComponentIcon = new LabIcon({ name: 'xircuits:variableComponentIcon', svgstr: variableComponentSvg });
export const infoIcon = new LabIcon({ name: 'xircuits:infoIcon', svgstr: infoSvg });

export function changeFavicon(src: string) {
    let head = document.head || document.getElementsByTagName('head')[0];
    let link = document.createElement('link'),
        oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = src;
    if (oldLink) {
        head.removeChild(oldLink);
    }
    head.appendChild(link);
}