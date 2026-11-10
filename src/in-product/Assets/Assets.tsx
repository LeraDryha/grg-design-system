import { useState } from 'react';
import { MessagesProvider } from '../../components/Alert/Messages';
import { AppFrame, AssetsPage, startAssets } from '../shared/AssetsApp';
import { useConvert } from '../Convert/Convert';
import { useWithdrawEth } from '../WithdrawEth/WithdrawEth';

/* GRX Pay redesign, file "Tools", section Assets (1750:19736): the balance in a chosen currency, the withdrawal in
   progress, the assets with Convert, Deposit and Withdraw, small balances hidden; the empty pages before verification
   and while it is checked. Deposit has no screens yet: the button stays without an action. Test data only. */

export type AssetsFlowProps = {
  /** Verified: the assets. Not verified: they appear after verification. Verifying: the documents are being checked */
  account?: 'verified' | 'not-verified' | 'verifying';
};

function AssetsApp({ account = 'verified' }: AssetsFlowProps) {
  const [assets, setAssets] = useState(startAssets);
  const convert = useConvert({ assets, setAssets });
  const withdraw = useWithdrawEth({ assets, setAssets });
  return (
    <>
      <AppFrame centred={!!withdraw.outside} current="assets">
        {withdraw.outside ?? <AssetsPage account={account} assets={assets} inProgress={withdraw.inProgress}
          onAction={{ convert: convert.start, withdraw: row => withdraw.start(row.id) }} />}
      </AppFrame>
      {convert.modal}
      {withdraw.modal}
    </>
  );
}

/** The Assets page with Convert and Withdraw: one working flow */
export function AssetsFlow(props: AssetsFlowProps) {
  return <MessagesProvider appendTo="self"><AssetsApp {...props} /></MessagesProvider>;
}
