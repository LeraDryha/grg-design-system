import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { ActionButton } from '../ActionButton/ActionButton';
import './FormField.css';

/*
 * Field parts shared by Input, Select and Text Area (Figma: Floating label 161:20853, Hint text 73:3653,
 * Key: value 73:3662). FormField puts them around a control: the label row floats above the control
 * without taking vertical space, the hint row sits under it.
 */

export type FieldPartState = 'default' | 'active' | 'error' | 'disabled';

export type FieldLabelProps = {
  /** The label text (Figma Edit label) */
  children: ReactNode;
  /** The control this label names */
  htmlFor?: string;
  /** Red asterisk (Figma Star). The control itself carries `required`. */
  required?: boolean;
  /** Additional text after the label (Figma Text); `true` shows "(Optional)" */
  optional?: boolean | string;
  /** Text behind the info button (Figma Icon). Shown as the button's description until Tooltip exists. */
  info?: string;
  /** Figma State: Default, Active (the control has focus), Disabled */
  state?: Exclude<FieldPartState, 'error'>;
  /** false while the label is not shown (it is the control's placeholder): the info button leaves the tab order */
  interactive?: boolean;
};

/** Figma "Floating label": label, required asterisk, additional text and an info button. */
export function FieldLabel({ children, htmlFor, required, optional, info, state = 'default', interactive = true }: FieldLabelProps) {
  const extra = optional === true ? '(Optional)' : optional || null;
  return (
    <span className="grg-field-label" data-state={state}>
      <label className="grg-field-label__text" htmlFor={htmlFor}>
        {children}
        {required && <span className="grg-field-label__star" aria-hidden="true">*</span>}
        {extra && <span className="grg-field-label__extra">{extra}</span>}
      </label>
      {info && (
        <ActionButton
          className="grg-field-label__info"
          icon="information-circle"
          size="xs"
          color="blue"
          aria-label={`More about ${typeof children === 'string' ? children : 'this field'}`}
          title={info}
          disabled={state === 'disabled'}
          tabIndex={interactive ? undefined : -1}
          aria-hidden={interactive ? undefined : true}
        />
      )}
    </span>
  );
}

export type HintTextProps = {
  children: ReactNode;
  id?: string;
  /** Figma State: Default, Error, Disabled */
  state?: Exclude<FieldPartState, 'active'>;
  /** Warning icon before the text (Figma Icon) */
  icon?: boolean;
};

/** Figma "Hint text": a short help or error message under the control. */
export function HintText({ children, id, state = 'default', icon = true }: HintTextProps) {
  return (
    <p className="grg-hint" id={id} data-state={state}>
      {icon && <Icon name="warning-error" size={16} />}
      <span>{children}</span>
    </p>
  );
}

export type KeyValueProps = {
  /** Figma Type = Key: Value shows the key before the value; Type = Value shows only the value */
  keyText?: string;
  value: string;
  disabled?: boolean;
};

/** Figma "Key: value": extra information next to the label or the hint, such as a balance or a limit. */
export function KeyValue({ keyText, value, disabled }: KeyValueProps) {
  return (
    <span className="grg-key-value" data-type={keyText ? 'key-value' : 'value'} data-disabled={disabled || undefined}>
      {keyText && <span className="grg-key-value__key">{keyText}:</span>}
      <span className="grg-key-value__value">{value}</span>
    </span>
  );
}

export type FormFieldProps = {
  /** id of the control inside */
  controlId: string;
  /** id for the hint, so the control can point at it with aria-describedby */
  hintId?: string;
  label?: string;
  required?: boolean;
  optional?: boolean | string;
  info?: string;
  /** false while the label sits inside the empty control as its placeholder */
  labelVisible?: boolean;
  labelState?: FieldLabelProps['state'];
  hint?: ReactNode;
  /** An error replaces the hint and turns it red */
  error?: string;
  hintIcon?: boolean;
  /** Top right (Figma Key: Value) */
  topKey?: string;
  topValue?: string;
  /** Bottom right (Figma Value) */
  bottomValue?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** The frame around a control: label row above (out of the flow, as in Figma), hint row below. */
export function FormField({
  controlId, hintId, label, required, optional, info, labelVisible = true, labelState = 'default',
  hint, error, hintIcon = true, topKey, topValue, bottomValue, disabled, className = '', children,
}: FormFieldProps) {
  const hasTop = !!label || !!topValue;
  const message = error || hint;
  return (
    <div className={`grg-field ${className}`} data-disabled={disabled || undefined}>
      <div className="grg-field__control">
        {hasTop && (
          <div className="grg-field__top">
            {label && (
              <span className="grg-field__label" data-visible={labelVisible || undefined}>
                <FieldLabel htmlFor={controlId} required={required} optional={optional} info={info} state={disabled ? 'disabled' : labelState} interactive={labelVisible}>
                  {label}
                </FieldLabel>
              </span>
            )}
            {topValue && <KeyValue keyText={topKey} value={topValue} disabled={disabled} />}
          </div>
        )}
        {children}
      </div>
      {(message || bottomValue) && (
        <div className="grg-field__bottom">
          {message ? (
            <HintText id={hintId} state={disabled ? 'disabled' : error ? 'error' : 'default'} icon={hintIcon}>
              {message}
            </HintText>
          ) : <span />}
          {bottomValue && <KeyValue value={bottomValue} disabled={disabled} />}
        </div>
      )}
    </div>
  );
}
