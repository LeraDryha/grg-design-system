import { createContext, useContext } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';

type Theme = 'light' | 'dark';

/** What the app knows about the Storybook screen around it: the theme its bar button switches, and whether it is a
 *  window on a docs page (a narrow preview: the sidebar collapsed) or the full screen (it follows the screen's width) */
export const Screen = createContext<{ theme: Theme; setTheme: (theme: Theme) => void; docs: boolean } | null>(null);
export const useScreen = () => useContext(Screen);

/** A desktop screen; the transformed box keeps the modals inside it. On its own (full screen) it fills the window at
 *  any width; on the docs page it is a 720px window into the app */
export const screen: Decorator = (Story, { viewMode }) => {
  const [globals, updateGlobals] = useGlobals();
  const theme: Theme = globals.theme === 'dark' ? 'dark' : 'light';
  const docs = viewMode === 'docs';
  return (
    <Screen.Provider value={{ theme, setTheme: next => updateGlobals({ theme: next }), docs }}>
      <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width: '100%', minWidth: docs ? 960 : undefined, height: docs ? 720 : '100vh' }}>
        <Story />
      </div>
    </Screen.Provider>
  );
};
