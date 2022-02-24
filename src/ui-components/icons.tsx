import { LabIcon } from '@jupyterlab/ui-components';
import xircuitsSvg from '../../style/icons/xpress-logo.svg';
import debuggerSvg from '../../style/icons/debugger.svg';
import lockSvg from '../../style/icons/lock.svg';
import breakpointSvg from '../../style/icons/breakpoint.svg';

export const xircuitsFaviconLink = 'https://raw.githubusercontent.com/XpressAI/xircuits/master/style/icons/xpress-logo.ico';
export const xircuitsIcon = new LabIcon({ name: 'xircuits:xircuits', svgstr: xircuitsSvg });
export const debuggerIcon = new LabIcon({ name: 'xircuits:debuggerIcon', svgstr: debuggerSvg });
export const lockIcon = new LabIcon({ name: 'xircuits:lockIcon', svgstr: lockSvg });
export const breakpointIcon = new LabIcon({ name: 'xircuits:breakpointIcon', svgstr: breakpointSvg });

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