import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      <List>
        <Section
          header="Features"
          footer="You can use this page to navigate to the swap functionality."
        >
          <Link to="/swap">
            <Cell subtitle="Swap your tokens here">
              Swap Page
            </Cell>
          </Link>
        </Section>
      </List>
    </Page>
  );
};