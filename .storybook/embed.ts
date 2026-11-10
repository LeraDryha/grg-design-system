/**
 * Embedding a story in Lera's portfolio (LeraDryha/portfolio, the GRG case).
 *
 * Only active when the story's frame is opened with `&embed=portfolio`, e.g.
 *   iframe.html?id=in-product-dashboard--live-flow&viewMode=story&embed=portfolio
 * Nothing changes for Storybook itself, its docs pages or the tests.
 *
 * The page that embeds the frame talks to it with postMessage:
 *   → { source: 'grg-portfolio', type: 'inspect', on: boolean }  show the components layer
 *   → { source: 'grg-portfolio', type: 'highlight', name: string | null }  select one component's boxes
 *   → { source: 'grg-portfolio', type: 'theme', theme: 'light' | 'dark' }
 *   → { source: 'grg-portfolio', type: 'colors', component: string, custom: string, label: string }
 *   ← { source: 'grg-embed', type: 'components', items: { name, count, custom, docs }[] }  what the screen is built from
 *   ← { source: 'grg-embed', type: 'hover', name: string | null }  the component under the pointer
 *
 * The layer draws boxes over the product's components (found by their root class) and the pieces made only for
 * one page (marked in CUSTOM). It never takes the pointer: the product stays usable under it.
 */
import { addons } from 'storybook/preview-api';
import { UPDATE_GLOBALS } from 'storybook/internal/core-events';

/** Component folders whose root class is not grg-<kebab-name>. Icon is left out: it is inside almost everything. */
const ROOTS: Record<string, string> = {
  'Accordion': 'grg-accordion', 'Action Button': 'grg-action-button', 'Alert': 'grg-alert', 'Api Icon': 'grg-api-icon',
  'Avatar': 'grg-avatar', 'Badge': 'grg-badge', 'Banner': 'grg-banner', 'Breadcrumbs': 'grg-breadcrumbs', 'Button': 'grg-button',
  'Button Group': 'grg-button-group', 'Checkbox': 'grg-checkbox', 'Chip': 'grg-chip', 'Coin Icon': 'grg-coin-icon',
  'Compact Select': 'grg-compact-select', 'Country Icon': 'grg-country-icon', 'Date Picker': 'grg-date-picker', 'Drawer': 'grg-drawer',
  'Dropdown Menu': 'grg-dropdown-menu', 'Feature Card': 'grg-feature-card', 'Featured Icon': 'grg-featured-icon', 'File Icon': 'grg-file-icon',
  'File Upload': 'grg-file-upload', 'Filter': 'grg-filter', 'Form Field': 'grg-field', 'Inline Select': 'grg-inline-select', 'Input': 'grg-input',
  'Input Otp': 'grg-otp', 'Interaction Card': 'grg-interaction-card', 'Link': 'grg-link', 'Modal': 'grg-modal',
  'Multi-value Input': 'grg-multi-value', 'Notification Feed': 'grg-feed', 'Page Header': 'grg-page-header', 'Pagination': 'grg-pagination',
  'Payment Icon': 'grg-payment-icon', 'Progress Bar': 'grg-progress-bar', 'Progress Circle': 'grg-progress-circle', 'Radio': 'grg-radio',
  'Search': 'grg-search', 'Segment Control': 'grg-segment-control', 'Select': 'grg-select', 'Settings Row': 'grg-settings-row',
  'Sidebar Navigation': 'grg-sidebar', 'Slider': 'grg-slider', 'Social Button': 'grg-social-button', 'Social Icon': 'grg-social-icon',
  'Status Badge': 'grg-status-badge', 'Stepper Dot': 'grg-stepper-dot', 'Switch': 'grg-switch', 'Table': 'grg-table', 'Tab Menu': 'grg-tab-menu',
  'Text Area': 'grg-textarea', 'Tooltip': 'grg-tooltip', 'Topbar Navigation': 'grg-topbar', 'Transaction Icon': 'grg-transaction-icon',
};

