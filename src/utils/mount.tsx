import ReactDOM from 'react-dom/client';
import {Providers} from '@/components/Providers';
import React from 'react';

export const mount = (rootIdOrElement: string | Element | DocumentFragment, children: React.ReactNode): () => void => {
  let rootElement: Element | DocumentFragment = rootIdOrElement as Element;
  if (typeof rootIdOrElement === 'string') {
    rootElement = document.getElementById(rootIdOrElement)!;
  }
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <Providers>
      {children}
    </Providers>
  );
  return () => {
    root.unmount();
  };
};
