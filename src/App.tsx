import 'antd/dist/reset.css';
import {LayoutWrapper} from '@/components/LayoutWrapper';
import {Router} from '@/Router';

export const App = () => (
  <LayoutWrapper>
    <Router/>
  </LayoutWrapper>
);
