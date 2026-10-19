import { useEffect, useId, useRef, useState } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { ActionButton } from '../ActionButton/ActionButton';
import { useOverlayTheme } from '../../hooks/useOverlayTheme';

/** Shared label help: PrimeReact handles hover and focus; click also supports touch. */
export function FieldInfo({ text, label, disabled, interactive }: {
  text: string; label: string; disabled: boolean; interactive: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const tooltip = useRef<Tooltip>(null);
  const [open, setOpen] = useState(false);
  const [instance, setInstance] = useState(0);
  const themeProps = useOverlayTheme(root);
  useEffect(() => {
    if (!interactive || disabled) setOpen(false);
  }, [interactive, disabled]);
  useEffect(() => {
    if (!open) return;
    // PrimeReact 10's global Escape handler can throw after rapid focus changes, and hide()
    // ignores dismissal while a non-auto-hiding tooltip is hovered. Reset this instance instead.
    const dismiss = () => { setOpen(false); setInstance(value => value + 1); };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      dismiss();
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !tooltip.current?.getElement()?.contains(target)) dismiss();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape, true);
    };
  }, [open]);
  return <span ref={root} className="grg-field-info">
    <ActionButton className="grg-field-label__info" data-field-info={id}
      icon="information-circle" size="xs" color="blue" aria-label={label}
      aria-describedby={open && interactive && !disabled ? id : undefined}
      disabled={disabled} tabIndex={interactive ? undefined : -1}
      aria-hidden={interactive ? undefined : true}
      onClick={event => tooltip.current?.show(event as unknown as Parameters<Tooltip['show']>[0])}
    />
    {interactive && !disabled && <Tooltip key={instance} ref={tooltip} id={id} target={`[data-field-info="${id}"]`}
      content={text} position="top" event="both" autoHide={false} closeOnEscape={false}
      className="grg-field-tooltip" onShow={() => setOpen(true)} onHide={() => setOpen(false)}
      pt={{
        // PrimeReact 10 marks visible tooltips aria-hidden; expose the description to assistive tools.
        root: options => ({ 'aria-hidden': false, 'data-placement': options?.context.bottom ? 'bottom' : 'top', ...themeProps }),
        arrow: { className: 'grg-field-tooltip__arrow' },
        text: { className: 'grg-field-tooltip__text' },
      }}
    />}
  </span>;
}
