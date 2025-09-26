import { useState, useEffect, useCallback } from 'react';

export interface Token {
  address: string;
  name: string;
  symbol: string;
  image_url: string;
  decimals: number;
}

export const useSwap = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatedAmount, setSimulatedAmount] = useState('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('https://api.ston.fi/v1/assets');
        const data = await response.json();
        const tonToken: Token = {
          address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
          name: 'Toncoin',
          symbol: 'TON',
          image_url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
          decimals: 9,
        };
        setTokens([tonToken, ...data.asset_list]);
      } catch (error) {
        console.error('Failed to fetch tokens', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const simulateSwap = useCallback(async (fromToken: Token, toToken: Token, amount: string) => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
      setSimulatedAmount('');
      return;
    }
    setSimulating(true);

    try {
      const units = (parseFloat(amount) * Math.pow(10, fromToken.decimals)).toFixed(0);

      const response = await fetch('https://api.ston.fi/v1/swap/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer_address: fromToken.address,
          ask_address: toToken.address,
          units: units,
          slippage_tolerance: '0.5',
        }),
      });
      const data = await response.json();
      if (data.ask_units) {
        const askUnits = parseFloat(data.ask_units) / Math.pow(10, toToken.decimals);
        setSimulatedAmount(askUnits.toString());
      } else {
        setSimulatedAmount('');
      }
    } catch (error) {
      console.error('Failed to simulate swap', error);
      setSimulatedAmount('');
    } finally {
      setSimulating(false);
    }
  }, []);

  return { tokens, loading, simulatedAmount, simulating, simulateSwap };
};