/** Pieces made for one page only: they live with that page, not in the system. */
const CUSTOM: Record<string, string> = {
  'Bar of shares': 'grg-ip-shares',
  'Payments chart': 'grg-ip-chart',
};

/** Pages whose docs id doesn't follow the name: icons live in Foundations, Status Badge on the Badge page. */
const DOCS: Record<string, string> = {
  'Api Icon': 'foundations-icons-api-icons--docs', 'Coin Icon': 'foundations-icons-coin-icons--docs',
  'Country Icon': 'foundations-icons-country-icons--docs', 'File Icon': 'foundations-icons-file-format-icons--docs',
  'Payment Icon': 'foundations-icons-payment-method-icons--docs', 'Social Icon': 'foundations-icons-social-icons--docs',
  'Transaction Icon': 'foundations-icons-transaction-icons--docs', 'Status Badge': 'components-badge--docs',
  'Chip': 'components-chips--docs',
};

/** The docs page of a component ("Compact Select" → components-compact-select--docs). */
const docsId = (name: string) => DOCS[name] ?? `components-${name.toLowerCase().replace(/\s+/g, '-')}--docs`;

type Found = { name: string; custom: boolean; el: Element };

const post = (message: Record<string, unknown>) => window.parent.postMessage({ source: 'grg-embed', ...message }, '*');

