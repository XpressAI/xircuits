import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';
import { JupyterFrontEnd, ILabShell } from '@jupyterlab/application';
import { DiagramEngine, NodeModel } from '@projectstorm/react-diagrams';
import React from 'react';
import { marked } from 'marked';
import { infoIcon, fitIcon, fileCodeIcon, workflowComponentIcon, xircuitsIcon } from '../ui-components/icons';
import { SidePanel, caretLeftIcon, caretRightIcon, collapseAllIcon, expandAllIcon } from '@jupyterlab/ui-components';
import { AccordionPanel, Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';
import { centerNodeInView } from '../helpers/notificationEffects';
import { togglePreviewWidget } from './previewHelper';
import { getMainPath } from './nodeNavigation';
import { collectParamIO } from './portPreview';
import { IONodeTree } from './IONodeTree';
import type { IONode } from './portPreview';
import { commandIDs } from "../commands/CommandIDs";

export interface IComponentInfo {
  name: string;
  docstring: string;
  node?: any;
  engine?: DiagramEngine;
  filePath?: string;
}

type ToolbarState = {
  title: string;
  canPrev: boolean;
  canNext: boolean;
  canOpenScript: boolean;
  canCenter: boolean;
  canOpenWorkflow: boolean;
};

class CollapseBus extends Signal<unknown, boolean> {}

function TopBarReact({
  getState,
  onPrev,
  onNext,
  onOpenScript,
  onCenter,
  onOpenWorkflow,
  onToggleCollapse
}: {
  getState: () => ToolbarState;
  onPrev: () => void;
  onNext: () => void;
  onOpenScript: () => void;
  onCenter: () => void;
  onOpenWorkflow: () => void;
  onToggleCollapse: (expandAll: boolean) => void;
}) {
  const s = getState();
  const [expandAll, setExpandAll] = React.useState(true);

  const handleToggle = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    onToggleCollapse(newState);
  };

  return (
    <div className="component-preview-topbar">
      <div className="jp-Toolbar-title component-preview-title">
        <span
          className="jp-ToolbarButtonComponent-label component-preview-title-text"
          title={s.title}
        >
          {s.title}
        </span>
      </div>

      <ToolbarButtonComponent
        icon={caretLeftIcon}
        tooltip="Previous node"
        enabled={s.canPrev}
        onClick={onPrev}
      />
      <ToolbarButtonComponent
        icon={caretRightIcon}
        tooltip="Next node"
        enabled={s.canNext}
        onClick={onNext}
      />
      <ToolbarButtonComponent
        icon={fileCodeIcon}
        tooltip="Open script"
        enabled={s.canOpenScript}
        onClick={onOpenScript}
      />
      <ToolbarButtonComponent
        icon={fitIcon}
        tooltip="Center node"
        enabled={s.canCenter}
        onClick={onCenter}
      />
      <ToolbarButtonComponent
        icon={workflowComponentIcon}
        tooltip="Open workflow"
        enabled={s.canOpenWorkflow}
        onClick={onOpenWorkflow}
      />
      <ToolbarButtonComponent
        icon={
              expandAll
            ? collapseAllIcon
            : expandAllIcon
        }
        tooltip={expandAll ? 'Collapse All' : 'Expand All'}
        enabled
        onClick={handleToggle}
      />
    </div>
  );
}

class TopBarWidget extends ReactWidget {
  constructor(
    private getter: () => ToolbarState,
    private handlers: {
      onPrev: () => void;
      onNext: () => void;
      onOpenScript: () => void;
      onCenter: () => void;
      onOpenWorkflow: () => void;
      onToggleCollapse: (expandAll: boolean) => void;
    }
  ) {
    super();
    this.addClass('jp-Toolbar');
    this.addClass('component-preview-topbar-widget');
  }
  render(): JSX.Element {
    return (
      <TopBarReact
        getState={this.getter}
        onPrev={this.handlers.onPrev}
        onNext={this.handlers.onNext}
        onOpenScript={this.handlers.onOpenScript}
        onCenter={this.handlers.onCenter}
        onOpenWorkflow={this.handlers.onOpenWorkflow}
        onToggleCollapse={this.handlers.onToggleCollapse}
      />
    );
  }
}

