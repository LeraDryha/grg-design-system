import { useState, type Dispatch, type SetStateAction } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Alert } from '../../components/Alert/Alert';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Avatar, type AvatarColor } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Modal } from '../../components/Modal/Modal';
import { Search } from '../../components/Search/Search';
import { Select } from '../../components/Select/Select';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { AppFrame } from '../shared/AssetsApp';
import { formatDateTime } from '../../locale/format';

/* GRX Pay redesign, file "Global Settings", section Members (367:24800): the team list, Add member, Edit member and
   Delete member. A small business's team; invented test addresses only. */

export type Role = 'Owner' | 'Admin' | 'Agent' | 'Accountant';
/** The roles a member can be given; there is one owner, and ownership isn't changed here. Required: no clear button */
const ROLES = [{ value: 'Admin', label: 'Admin' }, { value: 'Agent', label: 'Agent' }, { value: 'Accountant', label: 'Accountant' }];
/** The Figma note under Role: Alert's long content, a short title and the text as its description (plain text: the role names aren't bold as in Figma) */
const ROLES_NOTE = 'Admin has access to all functionalities, excluding the ability to modify ownership. '
  + 'Agents have access to information related to the invoices they created; withdrawals, payouts, and API management are unavailable. '
  + 'Accountants are responsible for managing funds, by reviewing invoices, transactions, and reports.';

export type Member = {
  email: string; role: Role; addedAt: Date;
  /** Until the invitation is accepted: grey avatar, Waiting for confirmation */
  waiting?: boolean;
  /** One colour group per person (Avatar); a waiting member stays grey */
  color?: AvatarColor;
};

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);
/** Foundations → Formats: 10 Nov 2026, 12:49 */
const short = (d: Date) => formatDateTime(d);
/** You: the account in the bar (Guadalupe Schimmel), the owner until Settings hands ownership to someone else */
export const YOU = 'g.schimmel@company.test';

export const startMembers: Member[] = [
  { email: YOU, role: 'Owner', addedAt: daysAgo(412), color: 'amber' },
  { email: 'leo.okafor@company.test', role: 'Agent', addedAt: daysAgo(2), waiting: true },
  { email: 'hana.sato@company.test', role: 'Agent', addedAt: daysAgo(38), color: 'pink' },
  { email: 'priya.raman@company.test', role: 'Accountant', addedAt: daysAgo(96), color: 'purple' },
  { email: 'tomas.novak@company.test', role: 'Agent', addedAt: daysAgo(187), color: 'green' },
  { email: 'marco.lindqvist@company.test', role: 'Admin', addedAt: daysAgo(353), color: 'sky' },
];

/** Initials from the address: "leo.okafor@…" → LO */
const nameOf = (email: string) => email.split('@')[0].split(/[._-]+/).filter(Boolean).join(' ');
const valid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ---- The list ---- */

function MembersTable({ members, onEdit, onDelete }: { members: Member[]; onEdit: (member: Member) => void; onDelete: (member: Member) => void }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = members.filter(m => !q || m.email.includes(q));
  const columns: TableColumn<Member>[] = [
    { id: 'email', header: 'Email', width: '36%', cell: row => (
      <TableText orientation="horizontal" title={row.email} badge={row.email === YOU ? { label: 'You' } : undefined}
        leading={<Avatar size={32} initials name={nameOf(row.email)} color={row.waiting ? undefined : row.color} decorative />} />
    ) },
    { id: 'role', header: 'Role', width: '16%', cell: row => <TableText title={row.role} /> },
    { id: 'added', header: 'Added', width: '20%', sortValue: row => row.addedAt.getTime(), cell: row => <TableText title={short(row.addedAt)} /> },
    { id: 'status', header: 'Status', cell: row => (
      <Badge label={row.waiting ? 'Waiting for confirmation' : 'Confirmed'} variant="light" size="sm" color={row.waiting ? 'neutral' : 'success'} leftIcon={null} rightIcon={null} />
    ) },
  ];
  return (
    <div className="grg-ip-surface__section">
      <div className="grg-ip-toolbar">
        <Search size="sm" aria-label="Search members by email" placeholder="Email" value={query} onChange={setQuery} className="grg-ip-toolbar__search" />
      </div>
      <Table aria-label="Members" rows={rows} rowKey={row => row.email} rowLabel={row => `${row.email}, ${row.role}`} columns={columns}
        // The owner and you can't be edited or deleted from here
        actions={row => (row.role === 'Owner' || row.email === YOU ? null : (
          <>
            <ActionButton icon="pencil" size="sm" aria-label={`Edit ${row.email}`} onClick={() => onEdit(row)} />
            <ActionButton icon="trash" size="sm" color="red" aria-label={`Delete ${row.email}`} onClick={() => onDelete(row)} />
          </>
        ))}
        empty={{ title: 'No members with this email', subtitle: 'Check the spelling, or search by another part of the address' }} />
    </div>
  );
}

