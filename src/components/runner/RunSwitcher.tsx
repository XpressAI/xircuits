import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { HTMLSelect } from '@jupyterlab/ui-components';
import React from 'react';
import { XircuitsFactory } from '../../XircuitsFactory';

/**
 * A toolbar widget that switches output types.
 */
export class RunSwitcher extends ReactWidget {
    /**
     * Construct a new output type switcher.
     */
    constructor(widget: XircuitsFactory) {
        super();
        this._output = widget;
    }

    /**
     * Handle `change` events for the HTMLSelect component.
     */
    handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        let runType = event.target.value;
        this._output.runTypeXircuitSignal.emit({ runType })

        this.update();
    };

    render() {
        let value;
        return (
            <UseSignal signal={this._output.runTypeXircuitSignal}>
                {(_, args) => {
                    if (args !== undefined) {
                        let runType = args["runType"] as any;
                        return (
                            <HTMLSelect
                                onChange={this.handleChange}
                                value={runType}
                                aria-label={'Run type'}
                                title={'Select the run type'}
                            >
                                <option value="run" >Local Run</option>
                                <option value="run-dont-compile">Local Run w/o Compile</option>
                                <option value="remote-run">Remote Run</option>
                            </HTMLSelect>
                        );
                    }
                    // Only for rendering the first time
                    return (
                        <HTMLSelect
                            onChange={this.handleChange}
                            value={value}
                            aria-label={'Run type'}
                            title={'Select the run type'}
                        >
                            <option value="run" >Local Run</option>
                            <option value="run-dont-compile">Run w/o Compile</option>
                            <option value="remote-run">Remote Run</option>
                        </HTMLSelect>
                    );
                }}
            </UseSignal>
        );
    }
    private _output: XircuitsFactory;
}