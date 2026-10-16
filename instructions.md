# Component and story rules

These rules apply whenever a component, a story or a docs page is created or changed.

## Stack
React 19, TypeScript, Storybook 10 (CSF 3) and **PrimeReact 10.9.9** (MIT; v11 needs a paid licence).

- Build every interactive component on its PrimeReact counterpart (`Button`, `InputText`, `Dropdown`, `Checkbox`…), not on raw HTML controls.
- PrimeReact runs **unstyled** (`src/primereact-config.ts`): the library gives behaviour, keyboard support and ARIA; the look comes only from the component CSS. Pass class names through `className` / `pt`; never load a PrimeReact theme.
- If PrimeReact can't reproduce the design or its accessibility, fill the gap in the component and explain it in a code comment.
- Pin exact dependency versions.

## Tokens
- Every value comes from `src/styles/tokens.css`: colours (semantic tokens only, never `--color-…` primitives), `--typo-…` text styles, `--space-…`, `--radius-…`, `--shadow-…`.
- No hex values, pixel sizes or font names in component CSS. The only allowed raw values are `0`, `1px` borders and `transparent`.
- `tokens.css` is generated: change Figma, export, run `npm run tokens` (see Contributing/Tokens).
- Each component must work in both themes; check it with the Theme toolbar.
- Keyboard focus always uses `var(--focus-ring)` from `src/styles/system.css`.

## Figma
- Figma file: GRG Design System (key `r3E5XdifyoiiNeuj7mOjBk`), one page per component.
- Read the component set before writing code: properties, every variant, the bound variables of fills, strokes, paddings and radii, text styles and effects. Map Figma properties to props and name the mapping in the prop's comment.
- Icons come from the Figma "Base icons" page as SVG into `src/icons/`, drawn by `Icon` as a CSS mask.

## Files
`src/components/[Name]/` holds `[Name].tsx`, `[Name].css` and `[Name].stories.tsx`. Foundations live in `src/foundations/`, docs pages in `src/docs/[Category]/`.

## Stories
- `const meta = { … } satisfies Meta<typeof Component>` with `tags: ['autodocs']` and a component description: what it is for and when to use it.
- A `Playground` story where everything is editable in Controls, then stories for types, sizes, states and special cases.
- Never hardcode content a prop can carry; overview stories pass `args` through.
- Category order: Getting Started, Foundations, Components (flat, alphabetical), Contributing. No Atomic Design levels.

## Checks before a change is done
- `npm run typecheck` and `npm run build-storybook` pass.
- The Accessibility panel shows no violations in both themes.
- Keyboard: every control is reachable with Tab and has a visible focus state.
