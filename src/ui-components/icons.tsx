import { LabIcon } from '@jupyterlab/ui-components';
import xircuitsSvg from '../../style/icons/xpress-logo.svg';
import debuggerSvg from '../../style/icons/debugger.svg';
import lockSvg from '../../style/icons/lock.svg';
import breakpointSvg from '../../style/icons/breakpoint.svg';
import nextSvg from '../../style/icons/next.svg';
import revertSvg from '../../style/icons/revert.svg';
import componentLibSvg from '../../style/icons/component-library.svg';
import reloadAllSvg from '../../style/icons/reload-all.svg';

export const xircuitsFaviconLink = 'https://raw.githubusercontent.com/XpressAI/xircuits/master/style/icons/xpress-logo.ico';
export const xircuitsIcon = new LabIcon({ name: 'xircuits:xircuits', svgstr: xircuitsSvg });
export const debuggerIcon = new LabIcon({ name: 'xircuits:debuggerIcon', svgstr: debuggerSvg });
export const lockIcon = new LabIcon({ name: 'xircuits:lockIcon', svgstr: lockSvg });
export const breakpointIcon = new LabIcon({ name: 'xircuits:breakpointIcon', svgstr: breakpointSvg });
export const nextIcon = new LabIcon({ name: 'xircuits:nextIcon', svgstr: nextSvg });
export const revertIcon = new LabIcon({ name: 'xircuits:revertIcon', svgstr: revertSvg });
export const componentLibIcon = new LabIcon({ name: 'xircuits:componentLibIcon', svgstr: componentLibSvg });
export const reloadAllIcon = new LabIcon({ name: 'xircuits:reloadAllIcon', svgstr: reloadAllSvg });

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