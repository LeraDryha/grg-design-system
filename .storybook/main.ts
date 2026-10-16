import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: [
    {
      // GitHub-flavored Markdown (tables, task lists) in MDX documentation pages
      name: '@storybook/addon-docs',
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  viteFinal: config => {
    const onwarn = config.build?.rollupOptions?.onwarn;
    return {
      ...config,
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          // PrimeReact modules start with "use client"; Vite drops the directive, nothing to fix
          onwarn(warning, warn) {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
            if (onwarn) onwarn(warning, warn);
            else warn(warning);
          },
        },
      },
    };
  },
};

export default config;
