import type { Decorator } from '@storybook/react-vite';

/** A desktop screen; the transformed box keeps the modals inside it. On its own (full screen) it fills the window;
 *  on the docs page it is a 720px window into the app */
export const screen: Decorator = (Story, { viewMode }) => (
  <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width: '100%', minWidth: 960, height: viewMode === 'docs' ? 720 : '100vh' }}>
    <Story />
  </div>
);
