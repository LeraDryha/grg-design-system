import { useEffect, useState } from 'react';
import { DatePickerPanel } from '../../components/DatePicker/DatePickerPanel';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { ProgressCircle } from '../../components/ProgressCircle/ProgressCircle';
import { RadioGroup } from '../../components/Radio/Radio';
import { RadioLabel } from '../../components/RadioLabel/RadioLabel';
import { Select } from '../../components/Select/Select';
import { TabMenu } from '../../components/TabMenu/TabMenu';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { SettingsList, SettingsRow } from '../../components/SettingsRow/SettingsRow';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { AppFrame, startAssets } from '../shared/AssetsApp';
import { pad, shift, startOf, type Range } from '../shared/period';
import { YOU, personName, startMembers } from '../Members/Members';
import { formatDateTime, formatPeriod } from '../../locale/format';
import { startTransactions } from '../Transactions/Transactions';
import reportsImage from '../../assets/in-product/reports.png';
import verifyingImage from '../../assets/in-product/verification-in-progress.png';

/* GRX Pay redesign, file "Global Settings": Reporting - Empty (374:82351), the states before and during verification;
   Reporting (374:82446), version 3: the Settlement Report with its parameters in a modal and the report history.
   The reports are made in the browser from the demo's test transactions, as CSV or a simple PDF. */

export type ReportingProps = {
  /** Verified: the reports. Not verified: they open after verification. Verifying: the documents are being checked */
  account?: 'verified' | 'not-verified' | 'verifying';
  /** The history starts with reports, or empty */
  history?: 'some' | 'none';
};

type Format = 'csv' | 'pdf';
type Report = { id: string; from: Date; to: Date; format: Format; by: string; createdAt: Date; status: 'Processing' | 'Generated'; currencies: string[]; zone: string };

const CURRENCIES = startAssets.map(a => ({ value: a.code, label: a.code, listLabel: `${a.name} ${a.code}`, coin: a.coin }));
/** The time zones people pick most, with their offsets in November */
const ZONES = [
  '(UTC−08:00) America/Los_Angeles', '(UTC−05:00) America/New_York', '(UTC−03:00) America/Sao_Paulo', '(UTC+00:00) Europe/London',
  '(UTC+01:00) Europe/Berlin', '(UTC+01:00) Europe/Paris', '(UTC+01:00) Europe/Warsaw', '(UTC+02:00) Europe/Kyiv', '(UTC+02:00) Europe/Athens',
  '(UTC+03:00) Europe/Istanbul', '(UTC+04:00) Asia/Dubai', '(UTC+05:30) Asia/Kolkata', '(UTC+07:00) Asia/Bangkok', '(UTC+08:00) Asia/Singapore',
  '(UTC+09:00) Asia/Tokyo', '(UTC+11:00) Australia/Sydney', '(UTC+13:00) Pacific/Auckland',
].map(zone => ({ value: zone, label: zone }));
const DEFAULT_ZONE = '(UTC+02:00) Europe/Kyiv';

/** The periods a report covers (Figma: a select with "Last month") */
const PERIODS: { value: string; label: string; range: (today: Date) => [Date, Date] }[] = [
  { value: 'last-month', label: 'Last month', range: t => [new Date(t.getFullYear(), t.getMonth() - 1, 1), new Date(t.getFullYear(), t.getMonth(), 0)] },
  { value: 'this-month', label: 'This month', range: t => [new Date(t.getFullYear(), t.getMonth(), 1), startOf(t)] },
  { value: 'last-7-days', label: 'Last 7 days', range: t => [shift(t, -6), startOf(t)] },
  { value: 'last-30-days', label: 'Last 30 days', range: t => [shift(t, -29), startOf(t)] },
  { value: 'last-3-months', label: 'Last 3 months', range: t => [new Date(t.getFullYear(), t.getMonth() - 3, t.getDate()), startOf(t)] },
  { value: 'year-to-date', label: 'Year to date', range: t => [new Date(t.getFullYear(), 0, 1), startOf(t)] },
];

