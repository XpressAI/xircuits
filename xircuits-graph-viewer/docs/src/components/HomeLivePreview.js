import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function HomeLivePreview() {
  return (
    <BrowserOnly fallback={<div style={{ height: 480 }} />}>
      {() => {
        const Inner = require('./HomeLivePreviewInner').default;
        return <Inner />;
      }}
    </BrowserOnly>
  );
}
