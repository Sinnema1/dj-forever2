import React, { useMemo, useState } from 'react';
// NOTE: We're using HashRouter instead of BrowserRouter due to static hosting limitations
// on Render. HashRouter uses fragment-based routing (#/route instead of /route) which doesn't
// require server configuration for SPA routing.
//
// TODO: Consider switching back to BrowserRouter in the future if any of these are true:
// 1. Render properly supports the _redirects file for SPA routing
// 2. We switch to a different hosting provider (like Netlify or Vercel) with better SPA support
// 3. We deploy frontend and backend together instead of as separate services
//
// To switch back:
// 1. Import BrowserRouter instead of HashRouter
// 2. Ensure _redirects file with "/* /index.html 200" is in the build output
// 3. Configure the hosting platform to handle SPA routing correctly
import { HashRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline, ThemeProvider } from '@mui/material';

import client from './apolloClient';
import AppRoutes from './routes/routes';
import { getDesignTokens } from './styles/theme';
import { ColorModeContext } from './context/ThemeMode';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  const theme = useMemo(() => getDesignTokens(mode), [mode]);

  console.log('[ROUTER] Current pathname:', window.location.pathname);

  return (
    <ApolloProvider client={client}>
      <ColorModeContext.Provider value={colorMode}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </ThemeProvider>
        </AuthProvider>
      </ColorModeContext.Provider>
    </ApolloProvider>
  );
};

export default App;