/** 2026-10-01, and 2026-11-02, 09:14:05, as in the Figma table */
/** ISO dates inside the files and their names, for spreadsheets and sorting; the screen uses Foundations → Formats */
const day = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const stamp = (d: Date) => `${day(d)}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const daysAgo = (days: number, hour = 10) => { const d = shift(new Date(), -days); d.setHours(hour, 14, 5); return d; };

const startReports = (): Report[] => {
  const today = new Date();
  const [lastFrom, lastTo] = PERIODS[0].range(today);
  const [septFrom, septTo] = PERIODS[0].range(new Date(today.getFullYear(), today.getMonth() - 1, 15));
  return [
    { id: 'r3', from: shift(today, -9), to: shift(today, -3), format: 'csv', by: 'priya.raman@company.test', createdAt: daysAgo(2, 16), status: 'Generated', currencies: [], zone: DEFAULT_ZONE },
    { id: 'r2', from: lastFrom, to: lastTo, format: 'pdf', by: YOU, createdAt: daysAgo(7, 9), status: 'Generated', currencies: ['ETH', 'BTC'], zone: DEFAULT_ZONE },
    { id: 'r1', from: septFrom, to: septTo, format: 'csv', by: startMembers.find(m => m.role === 'Admin')!.email, createdAt: daysAgo(38, 11), status: 'Generated', currencies: [], zone: DEFAULT_ZONE },
  ];
};

/* ---- The files: the demo's transactions in the period and currencies, made in the browser ---- */

const rowsOf = (r: Report) => startTransactions
  .filter(t => t.createdAt >= startOf(r.from) && t.createdAt < shift(r.to, 1) && (!r.currencies.length || r.currencies.includes(t.code)))
  .map(t => [t.id, t.kind, t.status, stamp(t.createdAt), String(t.amount), t.code, t.fee]);
const HEAD = ['Transaction ID', 'Type', 'Status', 'Created at', 'Amount', 'Currency', 'Fee'];

const csv = (r: Report) => [HEAD, ...rowsOf(r)].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

/** A one-page PDF with the report as lines of text (Helvetica), written by hand: a few objects and their offsets */
const pdf = (r: Report) => {
  const lines = [`Settlement Report ${day(r.from)} - ${day(r.to)}`, `Time zone: ${r.zone.replace('−', '-')}`, `Currencies: ${r.currencies.join(', ') || 'All'}`, '',
    HEAD.join('  |  '), ...rowsOf(r).map(row => row.join('  |  ')), '', 'Test data, made in the GRG Design System Storybook'];
  const text = lines.map((line, i) => `BT /F1 ${i === 0 ? 14 : 8} Tf 40 ${800 - i * 16} Td (${line.replace(/[\\()]/g, m => `\\${m}`)}) Tj ET`).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = objects.map((object, i) => { const at = body.length; body += `${i + 1} 0 obj\n${object}\nendobj\n`; return at; });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  return `${body}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
};

