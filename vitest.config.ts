import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// Every story is a test: it must render without errors, its play steps must pass and the Accessibility check
// (WCAG 2.2 AA) must find no violations. Runs from the Storybook sidebar, with `npm test`, and on every push.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
