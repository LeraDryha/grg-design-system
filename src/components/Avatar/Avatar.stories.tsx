import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { Button } from '../Button/Button';
import { Avatar, avatarColors, avatarSizes, type AvatarProps } from './Avatar';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';
import photo from '../../assets/avatar-sample.jpg';

const meta = {
  title: 'Components/Avatar',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Avatar,
  // The docs page is Avatar.mdx
  parameters: { layout: 'centered' },
  args: { size: 40, src: photo, name: 'Warren Fritsch', initials: false, shape: 'user', color: undefined, status: undefined, decorative: false },
  argTypes: {
    size: { control: 'select', options: avatarSizes },
    src: { control: 'text' },
    shape: { control: 'inline-radio', options: ['user', 'company'] },
    color: { control: 'select', options: [undefined, ...avatarColors], labels: { undefined: 'grey' } },
    status: { control: 'select', options: [undefined, 'check', 'pending', 'remove', 'error', 'edit'], labels: { undefined: 'none' } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-400)' };
const grid: CSSProperties = { display: 'grid', gap: 'var(--space-400)' };

/** Edit everything in Controls. Clear `src` to see initials or a shape. */
export const Playground: Story = {};

/** Picture and status. */
export const Anatomy: Story = {
  args: { size: 64, status: 'edit' },
  render: (args: AvatarProps) => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-avatar__picture', side: 'left' },
        { n: 2, target: '.grg-avatar__status', side: 'bottom' },
      ]}
    >
      <Avatar {...args} />
    </AnatomyBlock>
  ),
};

/** Eleven sizes, 120 to 16, from the left. */
export const Sizes: Story = {
  args: { src: undefined, status: 'edit' },
  render: (args: AvatarProps) => <div style={{ ...row, alignItems: 'flex-end' }}>{avatarSizes.map(size => <Avatar key={size} {...args} size={size} />)}</div>,
};

/** Photo, person, company and initials, from the left. */
export const Kinds: Story = {
  args: { size: 56 },
  render: (args: AvatarProps) => (
    <div style={row}>
      <Avatar {...args} />
      <Avatar {...args} src={undefined} shape="user" />
      <Avatar {...args} src={undefined} shape="company" name="Golden Ratio Group" />
      <Avatar {...args} src={undefined} initials name="Sergio Webb" />
    </div>
  ),
};

/** Grey and the fourteen Additional colours: person, company and initials, from the top. */
export const Colours: Story = {
  args: { src: undefined, size: 40 },
  render: (args: AvatarProps) => (
    <div style={grid}>
      {(['user', 'company', 'initials'] as const).map(kind => (
        <div key={kind} style={row}>
          {[undefined, ...avatarColors].map(color => (
            <Avatar key={color ?? 'grey'} {...args} color={color} shape={kind === 'company' ? 'company' : 'user'} initials={kind === 'initials'} name="Sergio Webb" />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** No status, then Check, Pending, Remove, Error and Icon (edit), from the left. */
export const Statuses: Story = {
  render: (args: AvatarProps) => (
    <div style={row}>
      {([undefined, 'check', 'pending', 'remove', 'error', 'edit'] as const).map(status => <Avatar key={status ?? 'none'} {...args} status={status} />)}
    </div>
  ),
};

/** The Status badge on its own: five types in five sizes (24, 20, 16, 12 and 8). */
export const StatusBadges: Story = {
  render: () => (
    <div style={grid}>
      {([24, 20, 16, 12, 8] as const).map(size => (
        <div key={size} style={row}>
          {(['check', 'pending', 'remove', 'error', 'edit'] as const).map(type => <StatusBadge key={type} type={type} size={size} />)}
        </div>
      ))}
    </div>
  ),
};

/** A failed photo falls back to initials; changing its source retries loading. */
export const PhotoRecovery: Story = {
  render: function PhotoRecovery(args: AvatarProps) {
    const [valid, setValid] = useState(false);
    return <div style={row}>
      <Avatar {...args} initials src={valid ? photo : 'data:image/png;base64,invalid'} />
      <Button onClick={() => setValid(!valid)}>{valid ? 'Use unavailable photo' : 'Use available photo'}</Button>
    </div>;
  },
};
