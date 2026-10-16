import { useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../components/Icon/Icon';
import { Input } from '../components/Input/Input';
import { SocialIcon, grayPlatforms, platformLabels, socialPlatforms, type SocialPlatform } from '../components/SocialIcon/SocialIcon';
import { baseIconNames } from '../icons/names';
import tokens from '../tokens/tokens.json';
import './Foundations.css';

/* Blocks for the Foundations pages. The data comes from src/tokens/tokens.json, generated from Figma. */

const groupOf = (figma: string) => figma.split('/')[0];

/** Semantic colours grouped as in Figma, each with its light and dark value. */
export function SemanticColors({ group }: { group: string }) {
  const rows = tokens.semantic.filter(t => groupOf(t.figma) === group);
  return (
    <table className="sb-unstyled fdn-table">
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Light</th>
          <th scope="col">Dark</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(t => (
          <tr key={t.css}>
            <td>
              <code>{t.css}</code>
              <span className="fdn-muted">{t.figma}</span>
            </td>
            <td><Swatch hex={t.lightHex} label={t.light} /></td>
            <td><Swatch hex={t.darkHex} label={t.dark} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <span className="fdn-swatch">
      <span className="fdn-swatch__chip" style={{ background: hex }} aria-hidden="true" />
      <span>
        {label}
        <span className="fdn-muted">{hex}</span>
      </span>
    </span>
  );
}

/** Primitive palettes: raw values that semantic tokens point at. */
export function Palettes() {
  const palettes = [...new Set(tokens.primitives.map(t => groupOf(t.figma)))];
  return (
    <div className="sb-unstyled fdn-palettes">
      {palettes.map(p => (
        <section key={p} aria-label={p}>
          <h3 className="fdn-palette__name">{p}</h3>
          <ul className="fdn-palette">
            {tokens.primitives.filter(t => groupOf(t.figma) === p).map(t => (
              <li key={t.css}>
                <span className="fdn-palette__chip" style={{ background: t.hex }} aria-hidden="true" />
                <span>{t.figma.split('/')[1]}</span>
                <span className="fdn-muted">{t.hex}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Text styles with a live sample set in the style's token. */
export function TextStyles({ family }: { family?: string }) {
  const rows = tokens.text.filter(t => !family || t.family === family);
  return (
    <table className="sb-unstyled fdn-table">
      <thead>
        <tr>
          <th scope="col">Style</th>
          <th scope="col">Sample</th>
          <th scope="col">Size / line height</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(t => (
          <tr key={t.id}>
            <td>
              <code>{t.css}</code>
              <span className="fdn-muted">{t.name}</span>
            </td>
            <td>
              <span style={{ font: `var(${t.css})`, letterSpacing: `var(${t.css}-tracking)` }}>The quick brown fox</span>
            </td>
            <td className="fdn-nowrap">
              {t.size} / {t.lineHeight}px · {t.weight}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SpacingScale() {
  return (
    <table className="sb-unstyled fdn-table">
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          <th scope="col"><span className="sr-only">Preview</span></th>
        </tr>
      </thead>
      <tbody>
        {tokens.space.map(t => (
          <tr key={t.css}>
            <td><code>{t.css}</code></td>
            <td>{t.px}px</td>
            <td><span className="fdn-bar" style={{ width: `var(${t.css})` }} aria-hidden="true" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RadiusScale() {
  return (
    <ul className="sb-unstyled fdn-tiles">
      {tokens.radius.map(t => (
        <li key={t.css}>
          <span className="fdn-tile" style={{ borderRadius: `var(${t.css})` }} aria-hidden="true" />
          <code>{t.css}</code>
          <span className="fdn-muted">{t.px === 999 ? 'Fully rounded' : `${t.px}px`}</span>
        </li>
      ))}
    </ul>
  );
}

/** Shadows take their value from the theme: the dark theme has its own recipe with a light inner edge. */
export function ShadowScale() {
  return (
    <ul className="sb-unstyled fdn-tiles">
      {tokens.shadows.map(t => (
        <li key={t.css}>
          <span className="fdn-tile fdn-tile--raised" style={{ boxShadow: `var(${t.css})` }} aria-hidden="true" />
          <code>{t.css}</code>
          <span className="fdn-muted">{t.figma}</span>
        </li>
      ))}
    </ul>
  );
}

/** Shows its content in a given theme, on the theme's canvas. */
export function Themed({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div className="sb-unstyled grg-theme fdn-themed" data-theme={theme}>
      {children}
    </div>
  );
}

/** The whole icon set with a search; click an icon to copy its name. */
export function IconGallery() {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');
  const shown = baseIconNames.filter(n => n.includes(query.trim().toLowerCase().replace(/\s+/g, '-')));
  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
    } catch {
      setCopied('');
    }
  }
  return (
    <div className="sb-unstyled fdn-icons">
      <div className="fdn-icons__search">
        <Input label="Search icons" leftIcon="search" value={query} onValueChange={setQuery} />
        <span className="fdn-muted">{shown.length} of {baseIconNames.length}</span>
      </div>
      <ul className="fdn-icons__grid">
        {shown.map(name => (
          <li key={name}>
            <button type="button" className="fdn-icons__cell" onClick={() => copy(name)} aria-label={`Copy icon name ${name}`}>
              <Icon name={name} size={24} />
              <span>{name}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="grg-sr-only" role="status">{copied && `Copied ${copied}`}</p>
      {copied && <p className="fdn-icons__copied" aria-hidden="true">Copied <code>{copied}</code></p>}
    </div>
  );
}

/** The four icon sizes side by side. */
export function IconSizes({ name = 'trash' }: { name?: IconName }) {
  return (
    <ul className="sb-unstyled fdn-icon-sizes">
      {([24, 20, 16, 12] as const).map(size => (
        <li key={size}>
          <span className="fdn-icon-sizes__box"><Icon name={name} size={size} /></span>
          <span>{size} × {size}</span>
        </li>
      ))}
    </ul>
  );
}

/** Social icons in one style; click an icon to copy its platform name. */
export function SocialIconGallery({ variant }: { variant: 'brand' | 'gray' }) {
  const [copied, setCopied] = useState('');
  const shown = variant === 'gray' ? grayPlatforms : socialPlatforms;
  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
    } catch {
      setCopied('');
    }
  }
  return (
    <div className="sb-unstyled fdn-icons">
      <ul className="fdn-icons__grid">
        {shown.map(name => (
          <li key={name}>
            <button type="button" className="fdn-icons__cell" onClick={() => copy(name)} aria-label={`Copy platform name ${name}`}>
              <SocialIcon platform={name} variant={variant} size={24} />
              <span>{platformLabels[name]}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="grg-sr-only" role="status">{copied && `Copied ${copied}`}</p>
      {copied && <p className="fdn-icons__copied" aria-hidden="true">Copied <code>{copied}</code></p>}
    </div>
  );
}

/** The two social icon sizes side by side. */
export function SocialIconSizes({ platform = 'facebook' }: { platform?: SocialPlatform }) {
  return (
    <ul className="sb-unstyled fdn-icon-sizes">
      {([24, 20] as const).map(size => (
        <li key={size}>
          <span className="fdn-icon-sizes__box"><SocialIcon platform={platform} size={size} /></span>
          <span>{size} × {size}</span>
        </li>
      ))}
    </ul>
  );
}
