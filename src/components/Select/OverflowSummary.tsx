import { useLayoutEffect, useRef, useState } from 'react';

/** "Payman, Stripe, Mastercard Gateway and 2 others": as many names as fit, the rest counted (Figma examples) */
export function summaryText(labels: string[], shown: number) {
  const rest = labels.length - shown;
  const names = labels.slice(0, shown).join(', ');
  if (rest <= 0) return names;
  if (shown === 0) return `${labels.length} selected`;
  return `${names} and ${rest} ${rest === 1 ? 'other' : 'others'}`;
}

/**
 * The chosen options of a multi-select, in choice order, comma-separated. Names stay visible until the field
 * is full; the remaining ones are summed up in a label that updates as the field resizes.
 */
export function OverflowSummary({ labels, className = '' }: { labels: string[]; className?: string }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(labels.length);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;
    const fit = () => {
      const width = box.clientWidth;
      let k = labels.length;
      for (; k > 0; k--) {
        measure.textContent = summaryText(labels, k);
        if (measure.scrollWidth <= width) break;
      }
      setShown(k);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [labels]);

  return (
    <span ref={boxRef} className={`grg-overflow-summary ${className}`}>
      <span className="grg-overflow-summary__text">{summaryText(labels, shown)}</span>
      <span ref={measureRef} className="grg-overflow-summary__measure" aria-hidden="true" />
    </span>
  );
}
