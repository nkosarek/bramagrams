import React from 'react';
import Router from './components/router/Router';
import AppThemeProvider from './components/theme/AppThemeProvider';

const App = () => (
  <AppThemeProvider>
    <Router />
  </AppThemeProvider>
);

export default App;
