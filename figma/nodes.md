# Figma node map

Where each component lives in the GRG Design System file (`r3E5XdifyoiiNeuj7mOjBk`). Node ids go into URLs as `node-id=73-3711`.

## Icons

| What | Node |
|---|---|
| Base icons (362, 24 × 24), exported to `figma/icons.json` | `23:11109` |
| Usage text (sizes, customising) | on the same page, next to the set |
| Social icon set (Platform × Style: 25 Brand, 21 Gray), exported to `figma/social-icons.json` | `68:17086` |
| Social icon page (usage, sizes, dark example) | `68:17669` |
| Coin set (682, Name), exported to `figma/coin-icons.json` | `80:4965` |
| Coin icon page (usage, sizes) | `80:14858` |
| Payment method icon set (40, 34 × 24), exported to `figma/payment-icons.json` | `80:15178` |
| Payment method icon page (usage, sizes) | `80:14896` |
| Country icons: 233 separate components on the page frame, exported to `figma/country-icons.json`; RU and BY are left out of the build | `68:14967` |

## Field parts (shared by Input, Select and Text Area)

| Part | Node | Variants |
|---|---|---|
| Floating label | `161:20853` | State: Default, Active, Disabled. Star, Text (Optional), Icon (info) |
| Hint text | `73:3653` | State: Default, Error, Disabled. Icon |
| Key: value | `73:3662` | Type: Key: Value, Value |
| Placeholder | `161:36885` | Type: Text, Bullets × State: Default, Filled, Disabled |

## Input

| What | Node |
|---|---|
| Component set `input` | `73:3711` (Type × State × Size × Filled, 210 variants) |
| Usage guidelines (anatomy, types, states, floating label, spacing) | `422:71016` |
| Examples (sign-up form) | `450:30406` |
| Inline select (Country, Icon, Coin) | `424:73111` and its set |
| Action button (sm-20px, Grey) | `286:12701` and its set |

## Button

| What | Node |
|---|---|
| Page | `68:18222` |
| Usage guidelines | `417:22553` |

## Social button

| What | Node |
|---|---|
| Component set `Social button` (State × Icon button × Social, 24 variants; no guidelines page) | `68:17758` |

## Text Area

| What | Node |
|---|---|
| Component set `Text Area` (State × Filled × Size, 30 variants; uses Floating label, Hint text, Key: value) | `77:484318` |
| Character counter (State: Default, Error, Disabled) | `203:20411` |
| Resize icon `16/resize`, in `src/icons/extra/` | `203:20404` |
| Usage guidelines (anatomy, sizes, states, floating label, spacing) | `989:55196` |

## Select

| What | Node |
|---|---|
| Component set `Select` (Type × State × Filled × Size, 150 variants) | `404:42432` |
| Component set `Compact select` (Type × Size × State, 60 variants) | `404:56948` |
| Component set `Inline select` (State × Type, 12 variants) | `424:72942` |
| Usage guidelines (anatomy, sizes, types, states, floating label, spacing) | `459:37807` |
| Examples (open lists, search, multi-select) | `461:23553` |
| Dropdown menu item, Dropdown misc items (search, divider), on the Dropdown menu page | `274:9333`, `451:29358` |

## Avatar

| What | Node |
|---|---|
| Component set `Avatar` (Size × Image × Initials × Coloured × Company, 77 variants) | `152:1467` |
| Component set `Status badge` (Type × Size, 25 variants) | `154:1337` |
| Usage guidelines (anatomy, sizes, variants, colours) | `420:13612` |

## Alert, Notification & Toast

| What | Node |
|---|---|
| Page | `150:19734` |
| Component set (Size × Filled × Status × Description, 30 variants; Button, Close and Status icon options) | `149:19579` |
| Usage guidelines (anatomy, sizes, description, elevation, status colours) | `403:29662` |

## Accordion

| What | Node |
|---|---|
| Page | `151:13556` |
| Component set `Accordion` (State × Expanded × Flip icon, 16 variants; Edit title and Icon options) | `151:13214` |
| Description component set (Text, key-value) | `151:13084` |
| Key-value component set (Rows 01–05; 12px row gap) | `151:13111` |
| Usage guidelines (anatomy, chevron, leading icon, descriptions, states) | `420:7068` |

## Badge

| What | Node |
|---|---|
| Page Badge & Status dot | `160:9085` |
| Component set `Badge` (Style × Size × Type × Color, 180 variants; Left icon, Right icon, Edit text and Edit numeric options) | `160:11265` |
| Usage guidelines (anatomy, Text/Numeric/Dot, sizes, four styles and five colours) | `422:47775` |

Badge is separate from the `Status badge` part of Avatar (`154:1337`). Text uses Base icons; Dot is a native ellipse.

## Banner

| What | Node |
|---|---|
| Page Banners | `160:13278` |
| Component set `Banner` (Filled × Status, ten variants; Remove, Button, Description, Title and Description2 options) | `321:11577` |
| Usage guidelines (anatomy, Ghost/Filled, five statuses, centre/left alignment) | `473:48274` |
| Examples | `473:49738` |

Banner uses the Base status icons, Link (Black, sm-20) and Action Button (Grey, sm-20). The Info icon binds `info-subtle-500`; the Success icon is flattened to its 16⅔px drawing bounds.

## Breadcrumbs

| What | Node |
|---|---|
| Page Breadcrumbs | `574:947` |
| Component set `Breadcrumbs group` (Quantity 02–05) | `574:1037` |
| Component set `Breadcrumb item` (Default, Hovered, Focused, Current; Icon, Text, Breadcrumb title options) | `574:951` |
| Usage guidelines (anatomy, item states/types, overflow dropdown, 200px maximum, tooltip) | `638:1495` |
| Examples (depend on the unbuilt Header) | `643:1053` |

The group set shows all five items; production code follows the guidelines and collapses intermediate levels when five or more are present. Focus uses the shared system blue ring. The dropdown and tooltip retain their source tokens.

## Button group

| What | Node |
|---|---|
| Page Button Group | `128:13750` |
| Component set `Button group item` (State × Icon only × Side × Size, 48 variants; Text, Left icon and Right icon) | `136:11562` |
| Component set `Button group` (Quantity 2–6 × Size sm-24/md-32, ten variants) | `137:1263` |
| Usage guidelines (anatomy, sizes, types, states and configurable quantity) | `473:26235` |
| Examples (time range, post actions, view actions and previous/next) | `473:47923` |

Code follows the actual bound component styles: Semibold, md 8px / sm 6px corners and 20px / 16px Base icons. The prose guidelines differ on weight, md radius and anatomy icon size. Active corresponds to Pressed in the guidelines. Group strokes are CENTER aligned in Figma and overlap at the joins. Code draws each shared edge once. Button group uses PrimeReact SelectButton for persistent single selection, aria-pressed and keyboard navigation. Keyboard focus uses the system blue ring.

## Checkbox

| What | Node |
|---|---|
| Component set `Checkbox` (State × Indeterminate × Selected × Size × Destructive, 36 variants) | `135:11986` |
| Component set `Checkbox label` (Flip × Selected × Details, with Sublabel, Description, Link button) | `136:5147` |
| Usage guidelines (anatomy, sizes, variants, states) | `473:55568` |
