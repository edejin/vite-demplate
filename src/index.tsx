import {App} from './App.tsx';
import {mount} from '@/utils/mount';

(() => {
  const el = document.createElement('div');
  mount(el, <App/>);
  document.body.append(el);
})();
