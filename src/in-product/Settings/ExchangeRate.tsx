import { useState } from 'react';
import { useMessages } from '../../components/Alert/Messages';
import { Button } from '../../components/Button/Button';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { Input } from '../../components/Input/Input';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { SettingsList, SettingsRow } from '../../components/SettingsRow/SettingsRow';
import { startAssets, type Asset } from '../shared/AssetsApp';

/* GRX Pay redesign, file "Global Settings", section Settings - Exchange rate (372:47668): the correction coefficient
   of each crypto asset, edited in place in the table, up to 10%. The assets are the demo's own (Assets). */

const crypto = startAssets.filter(asset => asset.code !== 'EUR');
/** A number from 0 to 10 with up to two decimals, such as 2.5 */
const problem = (value: string) => {
  const v = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'Enter a number, such as 2.5';
  return Number(v) > 10 ? 'Up to 10%' : undefined;
};

/** The Exchange rate tab, for the Settings page. While fixed sum invoice is on, the coefficients don't apply */
export function useExchangeRate({ fixedSumOn }: { fixedSumOn: boolean }) {
  const [rates, setRates] = useState<Record<string, number>>(() => Object.fromEntries(crypto.map(a => [a.code, 0])));
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const { toast } = useMessages();
  const editing = draft !== null;
  const invalid = editing && Object.values(draft).some(v => problem(v));
  const save = () => {
    setRates(Object.fromEntries(Object.entries(draft!).map(([code, v]) => [code, Number(v.trim().replace(',', '.'))])));
    setDraft(null);
    toast({ status: 'success', title: 'Saved successfully', duration: 3000 });
  };

  const columns: TableColumn<Asset>[] = [
    { id: 'asset', header: 'Asset', width: 'calc(var(--space-5000) + var(--space-1000))', cell: row => (
      <TableText priority="leading" orientation="horizontal" title={row.name} description={row.code} leading={<CoinIcon name={row.coin} size={24} />} />
    ) },
    { id: 'coefficient', header: 'Correction coefficient', cell: row => (editing ? (
      <Input size="sm" aria-label={`Correction coefficient, ${row.name}`} unit="%" inputMode="decimal" className="grg-ip-rate"
        value={draft[row.code]} error={problem(draft[row.code])} onValueChange={value => setDraft({ ...draft, [row.code]: value })} />
    ) : <TableText title={`${rates[row.code]}%`} />) },
  ];

  const tab = (
    <SettingsList className="grg-ip-surface grg-ip-surface--fit">
      <SettingsRow layout="below" icon="exchange" title="Exchange rate adjustment"
        description={<>Correction coefficient is a percentage applied to the exchange rate during customer purchase and affects the crypto currency price shown to the buyer. Limit corrective coefficient <strong>up to 10%</strong></>}
        // Fixed sum pays the exact fiat amount: the coefficients only apply without it (Payment settings)
        note={fixedSumOn ? 'Turn off fixed sum invoice to adjust the exchange rate' : undefined}
        action={<>
          {editing
            ? <Button variant="secondary" size="sm" onClick={() => setDraft(null)}>Cancel</Button>
            // No help page in this demo: the button stays without an action
            : <Button variant="secondary" size="sm">Learn more</Button>}
          {editing
            ? <Button variant="primary" size="sm" disabled={invalid} onClick={save}>Save changes</Button>
            : <Button variant="primary" size="sm" disabled={fixedSumOn}
              onClick={() => setDraft(Object.fromEntries(Object.entries(rates).map(([code, v]) => [code, String(v)])))}>Edit coefficients</Button>}
        </>} />
      <div className="grg-ip-setting">
        <Table aria-label="Correction coefficients" rows={crypto} rowKey={row => row.code} rowLabel={row => row.name} columns={columns} />
      </div>
    </SettingsList>
  );
  return { tab };
}