export function startEmbed() {
  if (new URLSearchParams(window.location.search).get('embed') !== 'portfolio') return;

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.dataset.embedLayer = '';
  Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483000' });
  const style = document.createElement('style');
  // The colours come from the embedding page (its Figma layer); until then the system's info and error colours.
  style.textContent = `
    [data-embed-layer] { --embed-component: var(--info-base-600); --embed-custom: var(--error-base-600); --embed-label: var(--text-inverce); }
    [data-embed-layer] > i { position: absolute; display: block; box-sizing: border-box; border: 1px solid transparent; }
    [data-embed-layer][data-on] > i { border-color: color-mix(in srgb, var(--embed-component) 55%, transparent); }
    [data-embed-layer][data-on] > i[data-custom] { border-style: dashed; border-color: color-mix(in srgb, var(--embed-custom) 75%, transparent); }
    [data-embed-layer] > i[data-sel] { border: 1.5px solid var(--embed-component); background: color-mix(in srgb, var(--embed-component) 8%, transparent); }
    [data-embed-layer] > i[data-sel][data-custom] { border-color: var(--embed-custom); background: color-mix(in srgb, var(--embed-custom) 7%, transparent); }
    [data-embed-layer] > b { position: absolute; padding: 0 var(--space-150); background: var(--embed-component); color: var(--embed-label);
      font: var(--typo-code-code-sm-medium, 500 11px/16px ui-monospace, monospace); white-space: nowrap; border-radius: var(--radius-xxs-2, 2px); }
    [data-embed-layer] > b[data-custom] { background: var(--embed-custom); }
  `;
  document.head.append(style);
  document.body.append(layer);

  let inspect = false;
  let highlighted: string | null = null; // chosen on the embedding page
  let hovered: string | null = null; // under the pointer in the frame
  let found: Found[] = [];
  let lastList = '';

  const find = (): Found[] => {
    const out: Found[] = [];
    const add = (name: string, cls: string, custom: boolean) => {
      for (const el of document.querySelectorAll(`.${cls}`)) {
        // A component nested in one of its own kind (a Select's inner input) counts once
        if (el.parentElement?.closest(`.${cls}`)) continue;
        if (el.closest('[data-embed-layer]')) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        out.push({ name, custom, el });
      }
    };
    Object.entries(ROOTS).forEach(([name, cls]) => add(name, cls, false));
    Object.entries(CUSTOM).forEach(([name, cls]) => add(name, cls, true));
    return out;
  };

  const report = () => {
    const counts = new Map<string, { count: number; custom: boolean }>();
    found.forEach(f => counts.set(f.name, { count: (counts.get(f.name)?.count ?? 0) + 1, custom: f.custom }));
    // In reading order: the first time each one appears, top to bottom, left to right
    const firstAt = new Map<string, number>();
    found.forEach(f => { const r = f.el.getBoundingClientRect(); const at = Math.round(r.top / 24) * 10000 + r.left; if (!firstAt.has(f.name) || at < firstAt.get(f.name)!) firstAt.set(f.name, at); });
    const items = [...counts].sort((a, b) => firstAt.get(a[0])! - firstAt.get(b[0])!)
      .map(([name, { count, custom }]) => ({ name, count, custom, docs: custom ? null : docsId(name) }));
    const list = JSON.stringify(items);
    if (list !== lastList) { lastList = list; post({ type: 'components', items }); }
  };

  const draw = () => {
    found = find();
    report();
    const selected = hovered ?? highlighted;
    const w = window.innerWidth, h = window.innerHeight;
    const parts: string[] = [];
    // Large first, so the small ones are drawn on top
    const visible = found.map(f => ({ ...f, r: f.el.getBoundingClientRect() }))
      .filter(({ r }) => r.bottom > 0 && r.top < h && r.right > 0 && r.left < w)
      .sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
    for (const { name, custom, r } of visible) {
      if (!inspect && name !== selected) continue;
      parts.push(`<i style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px"${custom ? ' data-custom' : ''}${name === selected ? ' data-sel' : ''}></i>`);
    }
    // The name goes under the selected component's lowest box, or over it when there is no room below
    const last = visible.filter(v => v.name === selected).sort((a, b) => b.r.bottom - a.r.bottom)[0];
    if (last) {
      const y = last.r.bottom + 24 < h ? last.r.bottom + 4 : Math.max(0, last.r.top - 22);
      parts.push(`<b style="left:${Math.min(Math.max(0, last.r.left), w - 180)}px;top:${y}px"${last.custom ? ' data-custom' : ''}>${last.name}</b>`);
    }
    if (inspect) layer.dataset.on = ''; else delete layer.dataset.on;
    layer.innerHTML = parts.join('');
  };

  // Redraw when anything may have moved: scrolling inside the product, resizing, the product changing its content.
  let queued = false;
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; draw(); }); };
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);
  // Our own layer's redraws don't count
  new MutationObserver(records => { if (records.some(r => !layer.contains(r.target))) schedule(); }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open'] });
  setInterval(schedule, 500); // transitions and timers that change no attribute

  // The component under the pointer: the smallest box that holds it
  window.addEventListener('pointermove', e => {
    if (!inspect) return;
    let best: Found | null = null, area = Infinity;
    for (const f of found) {
      const r = f.el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) continue;
      if (r.width * r.height < area) { area = r.width * r.height; best = f; }
    }
    const name = best?.name ?? null;
    if (name !== hovered) { hovered = name; post({ type: 'hover', name }); schedule(); }
  });
  document.documentElement.addEventListener('pointerleave', () => { if (hovered) { hovered = null; post({ type: 'hover', name: null }); schedule(); } });

  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.source !== 'grg-portfolio') return;
    if (m.type === 'inspect') { inspect = !!m.on; if (!inspect) hovered = null; schedule(); }
    if (m.type === 'highlight') { highlighted = typeof m.name === 'string' ? m.name : null; schedule(); }
    if (m.type === 'theme' && (m.theme === 'light' || m.theme === 'dark')) addons.getChannel().emit(UPDATE_GLOBALS, { globals: { theme: m.theme } });
    if (m.type === 'colors') {
      const css = (v: unknown) => (typeof v === 'string' && /^[#a-z0-9(),.%\s-]+$/i.test(v) ? v : null);
      (['component', 'custom', 'label'] as const).forEach(k => { const v = css(m[k]); if (v) layer.style.setProperty(`--embed-${k}`, v); });
    }
  });

  // Ask the embedding page for its settings once the product is on screen
  window.addEventListener('load', () => { post({ type: 'ready' }); schedule(); });
  schedule();
}
