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
- Icons come from the Figma "Base icons" frame (`23:11109`): export to `figma/icons.json`, run `npm run icons`; it writes `src/icons/base/` and the names list. `Icon` draws them as a CSS mask. Components use Base icons by their Figma name (spaces become hyphens: "calendar 01" → `calendar-01`). Social icons come from the Figma "Social icon" set (`68:17086`): export to `figma/social-icons.json`, run `npm run icons`; it writes `src/icons/social/` and the platform list, drawn by `SocialIcon`. Coin, Payment method and Country icons are full-colour pictures: export the whole set as SVG, split it with `scripts/split-figma-export.py`, run `npm run icons`; they are drawn by `CoinIcon`, `PaymentIcon` and `CountryIcon`. Icons from any other set need to be agreed first and go to `src/icons/extra/`.

## Files
`src/components/[Name]/` holds `[Name].tsx`, `[Name].css` and `[Name].stories.tsx`. Foundations live in `src/foundations/`, docs pages in `src/docs/[Category]/`.

## Stories
- `const meta = { … } satisfies Meta<typeof Component>` with a status tag (`tags: ['ready']`, `['in-progress']` or `['draft']`: shown in the page header, and in the sidebar unless ready), a component description and `parameters.design`: the Figma frames as images for the Design tab (`src/assets/design/[name]/[name]-component.png` and `-guidelines.png`, exported without the GRX header; the company file is never linked).
- A `Playground` story where everything is editable in Controls.
- **Examples**: real tasks, not one story per Figma state. Each has a sentence-case `name` ("Choose several", "Disabled until ready") and, when there is behaviour to check, a `play` function (`storybook/test`): it runs in the Interactions tab, in the sidebar test widget, with `npm test` and on every push.
- Hover, press and focus come from the pointer and the keyboard: no documentation-only state props. Error and disabled are shown inside an example that says why.
- **Overview** stories (types, sizes, colours) use `Showcase` and `Variant` from DocBlocks: the variants side by side, a quiet caption under each.
- Never hardcode content a prop can carry; overview stories pass `args` through.
- A known Figma contrast problem is listed with `parameters: { a11y: { test: 'todo' } }` and a comment, never hidden.
- Category order: Getting Started, Foundations, Components (flat, alphabetical), Contributing. No Atomic Design levels.

## Component page
Every component gets a docs page `src/components/[Name]/[Name].mdx` (`<Meta of={Stories} />`, no `autodocs` tag), in this order. Select is the reference.

1. Title, then `ComponentHeader` with `designTab`: the status comes from the tags; the PrimeReact base and related pages. `figma` and `guidelines` node ids stay for maintainers and are never linked.
2. One line on what it is, the Playground canvas, a short `Controls` list (the main props only) and a one-line code example.
3. **When to use**: `DoDont`, including which component to use instead.
4. **Examples**: each example canvas with a sentence about what it shows.
5. **Design decisions**: what the code adds to or decides beyond the Figma file, and why (focus ring, behaviour, discrepancies between the component set and the guidelines).
6. **Types**, **Sizes** (and other overviews): the overview canvases, with what each variant is for in a short paragraph or list under them.
7. **Accessibility**: a key table, then names, descriptions and known contrast notes.
8. **Figma and code**: a line pointing to the Design tab, then `PropsMapping`, every Figma property next to its prop.
9. **Props**: `ArgTypes`.

The blocks live in `src/docs/blocks/DocBlocks.tsx`.

## Checks before a change is done
- `npm run typecheck`, `npm test` (every story: render, play steps, WCAG 2.2 AA) and `npm run build-storybook` pass.
- The Accessibility panel shows no violations in both themes.
- Keyboard: every control is reachable with Tab and has a visible focus state.
