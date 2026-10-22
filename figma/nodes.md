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

## Dropdown menu

| What | Node |
|---|---|
| Component set `Dropdown menu item` (State × Type × Checkbox × Description, Badge and Arrow, 112 variants) | `274:9333` |
| Component set `Dropdown misc items` (Search ×4, Button, Caption, Content divider line and text) | `451:29358` |
| Usage guidelines (anatomy, types, states, options) | `451:26692` |
| Guidelines: combining and placing items (gaps, padding, 9 rows, search over 10, skeleton, empty) | `451:28784` |
| Examples (currency select, actions with submenus, account menus) | `459:33170` |

## Input Otp

| What | Node |
|---|---|
| Page ❖ Input OTP | `1447:19661` |
| Component `OTP Input` (six cells + Hint text; Hint text boolean) | `1447:19647` |
| Component set `OTP cells` (State × Type, 15 variants) | `1447:17544` |
| Usage guidelines (anatomy, states) | `2112:17729` |
| Examples (Confirm your email in a Modal: typing, verifying) | `2112:17806` |

The OTP cells frame carries the File Upload description by mistake. The resend countdown in the examples is not in Figma (Contributing/Tokens).

## Modal

| What | Node |
|---|---|
| Page ❖ Modal | `324:17319` |
| Component set `Modal header` (Size × Type, 6 variants; Status, Arrow, Close, Title, Description, Padding bottom) | `479:2119` |
| Component set `Modal footer` (Type × Destructive × Size, 32 variants) | `329:13837` |
| Modal – Guidelines (combining items, desktop and mobile) | `483:31840` |
| Usage guidelines (anatomy, widths, heights, footer variants, destructive) | `479:26153` |
| Modal items (header, footer, paddings) | `481:10068` |
| Examples (code check, integrations, onboarding, mobile convert) | `483:32231` |
| Component set `Stepper dot` (Size × Active, 8 variants), on the same page | `326:6369` |
| Component set `Featured icon` (Type × Size × Filled, 36 variants), page Misc icons `693:1673` | `329:14075` |

