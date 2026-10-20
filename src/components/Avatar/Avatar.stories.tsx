import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Avatar, avatarColors, avatarSizes, type AvatarProps } from './Avatar';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import photo from '../../assets/avatar-sample.jpg';
import componentFrame from '../../assets/design/avatar/avatar-component.png';
import guidelinesFrame from '../../assets/design/avatar/avatar-guidelines.png';

const STATUSES = ['check', 'pending', 'remove', 'error', 'edit'] as const;

const meta = {
  title: 'Components/Avatar',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Avatar,
  // The docs page is Avatar.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { size: 40, src: photo, name: 'Warren Fritsch', initials: false, shape: 'user', color: undefined, status: undefined, decorative: false },
  argTypes: {
    size: { control: 'select', options: avatarSizes },
    src: { control: 'text' },
    shape: { control: 'inline-radio', options: ['user', 'company'] },
    color: { control: 'select', options: [undefined, ...avatarColors], labels: { undefined: 'grey' } },
    status: { control: 'select', options: [undefined, ...STATUSES], labels: { undefined: 'none' } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const text = { font: 'var(--typo-body-md-medium)', color: 'var(--text-strong-1000)' };
const soft = { font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' };

/** Edit everything in Controls. Clear `src` to see initials or a shape. */
export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** A list of people: the name is written next to each avatar, so screen readers skip the picture. */
export const AListOfPeople: Story = {
  name: 'A list of people',
  render: () => (
    <ul style={{ display: 'grid', gap: 'var(--space-400)', margin: 0, padding: 0, listStyle: 'none', width: 280 }}>
      {[
        { name: 'Warren Fritsch', role: 'Owner', props: { src: photo } },
        { name: 'Sergio Webb', role: 'Accountant', props: { initials: true, color: 'sky' as const } },
        { name: 'Golden Ratio Group', role: 'Company', props: { shape: 'company' as const, color: 'amber' as const } },
      ].map(person => (
        <li key={person.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
          <Avatar size={40} name={person.name} decorative {...person.props} />
          <span style={{ display: 'grid' }}><span style={text}>{person.name}</span><span style={soft}>{person.role}</span></span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('img')).toHaveLength(0);
  },
};

/** A verified account on its own: the avatar is an image named by the person and the status. */
export const AVerifiedAccount: Story = {
  name: 'A verified account',
  args: { size: 64, status: 'check' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Warren Fritsch, verified' })).toBeVisible();
  },
};

/** A photo that doesn't load: initials show instead, and a new photo address tries again. */
export const APhotoThatFails: Story = {
  name: 'A photo that fails',
  args: { size: 56 },
  render: function APhotoThatFails(args: AvatarProps) {
    const [valid, setValid] = useState(false);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-400)' }}>
        <Avatar {...args} initials src={valid ? photo : 'data:image/png;base64,invalid'} />
        <Button onClick={() => setValid(!valid)}>{valid ? 'Use unavailable photo' : 'Use available photo'}</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('WF')).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: 'Use available photo' }));
    await waitFor(() => expect(canvasElement.querySelector('img')).toBeVisible());
  },
};

/* ---- Overview ---- */

/** Photo, person, company and initials. */
export const Kinds: Story = {
  args: { size: 56 },
  render: (args: AvatarProps) => (
    <Showcase>
      <Variant caption="Photo"><Avatar {...args} /></Variant>
      <Variant caption="Person"><Avatar {...args} src={undefined} shape="user" /></Variant>
      <Variant caption="Company"><Avatar {...args} src={undefined} shape="company" name="Golden Ratio Group" /></Variant>
      <Variant caption="Initials"><Avatar {...args} src={undefined} initials name="Sergio Webb" /></Variant>
    </Showcase>
  ),
};

/** Eleven sizes, 120 to 16. */
export const Sizes: Story = {
  args: { src: undefined, status: 'edit' },
  render: (args: AvatarProps) => (
    <Showcase>
      {avatarSizes.map(size => <Variant key={size} caption={size}><Avatar {...args} size={size} /></Variant>)}
    </Showcase>
  ),
};

/** Grey and the fourteen Additional colours: person, company and initials. */
export const Colours: Story = {
  args: { src: undefined, size: 40 },
  render: (args: AvatarProps) => (
    <Showcase column>
      {(['user', 'company', 'initials'] as const).map(kind => (
        <Variant key={kind} caption={{ user: 'Person', company: 'Company', initials: 'Initials' }[kind]}>
          {[undefined, ...avatarColors].map(color => (
            <Avatar key={color ?? 'grey'} {...args} color={color} shape={kind === 'company' ? 'company' : 'user'} initials={kind === 'initials'} name="Sergio Webb" />
          ))}
        </Variant>
      ))}
    </Showcase>
  ),
};

/** No status, then Check, Pending, Remove, Error and Icon (edit). */
export const Statuses: Story = {
  render: (args: AvatarProps) => (
    <Showcase>
      <Variant caption="None"><Avatar {...args} /></Variant>
      {STATUSES.map(status => (
        <Variant key={status} caption={{ check: 'Check', pending: 'Pending', remove: 'Remove', error: 'Error', edit: 'Icon (edit)' }[status]}>
          <Avatar {...args} status={status} />
        </Variant>
      ))}
    </Showcase>
  ),
};

/** The Status badge on its own: five types in five sizes. */
export const StatusBadges: Story = {
  render: () => (
    <Showcase>
      {([24, 20, 16, 12, 8] as const).map(size => (
        <Variant key={size} caption={`${size}px`}>
          {STATUSES.map(type => <StatusBadge key={type} type={type} size={size} />)}
        </Variant>
      ))}
    </Showcase>
  ),
};
