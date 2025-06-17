import React, { createContext, useMemo, useState, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        ...(mode === 'dark'
          ? {
              background: {
                default: '#121212',
                paper: '#1e1e1e',
              },
            }
          : {}),
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ThemeProvider;
