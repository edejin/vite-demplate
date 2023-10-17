import {Providers} from '@/components/Providers';
import 'antd/dist/reset.css';
import {LayoutWrapper} from '@/components/LayoutWrapper';
import {Router} from '@/Router';

export const App = () => (
  <Providers>
    <LayoutWrapper>
      <Router/>
    </LayoutWrapper>
  </Providers>
);
