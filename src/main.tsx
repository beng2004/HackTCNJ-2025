import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import WelcomePage from './components/WelcomePage.tsx';
import { Auth0Provider } from '@auth0/auth0-react';


createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain="dev-1mc2462b6fxy3nui.us.auth0.com"
    clientId="NZ358txY2rDy2TsWz4oo1TjXTKNME8V4"
    authorizationParams={{
      redirect_uri:  'http://localhost:5173/board'
    }}
  >
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/board" element={<App />} />
          <Route path="/" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </Auth0Provider>
);