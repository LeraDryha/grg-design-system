import { useEffect } from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';
import { PrimeReactProvider } from 'primereact/api';
import { primeReactConfig } from '../src/primereact-config';
import '../src/styles/fonts.css';
import '../src/styles/tokens.css';
import '../src/styles/system.css';
import '../src/styles/base.css';

type Theme = 'light' | 'dark';

/**
 * The toolbar theme switch sets data-theme, so the semantic tokens swap.
 * A single story gets the theme on the whole canvas; on docs pages each example carries its own theme,
 * so the page text stays readable.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as Theme;
  const isStory = context.viewMode === 'story';
  useEffect(() => {
    if (isStory) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme, isStory]);
  return (
    <div className="grg-theme" data-theme={theme}>
      <Story />
    </div>
  );
};

const withPrime: Decorator = Story => (
  <PrimeReactProvider value={primeReactConfig}>
    <Story />
  </PrimeReactProvider>
);

const preview: Preview = {
  decorators: [withPrime, withTheme],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light (gold)', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'centered',
    // Viewport switch in the toolbar: the widths the products are designed for
    viewport: {
      options: {
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
        laptop: { name: 'Laptop 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        mobile: { name: 'Mobile 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
      },
    },
    // The canvas and docs follow the theme through tokens (base.css), not Storybook backgrounds
    backgrounds: { disable: true },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Getting Started', ['About'],
          'Foundations', ['Colors', 'Typography', 'Spacing', 'Corner Radius', 'Elevation', 'Icons', ['Base icons', 'Social icons', 'Coin icons', 'Payment method icons', 'Country icons']],
          'Components',
          'Contributing', ['Tokens'],
        ],
      },
    },
    a11y: {
      // WCAG 2.2 AA: violations are listed in the Accessibility panel
      options: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      test: 'error',
    },
  },
};

export default preview;
