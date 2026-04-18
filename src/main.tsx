import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { TripsProvider } from './context/TripsContext';
import 'leaflet/dist/leaflet.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TripsProvider>
        <App />
      </TripsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
