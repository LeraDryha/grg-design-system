import { create } from 'storybook/theming';

/* The Storybook frame around the components, in GRG colours (light theme tokens, src/styles/tokens.css).
   Storybook's frame can't read CSS variables, so the token values are copied here. */
const neutral = { 0: '#ffffff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 500: '#737373', 700: '#404040', 1000: '#0a0a0a' };
const gold = '#f5a70f'; // --primary-gold-base

export default create({
  base: 'light',
  brandTitle: 'GRG Design System',
  brandTarget: '_self',

  // Gold marks the brand; the selected item is black, as GRG primary buttons (white on gold is too light to read)
  colorPrimary: gold,
  colorSecondary: neutral[1000],

  appBg: neutral[50],
  appContentBg: neutral[0],
  appPreviewBg: neutral[0],
  appBorderColor: neutral[200],
  appBorderRadius: 10, // --radius-md-10

  fontBase: "'Nunito Sans', system-ui, sans-serif",
  fontCode: "'Fira Code', ui-monospace, monospace",

  textColor: neutral[1000],
  textInverseColor: neutral[0],
  textMutedColor: neutral[500],

  barBg: neutral[0],
  barTextColor: neutral[500],
  barSelectedColor: neutral[1000],
  barHoverColor: neutral[1000],

  inputBg: neutral[0],
  inputBorder: neutral[300],
  inputTextColor: neutral[1000],
  inputBorderRadius: 8, // --radius-sm-8

  buttonBg: neutral[100],
  buttonBorder: neutral[200],
  booleanBg: neutral[100],
  booleanSelectedBg: neutral[0],
});