class OverviewSection extends ReactWidget {
  private _model: IComponentInfo | null = null;
  constructor() {
    super();
    this.addClass('jp-AccordionPanel-content');
    this.addClass('component-preview-scroll');
  }
  setModel(m: IComponentInfo | null) {
    this._model = m;
    this.update();
  }
  render(): JSX.Element {
    if (!this._model) {
      return (
        <div className="empty-state">
          <xircuitsIcon.react />
          <p>Select a component's `i` icon to show its detail here.</p>
        </div>
      );
    }
    const { docstring } = this._model;
    return (
      <div>
        <div
          className="overview-docstring"
          dangerouslySetInnerHTML={{
            __html: marked(
              docstring || '_This is the Start or Finish of your workflow._'
            )
          }}
        />
      </div>
    );
  }
}

class IOTreeWidget extends ReactWidget {
  private _data: IONode[] = [];
  constructor(private _collapseBus: CollapseBus) {
    super();
    this.addClass('jp-AccordionPanel-content');
    this.addClass('component-preview-scroll');
  }
  setData(data: IONode[]) {
    this._data = data ?? [];
    this.update();
  }
  clear() {
    this._data = [];
    this.update();
  }
  render(): JSX.Element {
    return <IONodeTree data={this._data} collapseToggled={this._collapseBus} />;
  }
}

export class ComponentPreviewWidget extends SidePanel {
  private _app: JupyterFrontEnd;
  private _accordion: AccordionPanel;
  private _overview: OverviewSection;
  private _inputs: IOTreeWidget;
  private _outputs: IOTreeWidget;
  private _collapseBus = new CollapseBus({});
  private _model: IComponentInfo | null = null;
  private _topbar: TopBarWidget;

  constructor(app: JupyterFrontEnd, model: IComponentInfo | null) {
    super();
    this._app = app;

    this.id = 'xircuits-doc-preview';
    this.title.icon = infoIcon;
    this.title.caption = 'Component Info';
    this.addClass('jp-SidePanel');

    this.header.addClass('jp-SidePanel-header');
    this.header.addClass('component-preview-header');

    class HeaderTitle extends ReactWidget {
      render(): JSX.Element {
        return <div>Component Preview</div>;
      }
    }
    const headerTitle = new HeaderTitle();
    headerTitle.addClass('component-preview-header-title');
    this.header.addWidget(headerTitle);
    this.toolbar.addClass('component-preview-toolbar-hidden');

    const topbar = new TopBarWidget(() => this._computeToolbarState(), {
      onPrev: () => this._navigate(-1),
      onNext: () => this._navigate(1),
      onOpenScript: () => this._handleOpenScript(),
      onCenter: () => this._handleCenterNode(),
      onOpenWorkflow: () => this._handleOpenWorkflow(),
      onToggleCollapse: (expandAll: boolean) =>
        this._collapseBus.emit(expandAll)
    });
    (topbar as any).addClass?.('component-preview-header-topbar');
    this._topbar = topbar;          // ← نخزن المرجع هنا
    this.header.addWidget(topbar);

    this._accordion = this.content as AccordionPanel;

    this._overview = new OverviewSection();
    (this._overview as Widget).title.label = 'DESCRIPTION';
    this.addWidget(this._overview);

    this._inputs = new IOTreeWidget(this._collapseBus);
    (this._inputs as Widget).title.label = 'INPUTS';
    this.addWidget(this._inputs);

    this._outputs = new IOTreeWidget(this._collapseBus);
    (this._outputs as Widget).title.label = 'OUTPUTS';
    this.addWidget(this._outputs);

    const normalizeSizes = () => {
      const widgets = this._accordion.widgets as Widget[];
      const openFlags = widgets.map(
        w => !w.node.classList.contains('lm-mod-collapsed')
      );
      const openCount = openFlags.reduce((a, b) => a + (b ? 1 : 0), 0) || 1;
      const sizes = openFlags.map(isOpen => (isOpen ? 1 / openCount : 0));
      this._accordion.setRelativeSizes(sizes);
    };

    requestAnimationFrame(normalizeSizes);

    this._app.restored.then(() => requestAnimationFrame(normalizeSizes));

    (this._accordion as any).expansionToggled?.connect(normalizeSizes);
    this.disposed.connect(() => {
      (this._accordion as any).expansionToggled?.disconnect(normalizeSizes);
    });

    this.setModel(model);
  }