/* ---- The flow ---- */

type View = { kind: 'add' } | { kind: 'edit'; email: string } | { kind: 'delete'; email: string };

export type MembersState = [Member[], Dispatch<SetStateAction<Member[]>>];

/** The Members page with its modal, for any app that holds it (this page, the Dashboard). An app that also shows
 *  Settings passes one list to both, so a new owner shows here too */
export function useMembers(shared?: MembersState) {
  const own = useState(startMembers);
  const [members, setMembers] = shared ?? own;
  const [view, setView] = useState<View | null>(null);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { toast } = useMessages();
  const close = () => setView(null);
  const current = view && view.kind !== 'add' ? members.find(m => m.email === view.email) ?? null : null;

  const add = () => { setEmail(''); setEmailTouched(false); setRole(null); setView({ kind: 'add' }); };
  const edit = (member: Member) => { setRole(member.role); setView({ kind: 'edit', email: member.email }); };

  // Add member: a taken address says so at once; a malformed one once the field is left
  const typed = email.trim().toLowerCase();
  const taken = members.some(m => m.email === typed);
  const emailError = taken ? 'This person is already a member'
    : emailTouched && typed && !valid(typed) ? 'Enter an email like name@company.com' : undefined;
  const canInvite = valid(typed) && !taken && !!role;

  const invite = () => {
    // The new member goes on top, under the first row (the owner), and waits until the invitation is accepted
    setMembers(([first, ...rest]) => [first, { email: typed, role: role as Role, addedAt: new Date(), waiting: true }, ...rest]);
    close();
    toast({ status: 'success', title: 'Invitation sent', description: `${typed} will receive an email invitation to your company soon`, duration: 5000 });
  };
  const save = () => {
    setMembers(list => list.map(m => (m.email === current!.email ? { ...m, role: role as Role } : m)));
    close();
    toast({ status: 'success', title: 'Role updated', duration: 3000 });
  };
  const remove = () => {
    setMembers(list => list.filter(m => m.email !== current!.email));
    close();
    toast({ status: 'success', title: 'Member deleted', duration: 3000 });
  };

  const content = (
    <main className="grg-ip-page">
      <div className="grg-ip-page__head">
        <h1 className="grg-ip-page__title">Members</h1>
        <Button variant="primary" leftIcon="plus" onClick={add}>Add member</Button>
      </div>
      <div className="grg-ip-surface">
        <MembersTable members={members} onEdit={edit} onDelete={member => setView({ kind: 'delete', email: member.email })} />
      </div>
    </main>
  );

  // As wide as the modal's content, as in Figma
  const note = <Alert className="grg-ip-roles" status="info" title="Roles" description={ROLES_NOTE} closable={false} />;
  // One modal at a time; its content follows the task (Modal: never a modal from a modal)
  const modal = view?.kind === 'add' ? {
    title: 'Add member', description: 'Invite your new team member',
    primaryAction: { label: 'Send invite', disabled: !canInvite, onClick: invite },
    children: <>
      <Input label="Email" required inputType="email" autoComplete="off" value={email} error={emailError}
        onValueChange={setEmail} onBlur={() => setEmailTouched(true)} />
      <Select label="Role" required icon={false} options={ROLES} value={role} onChange={setRole} />
      {note}
    </>,
  } : view?.kind === 'edit' && current ? {
    title: 'Edit member', description: 'You can assign a new role to a member',
    primaryAction: { label: 'Save changes', disabled: role === current.role, onClick: save },
    children: <>
      <Input label="Email" value={current.email} disabled hint="The email can’t be changed" hintIcon={false} />
      <Select label="Role" required icon={false} options={ROLES} value={role} onChange={setRole} />
      {note}
    </>,
  } : view?.kind === 'delete' && current ? {
    title: 'Delete a member?', description: `After this action ${current.email} won’t be able to log in to the company anymore`,
    status: 'error' as const, statusIcon: 'remove-circle-filled' as const, destructive: true,
    primaryAction: { label: 'Delete', onClick: remove }, secondaryAction: { label: 'Cancel', onClick: close },
  } : null;

  return {
    content,
    overlays: (
      <Modal appendTo="self" visible={!!modal} onHide={close} footerType="fill" title={modal?.title ?? ''} {...modal} />
    ),
  };
}

function MembersApp() {
  const members = useMembers();
  return <><AppFrame current="members">{members.content}</AppFrame>{members.overlays}</>;
}

/** The Members page, adding, editing and deleting a member: one working flow */
export function MembersFlow() {
  return <MessagesProvider appendTo="self"><MembersApp /></MessagesProvider>;
}
