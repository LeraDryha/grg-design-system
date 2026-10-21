import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { InputText } from 'primereact/inputtext';
import { ActionButton } from '../ActionButton/ActionButton';
import { HintText } from '../FormField/FormField';
import { Icon } from '../Icon/Icon';
import { ProgressCircle } from '../ProgressCircle/ProgressCircle';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import './Search.css';

/* Figma page ❖ Search: "Search" (163:9131) and "Usage Guidelines" (779:31852). */

export type SearchProps = {
  /** What is typed */
  value?: string;
  defaultValue?: string;
  /** Every change, as it is typed */
  onChange?: (value: string) => void;
  /** Time to search: after a pause in typing (`searchDelay`), on Enter, and when cleared (with "") */
  onSearch?: (value: string) => void;
  /** The pause after the last key before `onSearch`, in ms. 0 searches on Enter only */
  searchDelay?: number;
  /** Figma Size: lg-44, md-40, sm-32 */
  size?: 'lg' | 'md' | 'sm';
  /** Figma Label: the placeholder */
  placeholder?: string;
  /** The field's name for screen readers, such as "Search transactions"; the placeholder disappears as people type */
  'aria-label'?: string;
  /** Figma Hint text */
  hint?: string;
  /** Results are on their way: a small ring in place of the clear button */
  loading?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
};

/**
 * A field to find something in a list or a page. PrimeReact InputText (unstyled) as a native search field: screen
 * readers hear "search", phones show a Search key, Enter searches and Escape clears. The clear button appears as soon
 * as there is text, as the guidelines say.
 */
export function Search({
  value: controlled, defaultValue = '', onChange, onSearch, searchDelay = 300, size = 'md', placeholder = 'Search',
  'aria-label': label = 'Search', hint, loading = false, disabled = false, id: suppliedId, name, className = '',
}: SearchProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  useKeyboardNavigation(inputRef);
  const [local, setLocal] = useState(defaultValue);
  const value = controlled ?? local;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const change = (next: string, delay = searchDelay) => {
    if (controlled === undefined) setLocal(next);
    onChange?.(next);
    clearTimeout(timer.current);
    if (!onSearch) return;
    if (next === '') onSearch('');
    else if (delay > 0) timer.current = setTimeout(() => onSearch(next), delay);
  };
  const clear = () => {
    change('', 0);
    inputRef.current?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      clearTimeout(timer.current);
      onSearch?.(value);
    }
    if (event.key === 'Escape' && value) {
      event.preventDefault();
      clear();
    }
  };

  return (
    <div className={`grg-search ${className}`} data-size={size}>
      <div className="grg-search__box" data-disabled={disabled || undefined} data-filled={value ? true : undefined}>
        <Icon name="search" size={20} className="grg-search__icon" />
        <InputText
          ref={inputRef}
          id={id}
          name={name}
          type="search"
          role="searchbox"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label}
          aria-describedby={hintId}
          aria-busy={loading || undefined}
          onChange={event => change(event.target.value)}
          onKeyDown={onKeyDown}
          className="grg-search__control"
        />
        {loading ? (
          <ProgressCircle size="xs" aria-label="Searching" className="grg-search__loading" />
        ) : (
          value && !disabled && <ActionButton icon="remove" size="sm" aria-label="Clear search" onClick={clear} className="grg-search__clear" />
        )}
      </div>
      {hint && <HintText id={hintId} state={disabled ? 'disabled' : 'default'}>{hint}</HintText>}
    </div>
  );
}
