import { saveIcon, runIcon, fastForwardIcon, bugIcon } from '@jupyterlab/ui-components';
import { ToolbarButton } from '@jupyterlab/apputils';

/**  
 * A namespace for the toolbar items
 */
export namespace Toolbar{
    
    /**
     * Create a save button toolbar item.
     */
    export function save(){
        return new ToolbarButton({
            icon: saveIcon,
            tooltip: 'Save File',
            onClick: (): void => {
              alert('Saved');
            }
          });
    }
    
    /**
     * Create a compile button toolbar item.
     */
    export function compile(){
        return new ToolbarButton({
            icon: fastForwardIcon,
            tooltip: 'Compile',
            onClick: (): void => {
              alert('Compiled');
            }
          });  
    }
    
    /**
     * Create a run button toolbar item.
     */
    export function run(){
        return new ToolbarButton({
            icon: runIcon,
            tooltip: 'Run',
            onClick: (): void => {
              alert('Run');
            }
          });
    }
    
    /**
     * Create a debug button toolbar item.
     */
    export function debug(){
        return new ToolbarButton({
            icon: bugIcon,
            tooltip: 'Debug',
            onClick: (): void => {
              alert('Debug');
            }
          });
    }
}