const download = (r: Report) => {
  const blob = new Blob([r.format === 'csv' ? csv(r) : pdf(r)], { type: r.format === 'csv' ? 'text/csv' : 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `settlement-report_${day(r.from)}_${day(r.to)}.${r.format}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

/* ---- The page ---- */

type Draft = { currencies: string[]; zone: string; period: string; custom: Range | null; format: Format;
  /** Custom period…: the modal's calendar step, with the dates being chosen */
  picking?: [Date | null, Date | null] };
const startDraft = (): Draft => ({ currencies: [], zone: DEFAULT_ZONE, period: 'last-month', custom: null, format: 'csv' });

/** The Reporting page with its modal, for any app that holds it */
export function useReporting({ account = 'verified', history = 'some' }: ReportingProps = {}) {
  const [reports, setReports] = useState<Report[]>(() => (history === 'none' ? [] : startReports()));
  const [draft, setDraft] = useState<Draft | null>(null);
  const { toast } = useMessages();

  // A new report is ready a few seconds after it is asked for
  const processing = reports.some(r => r.status === 'Processing');
  useEffect(() => {
    if (!processing) return;
    const timer = window.setTimeout(() => setReports(list => list.map(r => (r.status === 'Processing' ? { ...r, status: 'Generated' } : r))), 4000);
    return () => window.clearTimeout(timer);
  }, [processing]);

  const generate = (d: Draft) => {
    const [from, to] = d.period === 'custom' && d.custom ? d.custom : PERIODS.find(p => p.value === d.period)!.range(new Date());
    setReports(list => [{ id: `r${Date.now()}`, from, to, format: d.format, by: YOU, createdAt: new Date(), status: 'Processing', currencies: d.currencies, zone: d.zone }, ...list]);
    setDraft(null);
  };
  const remove = (r: Report) => {
    setReports(list => list.filter(x => x.id !== r.id));
    toast({ status: 'success', title: 'Report deleted', actionLabel: 'Undo', onAction: () => setReports(list => (list.some(x => x.id === r.id) ? list : [...list, r].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))) });
  };

  if (account !== 'verified') {
    const verifying = account === 'verifying';
    return {
      overlays: null,
      content: (
        <main className="grg-ip-page">
          <PageHeader title="Reporting" />
          <div className="grg-ip-surface grg-ip-waiting">
            <img className="grg-ip-waiting__image" src={verifying ? verifyingImage : reportsImage} alt="" />
            <h2 className="grg-ip-waiting__title">{verifying ? 'Verification in progress' : 'You can’t download reports yet'}</h2>
            <p className="grg-ip-waiting__text">{verifying ? 'Please wait a little bit. We’ll let you know when it’s ready.' : 'This action will be available after successful verification'}</p>
            {/* No verification in this demo: the button stays, as on Transactions, without an action */}
            {!verifying && <Button variant="primary" size="lg" rightIcon="arrow-right">Verify business to get started</Button>}
          </div>
        </main>
      ),
    };
  }

  const columns: TableColumn<Report>[] = [
    { id: 'period', header: 'Time period', width: '22%', cell: r => <TableText title={formatPeriod(r.from, r.to)} /> },
    { id: 'format', header: 'Format', width: '9%', cell: r => <TableText title={r.format.toUpperCase()} /> },
    { id: 'by', header: 'Created by', width: '26%', cell: r => <TableText title={personName(r.by)} /> },
    { id: 'created', header: 'Created at', width: '20%', sortValue: r => r.createdAt.getTime(), cell: r => <TableText title={formatDateTime(r.createdAt)} /> },
    { id: 'status', header: 'Status', cell: r => (
      <Badge label={r.status} variant="light" size="sm" color={r.status === 'Generated' ? 'success' : 'warning'} leftIcon={null} rightIcon={null} />
    ) },
  ];
  const label = (r: Report) => `report ${formatPeriod(r.from, r.to)}, ${r.format.toUpperCase()}`;

  const settlement = (
    <div className="grg-ip-tab-panel">
      <SettingsList className="grg-ip-surface grg-ip-surface--fit">
        <SettingsRow layout="below" icon="chart-line" title="Settlement Report"
          description="All the transactions with applied fees. You’ll be able to access your download records for one week."
          action={<Button variant="primary" size="sm" onClick={() => setDraft(startDraft())}>Generate report</Button>} />
        <div className="grg-ip-setting">
          <Table aria-label="Report history" rows={reports} rowKey={r => r.id} rowLabel={label} columns={columns}
            actions={r => (r.status === 'Processing'
              ? <ProgressCircle size="xs" aria-label={`Generating ${label(r)}`} />
              : (
                <>
                  <ActionButton icon="download" size="sm" aria-label={`Download ${label(r)}`} onClick={() => download(r)} />
                  <ActionButton icon="trash" size="sm" color="red" aria-label={`Delete ${label(r)}`} onClick={() => remove(r)} />
                </>
              ))}
            empty={{ title: 'Report history is empty', subtitle: 'Generate your first report' }} />
        </div>
      </SettingsList>
    </div>
  );

  const content = (
    <main className="grg-ip-page">
      <PageHeader title="Reporting" />
      {/* Statement Report has no screens yet: shown, not available */}
      <TabMenu aria-label="Reports" items={[{ id: 'settlement', label: 'Settlement Report' }, { id: 'statement', label: 'Statement Report', disabled: true }]}>
        {item => (item.id === 'settlement' ? settlement : null)}
      </TabMenu>
    </main>
  );

  const d = draft;
  return {
    content,
    overlays: (
      // One modal: the form, or Custom period… as its calendar step with Back (the Modal rule: steps inside one modal)
      <Modal appendTo="self" visible={!!d} onHide={() => setDraft(null)} footerType="fill"
        {...(d?.picking ? {
          title: 'Custom period', description: 'Choose the first and the last day of the report',
          onBack: () => setDraft({ ...d, picking: undefined }),
          primaryAction: { label: 'Apply', disabled: !d.picking[0], onClick: () => {
            const [from, to] = d.picking!;
            setDraft({ ...d, period: 'custom', custom: [from!, to ?? from!], picking: undefined });
          } },
        } : { title: 'Settlement Report', primaryAction: { label: 'Generate report', onClick: () => generate(d!) } })}>
        {d?.picking ? (
          <DatePickerPanel selectionMode="range" buttons={false} flat value={d.picking[0] ? d.picking : undefined}
            onChange={next => setDraft({ ...d, picking: Array.isArray(next) ? next : [null, null] })} />
        ) : d && <>
          <Select label="Currency" floatingLabel={false} placeholder="All currencies" type="coin" multiple searchable options={CURRENCIES}
            values={d.currencies} onValuesChange={currencies => setDraft({ ...d, currencies })} />
          <Select label="Time zone" floatingLabel={false} searchable icon={false} options={ZONES} value={d.zone} required
            onChange={zone => setDraft({ ...d, zone: zone ?? DEFAULT_ZONE })} />
          {/* The usual periods, the chosen dates once applied (checked), then Custom period… */}
          <Select label="Date period" floatingLabel={false} icon={false} required
            options={[...PERIODS.map(({ value, label: name }) => ({ value, label: name })),
              ...(d.custom ? [{ value: 'custom', label: formatPeriod(d.custom[0], d.custom[1]) }] : []),
              { value: 'pick', label: 'Custom period…', icon: 'calendar' as const }]}
            value={d.period}
            onChange={period => (period === 'pick'
              ? setDraft({ ...d, picking: d.custom ?? [null, null] })
              : setDraft({ ...d, period: period ?? 'last-month' }))} />
          <RadioGroup label="Format" orientation="horizontal" value={d.format} onChange={format => setDraft({ ...d, format: format as Format })}>
            <RadioLabel value="csv" label="CSV" />
            <RadioLabel value="pdf" label="PDF" />
          </RadioGroup>
        </>}
      </Modal>
    ),
  };
}

function ReportingApp(props: ReportingProps) {
  const reporting = useReporting(props);
  return <><AppFrame current="reporting">{reporting.content}</AppFrame>{reporting.overlays}</>;
}

/** The Reporting page: the Settlement Report and its history; before verification and during it, its empty states */
export function ReportingFlow(props: ReportingProps) {
  return <MessagesProvider appendTo="self"><ReportingApp {...props} /></MessagesProvider>;
}
