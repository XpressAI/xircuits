import React, { useState } from 'react';
import { caretRightIcon, caretDownIcon } from '@jupyterlab/ui-components';

/** Collapsible section using JupyterLab Accordion CSS */
interface Props {
  label: string;
  compact?: boolean;       
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  label,
  compact = false,
  defaultCollapsed = false,
  children
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const Arrow = collapsed ? caretRightIcon.react : caretDownIcon.react;

  return (
    <div className="lm-AccordionPanel">
      {/* header */}
      <h3
        className="lm-AccordionPanel-title jp-AccordionPanel-title"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="lm-AccordionPanel-toggleIcon jp-icon3">
          <Arrow width={12} height={12} tag="span" />
        </span>

        <span className="lm-AccordionPanel-titleLabel cs-titleLabel">
          {label}
        </span>
      </h3>

      {/* body */}
      {!collapsed && (
        <div
          className={
            compact
              ? 'jp-AccordionPanel-content jp-mod-compact'
              : 'jp-AccordionPanel-content'
          }
        >
          {children}
        </div>
      )}
    </div>
  );
}
