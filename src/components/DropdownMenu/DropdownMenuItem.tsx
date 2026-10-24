import { Icon } from '../Icon/Icon';
import { Badge, type BadgeProps } from '../Badge/Badge';
import { CheckboxMark } from '../Checkbox/Checkbox';
import { OptionPicture, type SelectOption } from '../Select/options';
import './DropdownMenuItem.css';

/** What a row of a dropdown can show (Figma "Dropdown menu item", 274:9333) */
export type DropdownMenuItemContent = Omit<SelectOption, 'value' | 'listLabel'> & {
  /** A second line under the label (Figma Description) */
  description?: string;
  /** A badge after the label, such as "PRO" or "Upgrade" (Figma Badge, Light sm-20 Info by default) */
  badge?: string | Pick<BadgeProps, 'label' | 'color' | 'variant'>;
};

export type DropdownMenuItemProps = DropdownMenuItemContent & {
  /** Figma State = Selected in a single-choice list: a check at the end */
  selected?: boolean;
  /** Figma Checkbox = On: a multi-choice list, with a checkbox at the end */
  multiple?: boolean;
  /** With multiple: a half-checked box, as on Select all when some options are chosen */
  indeterminate?: boolean;
  /** Figma Arrow: the row opens a submenu */
  arrow?: boolean;
};

/**
 * The content of one dropdown row: picture, label and description, badge, and at the end a check, a checkbox
 * or an arrow. The list around it (Select, Dropdown Menu) gives the row its hover, focus and keyboard behaviour.
 */
export function DropdownMenuItem({ label, description, badge, selected = false, multiple = false, indeterminate = false, arrow = false, disabled, ...picture }: DropdownMenuItemProps) {
  const hasPicture = !!(picture.icon || picture.country || picture.coin || picture.paymentMethod || picture.avatar || picture.social);
  const badgeProps = typeof badge === 'string' ? { label: badge } : badge;
  return (
    <span
      className="grg-menu-item"
      data-basic={!hasPicture || undefined}
      data-description={description ? true : undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
    >
      {hasPicture && <OptionPicture option={{ value: '', label, ...picture }} large={!!description} />}
      <span className="grg-menu-item__text">
        <span className="grg-menu-item__label">{label}</span>
        {description && <span className="grg-menu-item__description">{description}</span>}
      </span>
      {badgeProps && (
        <Badge className="grg-menu-item__badge" variant="light" size="sm" type="text" color="info" leftIcon={null} rightIcon={null} {...badgeProps} />
      )}
      {arrow && <Icon name="direction-right" size={24} className="grg-menu-item__arrow" />}
      {multiple ? (
        <CheckboxMark checked={selected} indeterminate={indeterminate} size="md" disabled={disabled} className="grg-menu-item__checkbox" />
      ) : (
        selected && <Icon name="check" size={24} className="grg-menu-item__check" />
      )}
    </span>
  );
}
