/* The focus ring is for the keyboard. Browsers also show :focus-visible after some mouse and touchpad presses (a
   checkbox label, a field, a control that moves focus itself), so the page remembers how it was last used and
   system.css turns the ring off after a pointer press. Tab and the arrow keys bring it back. */

const NAVIGATION = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']);
const EDITABLE = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]';

/** Call once when the app starts: keeps `data-input-modality` ("keyboard" or "pointer") on the root element. */
export function trackInputModality(doc: Document = document) {
  const root = doc.documentElement;
  const set = (modality: 'keyboard' | 'pointer') => {
    if (root.dataset.inputModality !== modality) root.dataset.inputModality = modality;
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (!NAVIGATION.has(event.key) || event.metaKey || event.ctrlKey || event.altKey) return;
    // Arrows inside a text field move the caret, not the focus
    if (event.key !== 'Tab' && (event.target as Element | null)?.closest?.(EDITABLE)) return;
    set('keyboard');
  };
  const onPointerDown = () => set('pointer');
  doc.addEventListener('keydown', onKeyDown, true);
  doc.addEventListener('pointerdown', onPointerDown, true);
  return () => {
    doc.removeEventListener('keydown', onKeyDown, true);
    doc.removeEventListener('pointerdown', onPointerDown, true);
  };
}
