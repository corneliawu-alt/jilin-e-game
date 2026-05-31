import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BgmProvider } from './contexts/BgmContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BgmProvider>
      <App />
    </BgmProvider>
  </StrictMode>,
);
