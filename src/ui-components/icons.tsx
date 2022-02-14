import { LabIcon } from '@jupyterlab/ui-components';
import xircuitsSvg from '../../style/icons/xpress-logo.svg';
import debuggerSvg from '../../style/icons/debugger.svg';
import lockSvg from '../../style/icons/lock.svg';
import breakpointSvg from '../../style/icons/breakpoint.svg';

export const xircuitsIcon = new LabIcon({ name: 'xircuits:xircuits', svgstr: xircuitsSvg });
export const debuggerIcon = new LabIcon({ name: 'xircuits:debuggerIcon', svgstr: debuggerSvg });
export const lockIcon = new LabIcon({ name: 'xircuits:lockIcon', svgstr: lockSvg });
export const breakpointIcon = new LabIcon({ name: 'xircuits:breakpointIcon', svgstr: breakpointSvg });