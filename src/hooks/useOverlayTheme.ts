import { useLayoutEffect, useState, type RefObject } from 'react';

/** Body portals need their local theme on docs pages, where each example owns its theme. */
export function useOverlayTheme(root: RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<string>();
  useLayoutEffect(() => {
    const scope = root.current?.closest('[data-theme]');
    if (!scope) return;
    const update = () => setTheme(scope.getAttribute('data-theme') ?? undefined);
    const observer = new MutationObserver(update);
    observer.observe(scope, { attributes: true, attributeFilter: ['data-theme'] });
    update();
    return () => observer.disconnect();
  }, [root]);
  return { 'data-theme': theme };
}
