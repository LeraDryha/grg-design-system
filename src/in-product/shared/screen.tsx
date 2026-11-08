import { createContext, useContext } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';

type Theme = 'light' | 'dark';

/** The theme button in the app's bar switches the Storybook theme (outside Storybook it does nothing) */
export const ThemeSwitch = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);
export const useThemeSwitch = () => useContext(ThemeSwitch);

/** A desktop screen; the transformed box keeps the modals inside it. On its own (full screen) it fills the window;
 *  on the docs page it is a 720px window into the app */
export const screen: Decorator = (Story, { viewMode }) => {
  const [globals, updateGlobals] = useGlobals();
  const theme: Theme = globals.theme === 'dark' ? 'dark' : 'light';
  return (
    <ThemeSwitch.Provider value={{ theme, setTheme: next => updateGlobals({ theme: next }) }}>
      <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width: '100%', minWidth: 960, height: viewMode === 'docs' ? 720 : '100vh' }}>
        <Story />
      </div>
    </ThemeSwitch.Provider>
  );
};
