import { FC } from 'react';
import { List, Cell, Image } from '@telegram-apps/telegram-ui';
import { Token } from '@/hooks/useSwap';
import styles from './TokenList.module.css';

interface TokenListProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
}

export const TokenList: FC<TokenListProps> = ({ tokens, onSelectToken }) => {
  return (
    <div className={styles.container}>
      <List>
        {tokens.map((token) => (
          <Cell
            key={token.address}
            onClick={() => onSelectToken(token)}
            before={<Image src={token.image_url} size={40} />}
            subtitle={token.symbol}
          >
            {token.name}
          </Cell>
        ))}
      </List>
    </div>
  );
};