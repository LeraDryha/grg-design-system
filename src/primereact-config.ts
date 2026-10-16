import type { APIOptions } from 'primereact/api';

/**
 * PrimeReact 10.9.9 runs unstyled: the library provides behavior, keyboard support and ARIA,
 * while every visual comes from this project's CSS and tokens (the GRG Design System file in Figma).
 * Components pass their own class names (className / pt), so no PrimeReact theme is loaded.
 */
export const primeReactConfig: Partial<APIOptions> = {
  unstyled: true,
  ripple: false,
};