  setApp(app: JupyterFrontEnd) {
    this._app = app;
    this._topbar?.update();
  }

  setModel(model: IComponentInfo | null) {
    this._model = model ?? null;

    if (!model) {
      this._overview.setModel(null);
      this._inputs.clear();
      this._outputs.clear();

      this.node.dataset.componentName = '';
      this.node.dataset.componentId = '';
    } else {
      this._overview.setModel(model);
      try {
        const { inputs, outputs } = collectParamIO(model.node as any);
        this._inputs.setData(inputs ?? []);
        this._outputs.setData(outputs ?? []);
      } catch (e) {
        console.warn('[ComponentPreviewWidget] collectParamIO failed:', e);
        this._inputs.clear();
        this._outputs.clear();
      }

      const id = (model.node as any)?.getID?.();
      this.node.dataset.componentName = String(model.name ?? '');
      this.node.dataset.componentId = id != null ? String(id) : '';
    }

    this._topbar?.update();

    const shell = this._app.shell as ILabShell;
    shell.expandRight();
    shell.activateById(this.id);
  }

  private _computeToolbarState(): ToolbarState {
    const m = this._model;
    if (!m) {
      return {
        title: '',
        canPrev: false,
        canNext: false,
        canOpenScript: false,
        canCenter: false,
        canOpenWorkflow: false
      };
    }
    let canPrev = false,
      canNext = false;
    if (m.node) {
        const nodes = getMainPath(m.node);
        const idx = nodes.findIndex((n: NodeModel) => n.getID() === m.node.getID());
        canPrev = nodes.length > 1 && idx > 0;
        canNext = nodes.length > 1 && idx >= 0 && idx < nodes.length - 1;
    }
    const nodeType =
      m.node?.extras?.type ?? m.node?.getOptions?.().extras?.type ?? '';
    return {
      title: m.name ?? '',
      canPrev,
      canNext,
      canOpenScript: !!m.node,
      canCenter: !!(m.node && m.engine),
      canOpenWorkflow: nodeType === 'xircuits_workflow'
    };
  }

  private _navigate(step: -1 | 1) {
    const node = this._model?.node;
    const engine = this._model?.engine;
    if (!node) return;

    const nodes = getMainPath(node);
    if (nodes.length <= 1) return;

    const idx = nodes.findIndex((n: any) => n.getID() === node.getID());
    if (idx === -1) return;

    const nextIdx = idx + step;
    if (nextIdx < 0 || nextIdx >= nodes.length) return;

    const next = nodes[nextIdx] as any;

    togglePreviewWidget(
      this._app,
      {
        node: next,
        engine,
        name: next.getOptions().name,
        docstring: next.extras?.description ?? '',
        filePath: next.extras?.path ?? ''
      },
      true
    );

      engine?.getModel?.().clearSelection?.();
      next.setSelected?.(true);
      if (engine) centerNodeInView(engine, next.getID());
  }

  private _handleOpenScript() {
  void this._app.commands.execute(commandIDs.openScript)
    .catch(err => console.error('Failed to open node script:', err));
}

  private _handleCenterNode() {
    const node = this._model?.node;
    const engine = this._model?.engine;
    if (!node || !engine) return;

      centerNodeInView(engine, node.getID());
  }

  private _handleOpenWorkflow() {
  void this._app.commands.execute(commandIDs.openXircuitsWorkflow)
    .catch(err => console.error('Failed to open workflow:', err));
  }
}