import { useEffect, type RefObject } from 'react';

const keyboardNavigation = new WeakMap<Document, boolean>();

/** Text inputs can match :focus-visible after a pointer click. GRG reserves the blue ring for
 * Tab navigation; typing in a field activated by a pointer must keep its Active appearance. */
export function useKeyboardNavigation(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const document = element.ownerDocument;
    const update = (keyboard: boolean) => {
      keyboardNavigation.set(document, keyboard);
      element.toggleAttribute('data-keyboard-navigation', keyboard);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') update(true);
    };
    const onPointerDown = () => update(false);
    update(keyboardNavigation.get(document) ?? false);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      element.removeAttribute('data-keyboard-navigation');
    };
  }, [ref]);
}
