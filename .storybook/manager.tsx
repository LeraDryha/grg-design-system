// The manager bundle compiles JSX to React.createElement, so React is imported by name
import React from 'react';
import { addons } from 'storybook/manager-api';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/fira-code/400.css';
import theme from './theme';

/* Status tags on a component's stories (meta tags): in-progress and draft get a label in the sidebar, so work
   that isn't finished is visible before the page is opened. Ready components need no label. */
const LABELS: Record<string, string> = { 'in-progress': 'In progress', draft: 'Draft' };

addons.setConfig({
  theme,
  sidebar: {
    renderLabel: item => {
      const tag = 'tags' in item ? item.tags?.find(t => t in LABELS) : undefined;
      if (!tag || item.type !== 'component') return item.name;
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {item.name}
          <span
            style={{
              padding: '0 6px',
              borderRadius: 4,
              fontSize: 11,
              lineHeight: '16px',
              fontWeight: 600,
              // Same colours as the status chip on docs pages (--bg-weak-100, --warning-muted-50; text 700 and 800)
              background: tag === 'draft' ? '#f5f5f5' : '#fffbeb',
              color: tag === 'draft' ? '#404040' : '#91400d',
            }}
          >
            {LABELS[tag]}
          </span>
        </span>
      );
    },
  },
});
