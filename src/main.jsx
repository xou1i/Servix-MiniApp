import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStateProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppStateProvider>
  </React.StrictMode>,
);
