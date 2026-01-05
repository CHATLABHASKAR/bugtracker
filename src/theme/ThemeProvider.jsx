import React, { createContext, useContext } from 'react';
import { useTheme } from './theme';

const ThemeContext = createContext();

/**
 * ThemeProvider - Provides theme context to all child components
 * 
 * Usage:
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * Then in any component:
 * const { theme, isDarkMode, toggleTheme } = useThemeContext();
 */
export const ThemeProvider = ({ children }) => {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @returns {Object} Theme context value
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback to direct useTheme if not in provider
    return useTheme();
  }
  return context;
};

export default ThemeProvider;
