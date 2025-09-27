import { FC, useState, useEffect } from 'react';
import {
  Button,
  Input,
  Section,
  Modal,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import styles from './SwapPage.module.css';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { DEX, pTON } from '@ston-fi/sdk';
import { TonClient, toNano } from '@ton/ton';
import { useSwap, Token } from '@/hooks/useSwap';
import { TokenList } from '@/components/TokenList/TokenList';

export const SwapPage: FC = () => {
  // Swap state
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('1');

  // TON Connect state
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  // Custom hook for fetching tokens and simulating swaps
  const { tokens, loading, simulatedAmount, simulating, simulateSwap } = useSwap();

  useEffect(() => {
    // Set default fromToken to TON when tokens are loaded
    if (tokens.length > 0 && !fromToken) {
      setFromToken(tokens.find(t => t.symbol === 'TON') || null);
    }
  }, [tokens, fromToken]);

  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      simulateSwap(fromToken, toToken, fromAmount);
    }
  }, [fromToken, toToken, fromAmount, simulateSwap]);

  const handleSwap = async () => {
    if (!wallet || !fromToken || !toToken) {
      alert('Please connect your wallet and select tokens to swap.');
      return;
    }

    const client = new TonClient({
      endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });

    const router = client.open(DEX.v2_1.Router.CPI.create('kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v'));
    const proxyTon = pTON.v2_1.create('kQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT-Px');

    let txParams;

    // TON -> Jetton
    if (fromToken.symbol === 'TON' && toToken.symbol !== 'TON') {
      txParams = await router.getSwapTonToJettonTxParams({
        userWalletAddress: wallet.account.address,
        proxyTon: proxyTon,
        offerAmount: toNano(fromAmount),
        askJettonAddress: toToken.address,
        minAskAmount: '1',
      });
    }
    // Jetton -> TON
    else if (fromToken.symbol !== 'TON' && toToken.symbol === 'TON') {
      txParams = await router.getSwapJettonToTonTxParams({
        userWalletAddress: wallet.account.address,
        offerJettonAddress: fromToken.address,
        offerAmount: toNano(fromAmount),
        minAskAmount: '1',
        proxyTon: proxyTon,
      });
    }
    // Jetton -> Jetton
    else if (fromToken.symbol !== 'TON' && toToken.symbol !== 'TON') {
      txParams = await router.getSwapJettonToJettonTxParams({
        userWalletAddress: wallet.account.address,
        offerJettonAddress: fromToken.address,
        offerAmount: toNano(fromAmount),
        askJettonAddress: toToken.address,
        minAskAmount: '1',
      });
    } else {
      alert('Invalid swap pair');
      return;
    }

    if (txParams) {
      await tonConnectUI.sendTransaction(txParams as any);
    }
  };

  return (
    <Page>
      <div className={styles.container}>
        <div className={styles.walletButton}>
          <TonConnectButton />
        </div>

        <Section header="From">
          <div className={styles.tokenInput}>
            <Input
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
            />
            <Modal
              header="Select a token"
              trigger={
                <Button size="s">
                  {fromToken ? fromToken.symbol : 'Select Token'}
                </Button>
              }
            >
              {loading ? <p>Loading...</p> : <TokenList tokens={tokens} onSelectToken={setFromToken} />}
            </Modal>
          </div>
        </Section>

        <div className={styles.swapIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>

        <Section header="To">
          <div className={styles.tokenInput}>
            <Input
              value={simulating ? '...' : simulatedAmount}
              placeholder="0.0"
              disabled
            />
            <Modal
              header="Select a token"
              trigger={
                <Button size="s">
                  {toToken ? toToken.symbol : 'Select Token'}
                </Button>
              }
            >
              {loading ? <p>Loading...</p> : <TokenList tokens={tokens} onSelectToken={setToToken} />}
            </Modal>
          </div>
        </Section>

        <Button size="l" stretched onClick={handleSwap} disabled={!wallet || !fromToken || !toToken || simulating}>
          {simulating ? 'Getting rate...' : 'Swap'}
        </Button>
      </div>
    </Page>
  );
};