import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './assets/styles.css'; // Enhanced styles with improved RSVP experience
import client from './api/apolloClient';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ApolloProvider client={client}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ApolloProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