The overlay (#0A0A0A 60%, Blur/sm) has no variable; it is `--overlay` in `src/styles/system.css`.

## Sidebar Navigation

| What | Node |
|---|---|
| Page ❖ Navigation | `696:41434` |
| Frame `Sidebar navigation` (assembled sidebars, expanded and collapsed) | `769:31419` |
| Component set `Sidebar items` (State × Icon only × Level, 12 variants; Leading icon, Arrow, Left badge, Right badge) | `765:2532` |
| Component set `Header card` (State × Icon only, 6 variants) | `765:2385` |
| Component set `User profile card` (State × Icon only, 6 variants) | `765:11047` |
| Component set `Feature cards` (Type × Color, 8 variants) | `769:16436` |
| Usage Guidelines (anatomy, widths, options, item variants) | `771:56482` |
| Sidebar layout architecture – Guidelines (Navigation, Content, Sidebar layouts) | `771:56644` |
| Examples (an app page; the mobile menu with Theme and language, built with Header navigation) | `771:56684` |
| Component set `API icons` (Type × State × Text, 20 variants), page Misc icons `693:1673` | `1356:29600` |

Collapsed: Figma draws 76px; the rows (40px + 20px sides) and the cards (56px + 12px) need 80px, used in code (Contributing/Tokens).

## Tooltip

| What | Node |
|---|---|
| Page ❖ Tooltip | `218:7878` |
| Frame `Tooltip` | `264:8479` |
| Component set `Tooltip` (Side × Details × Color, 32 variants; Left icon, Title, Description) | `218:8460` |
| Usage Guidelines (anatomy, colours, styles) | `801:2750` |

Figma Side names the edge with the tip; the code's `side` is where the tooltip opens (the opposite edge).

## Topbar Navigation

| What | Node |
|---|---|
| Component set `Topbar navigation` (Type × Size, 6 variants: Exchange, Pay × Desktop, Tablet, Mobile), page ❖ Navigation | `773:64348` |
| Component set `Toolbar item` (State, 4 variants; Leading icon, Badge, Arrow) | `761:15379` |
| Component set `Toolbar item button` (State, 4 variants; Badge) | `763:24356` |
| Usage Guidelines (anatomy, sizes, types, toolbar items) | `775:64572` |

The bars carry the GRX logos, so only the toolbar items are in the Design tab. The mobile menu comes from the Navigation Examples (`771:56684`).

## Switch

| What | Node |
|---|---|
| Page ❖ Switch | `265:12929` |
| Component set `Switch` (State × Size × Enabled, 20 variants) | `265:13609` |
| Component set `Switch mode` (Mode × Size, 4 variants) | `265:15133` |
| Component set `Switch label` (Flip × Selected × Details, 8 variants; Sublabel, Description, Link button) | `696:43421` |
| Usage Guidelines (anatomy, sizes, label, states) | `696:43527` |

## Notification Feed

| What | Node |
|---|---|
| Page ❖ Notification feed | `696:16756` |
| Component set `Notification feed` (State, 2 variants; Sublabel, Description, Date, New, Buttons) | `1870:9294` |
| Component set `Notifications misc items` (Header, Tan menu, Footer, Empty) | `2161:16786` |
| Usage Guidelines (anatomy, states, new, description) | `2177:45755` |
| Notification feed – Usage Guidelines (popover, combining, empty, skeleton) | `2177:47320` |
| Examples (the feed from the top bar, light and dark) | `2184:14008` |
| Component set `Transaction type icon` (Size, 3 variants), page Misc icons | `1788:3852` |

## Tab Menu

| What | Node |
|---|---|
| Page ❖ Tab Menu | `574:20271` |
| Component set `Tab menu horizontal` (Quantity 02–06) | `574:32575` |
| Component set `Tab menu vertical` (Quantity 02–09; Content divider) | `574:32759` |
| Component set `Tab menu horizontal item` (State; Icon, Text, Label, Badge) | `574:32525` |
| Component set `Tab menu vertical item` (State; Icon, Arrow, Text, Label, Badge, Transaction icon) | `574:32666` |
| Usage Guidelines (anatomy, layouts, states, behaviour) | `646:32013` |

## Pagination

| What | Node |
|---|---|
| Page ❖ Pagination | `607:4800` |
| Component set `Pagination` (Type: Default, Pagination group) | `630:37034` |
| Component set `Pagination cell` (State, 5 variants) | `608:4909` |
| Usage Guidelines (anatomy, states, types, single page, first and last, truncation) | `630:37035` |

## Progress Bar and Progress Circle

| What | Node |
|---|---|
| Page ❖ Progress bar | `656:3335` |
| Component set `Progress bar` (Percentage: Empty, 10%–100%) | `656:21789` |
| Component set `Progress bar label` (Type: On right, On top, On bottom; Label, Description, Value) | `657:21876` |
| Component set `Progress bar line` (Color: Empty, Primary, Yellow, Green, Blue, Red) | `656:21784` |
| Usage Guidelines, Progress bar | `755:10138` |
| Component set `Circular progress bar` (Size × Percentage, 20 variants; Number) | `659:4751` |
| Usage Guidelines, Circular progress bar | `756:12357` |

## Radio

| What | Node |
|---|---|
| Page ❖ Radio | `136:11302` |
| Component set `Radio` (State × Selected × Size × Destructive, 24 variants) | `136:11127` |
| Component set `Radio label` (Flip × Selected × Details; Sublabel, Description, Link button) | `136:11176` |
| Usage Guidelines (anatomy, sizes, label, states) | `775:68269` |

## Search

| What | Node |
|---|---|
| Page ❖ Search | `166:11922` |
| Component set `Search` (State × Style × Size × Filled; Hint text, Left icon, Right icon, Cursor) | `163:9131` |
| Usage Guidelines (anatomy, sizes, style, state, spacing) | `779:31852` |
| Examples (empty) | `780:55707` |

## Segment Control

| What | Node |
|---|---|
| Page ❖ Segment control | `204:20549` |
| Component set `Segment control` (Quantity 02–06 × Text + icon / Text only / Icon only) | `204:21043` |
| Component set `Segment control item` (State: Default, Hovered, Active-normal, Disabled, Active-red, Active-green) | `204:20934` |
| Usage Guidelines (anatomy, states, types) | `786:69807` |
| Examples (invoice steps, orders filter, Buy and Sell) | `790:5480` |

## Slider

| What | Node |
|---|---|
| Page ❖ Slider | `696:24314` |
| Component set `Slider` (Percentage 0–100%; Label, Sublabel, Value, Details) | `738:27965` |
| Component set `Range slider` (Left range × Right range) | `738:28938` |
| Component set `Control handle` (State × Tooltip × Text) | `738:6802` |
| Usage Guidelines (anatomy, states, label, type, percentages, range) | `747:8144` |
| Examples (Upload logo: zoom with − and +) | `747:8246` |

## Table

| What | Node |
|---|---|
| Component set `Table header cell` (Type × Sort × Actions) | `1556:5408` |
| Component set `Table row cell` (Type × Size md-56 / lg-64 × State) | `1556:11439` |
| Component set `Cell text` (Priority × Orientation; Badge, Description) | `1556:11417` |
| Component set `Sorting icons` | `1559:61007` |
| Component set `Table scroll indicator` | `2203:15865` |
| Usage Guidelines (anatomy, sizes, cells) | `1559:41052` |
| Usage Guidelines (combining items, scroll) | `1559:70411` |
| Examples (Assets, Orders, Empty) | `1560:31309` |

## Chips

| What | Node |
|---|---|
| Page ❖ Chips | `2041:1303` |
| Component set `Сhips` (State × Size md-24 / sm-20 / xs-16 × Remove × Type × Style, 180 variants; the name starts with a Cyrillic С) | `2041:4064` |
| Usage Guidelines (anatomy, sizes, types, styles, states, spacing) | `2058:19411` |
| Usage Guidelines (Assist, Filter, Input, Suggestion chips) | `2058:19498` |

## Multi-value Input

| What | Node |
|---|---|
| Page ❖ Multi-value Input | `2052:14670` |
| Component set `Multi-value Input` (State × Size lg-44 / md-40 / sm-32 × Filled; Top, Bottom, Key: Value, Value) | `2053:1782` |
| Usage Guidelines (anatomy, sizes, states, floating label, spacing) | `2080:30093` |
| Usage Guidelines (input chips: three rows, +N more, Show less) | `2084:5350` |
| Examples (Add new: a coin and its availability) | `2084:7875` |

## Interaction Card

| What | Node |
|---|---|
| Page Interaction card | `1234:4073` |
| Component set `Card` (State Default / Hovered × Type Currency / Icon / Base Icon; Description, Badge) | `1458:5033` |
| Component set `Interaction card` (State Default / Hovered / Active × Filled) | `1450:3359` |
| Example: Withdraw UAH, the methods as cards (dark) | `1458:628` |

No usage guidelines yet. The Withdraw flow that uses the cards is in the GRX Pay redesign file (`XDynk3v9BU5pStqaulzutE`, section Withdraw `63:58899`).
