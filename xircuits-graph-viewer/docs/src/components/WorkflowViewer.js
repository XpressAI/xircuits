import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

export default function WorkflowViewer({ src, height = 500 }) {
  return (
    <BrowserOnly>
      {() => {
        const Viewer = require('./WorkflowViewerInner').default;
        return <Viewer src={src} height={height} />;
      }}
    </BrowserOnly>
  );
}
