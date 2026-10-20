import { setProjectAnnotations } from '@storybook/react-vite';
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview';

// The stories run in tests with the same decorators, theme and accessibility rules as in Storybook
setProjectAnnotations([a11yAnnotations, projectAnnotations]);
