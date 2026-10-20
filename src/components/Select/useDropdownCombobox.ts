import { useEffect, type RefObject } from 'react';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

/**
 * PrimeReact 10 Dropdown focuses a hidden read-only input but gives it no name, combobox role, expanded state
 * or active option. This keeps those attributes in sync, so screen readers hear a named combobox and the
 * option highlighted with the arrow keys. Shared by Select, Compact select and Inline select.
 */
export function useDropdownCombobox(
  rootRef: RefObject<HTMLDivElement | null>,
  inputRef: RefObject<HTMLInputElement | null>,
  listId: string,
  label: string,
  describedBy?: string,
  invalid?: boolean,
) {
  useKeyboardNavigation(rootRef);
  useEffect(() => {
    const root = rootRef.current;
    const input = inputRef.current;
    if (!root || !input) return;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-label', label);
    if (describedBy) input.setAttribute('aria-describedby', describedBy);
    else input.removeAttribute('aria-describedby');
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    const sync = () => {
      const list = root.querySelector<HTMLElement>('[role="listbox"]');
      input.setAttribute('aria-expanded', String(!!list));
      if (list) {
        list.id = listId;
        input.setAttribute('aria-controls', listId);
      } else {
        input.removeAttribute('aria-controls');
      }
      const active = list?.querySelector<HTMLElement>('[role="option"][data-p-focused="true"], [role="option"].p-focus');
      if (active?.id) input.setAttribute('aria-activedescendant', active.id);
      else input.removeAttribute('aria-activedescendant');
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-p-focused', 'class'] });
    return () => observer.disconnect();
  }, [rootRef, inputRef, listId, label, describedBy, invalid]);
}
