/**
 * Centralized Theme System
 * 
 * This file contains all theme styles for the application.
 * Use this theme across all components for consistency.
 * 
 * Usage:
 * import { getTheme, useTheme } from '../theme/theme';
 * 
 * const theme = getTheme('dark'); // or 'light'
 * // or
 * const { theme, isDarkMode, toggleTheme } = useTheme();
 */

import { useState, useEffect } from 'react';

/**
 * Theme configuration object
 * Contains all color schemes, styles, and design tokens
 */
export const themeStyles = {
  dark: {
    // Backgrounds
    background: "bg-gradient-to-br from-gray-900 via-slate-900 to-black",
    backgroundSecondary: "bg-slate-800",
    backgroundTertiary: "bg-slate-700",

    // Text Colors
    primaryColor: "text-cyan-400",
    secondaryColor: "text-cyan-500",
    accentColor: "text-cyan-300",
    mutedColor: "text-cyan-700",
    textPrimary: "text-white",
    textSecondary: "text-slate-300",
    textMuted: "text-slate-500",

    // Borders
    borderColor: "border-cyan-800/50",
    borderColorLight: "border-cyan-700/30",
    borderColorStrong: "border-cyan-500",

    // Background Effects
    gridColor: "bg-[radial-gradient(rgba(6,182,212,0.08)_1px,transparent_1px)]",
    circuitColor: "via-cyan-600/30",
    scanlineColor: "via-cyan-900/5",

    // Containers
    containerBg: "bg-black/60",
    containerBgSolid: "bg-slate-900",
    cardBg: "bg-slate-800/90",

    // Inputs
    inputBg: "bg-black/70",
    inputBorder: "border-cyan-900",
    inputFocus: "focus:border-cyan-500",
    inputPlaceholder: "placeholder-cyan-800",

    // Buttons
    buttonBg: "from-cyan-900/50 to-cyan-800/50",
    buttonHover: "hover:from-cyan-800/50 hover:to-cyan-700/50",
    buttonPrimary: "bg-cyan-600 hover:bg-cyan-700",
    buttonSecondary: "bg-slate-700 hover:bg-slate-600",

    // Status Colors
    errorBg: "bg-red-900/30",
    errorBorder: "border-red-700/50",
    errorText: "text-red-400",
    successBg: "bg-green-900/30",
    successBorder: "border-green-700/50",
    successText: "text-green-400",
    warningBg: "bg-yellow-900/30",
    warningBorder: "border-yellow-700/50",
    warningText: "text-yellow-400",
    infoBg: "bg-blue-900/30",
    infoBorder: "border-blue-700/50",
    infoText: "text-blue-400",

    // Accents
    accentBg: "bg-cyan-400",
    accentBgSecondary: "bg-cyan-500",
    accentBgHover: "bg-cyan-500",

    // Glow Effects
    glowColor: "rgba(8, 145, 178, 0.5)",
    glowColorStrong: "rgba(6, 182, 212, 0.8)",

    // Shadows
    shadow: "shadow-lg shadow-cyan-900/20",
    shadowStrong: "shadow-2xl shadow-cyan-900/40",

    // Badge Colors
    badgePrimary: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    badgeSuccess: "bg-green-500/20 text-green-400 border-green-500/50",
    badgeError: "bg-red-500/20 text-red-400 border-red-500/50",
    badgeWarning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  },

  light: {
    // Backgrounds
    background: "bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100",
    backgroundSecondary: "bg-white",
    backgroundTertiary: "bg-gray-50",

    // Text Colors
    primaryColor: "text-indigo-900",
    secondaryColor: "text-purple-800",
    accentColor: "text-violet-900",
    mutedColor: "text-indigo-500",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-700",
    textMuted: "text-gray-500",

    // Borders
    borderColor: "border-violet-300/60",
    borderColorLight: "border-violet-200/40",
    borderColorStrong: "border-violet-500",

    // Background Effects
    gridColor: "bg-[radial-gradient(rgba(139,69,193,0.12)_1px,transparent_1px)]",
    circuitColor: "via-violet-400/50",
    scanlineColor: "via-violet-200/30",

    // Containers
    containerBg: "bg-white/70",
    containerBgSolid: "bg-white",
    cardBg: "bg-white/90",

    // Inputs
    inputBg: "bg-white/80",
    inputBorder: "border-violet-200",
    inputFocus: "focus:border-violet-500 focus:ring-2 focus:ring-violet-200",
    inputPlaceholder: "placeholder-violet-400",

    // Buttons
    buttonBg: "from-violet-500 to-purple-600",
    buttonHover: "hover:from-violet-600 hover:to-purple-700 hover:shadow-lg hover:shadow-violet-500/25",
    buttonPrimary: "bg-violet-600 hover:bg-violet-700",
    buttonSecondary: "bg-gray-200 hover:bg-gray-300",

    // Status Colors
    errorBg: "bg-red-50/80",
    errorBorder: "border-red-300",
    errorText: "text-red-700",
    successBg: "bg-emerald-50/80",
    successBorder: "border-emerald-300",
    successText: "text-emerald-700",
    warningBg: "bg-yellow-50/80",
    warningBorder: "border-yellow-300",
    warningText: "text-yellow-700",
    infoBg: "bg-blue-50/80",
    infoBorder: "border-blue-300",
    infoText: "text-blue-700",

    // Accents
    accentBg: "bg-violet-500",
    accentBgSecondary: "bg-purple-600",
    accentBgHover: "bg-violet-600",

    // Glow Effects
    glowColor: "rgba(139, 69, 193, 0.4)",
    glowColorStrong: "rgba(124, 58, 237, 0.6)",

    // Shadows
    shadow: "shadow-lg shadow-violet-200/30",
    shadowStrong: "shadow-2xl shadow-violet-300/50",

    // Badge Colors
    badgePrimary: "bg-violet-100 text-violet-800 border-violet-200",
    badgeSuccess: "bg-emerald-100 text-emerald-800 border-emerald-200",
    badgeError: "bg-red-100 text-red-800 border-red-200",
    badgeWarning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  }
};

/**
 * Get theme styles by mode
 * @param {string} mode - 'dark' or 'light'
 * @returns {Object} Theme styles object
 */
export const getTheme = (mode = 'dark') => {
  return themeStyles[mode] || themeStyles.dark;
};

/**
 * Get current theme from localStorage or system preference
 * @returns {string} 'dark' or 'light'
 */
export const getThemeMode = () => {
  if (typeof window === 'undefined') return 'dark';

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }

  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

/**
 * Save theme preference to localStorage
 * @param {string} mode - 'dark' or 'light'
 */
export const saveThemeMode = (mode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', mode);
  }
};

/**
 * React Hook for theme management
 * Provides theme state and toggle function
 * 
 * @returns {Object} { theme, isDarkMode, toggleTheme, setTheme }
 */
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const mode = getThemeMode();
    return mode === 'dark';
  });

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemeMode(newTheme ? 'dark' : 'light');
  };

  const setTheme = (mode) => {
    const isDark = mode === 'dark';
    setIsDarkMode(isDark);
    saveThemeMode(mode);
  };

  const theme = isDarkMode ? themeStyles.dark : themeStyles.light;

  return {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
    themeMode: isDarkMode ? 'dark' : 'light'
  };
};

/**
 * Common component styles that can be reused
 */
export const componentStyles = {
  // Button Styles
  button: {
    primary: (theme) => `${theme.buttonPrimary} ${theme.textPrimary} px-4 py-2 rounded transition-all`,
    secondary: (theme) => `${theme.buttonSecondary} ${theme.textPrimary} px-4 py-2 rounded transition-all`,
    outline: (t) => `border-2 ${t.borderColorStrong} ${t.primaryColor} px-4 py-2 rounded transition-all hover:${t.accentBg}`,
    error: (theme) => `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-all`,
  },

  // Input Styles
  input: (theme) => `w-full p-3 ${theme.inputBg} ${theme.inputBorder} border ${theme.accentColor} ${theme.inputPlaceholder} ${theme.inputFocus} focus:outline-none transition-all duration-300`,

  // Card Styles
  card: (theme) => `${theme.cardBg} ${theme.borderColor} border rounded-lg p-6 ${theme.shadow}`,

  // Badge Styles
  badge: {
    primary: (theme) => `px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badgePrimary}`,
    success: (theme) => `px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badgeSuccess}`,
    error: (theme) => `px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badgeError}`,
    warning: (theme) => `px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badgeWarning}`,
  },

  // Alert Styles
  alert: {
    error: (theme) => `${theme.errorBg} ${theme.errorBorder} border ${theme.errorText} p-3 rounded`,
    success: (theme) => `${theme.successBg} ${theme.successBorder} border ${theme.successText} p-3 rounded`,
    warning: (theme) => `${theme.warningBg} ${theme.warningBorder} border ${theme.warningText} p-3 rounded`,
    info: (theme) => `${theme.infoBg} ${theme.infoBorder} border ${theme.infoText} p-3 rounded`,
  },
};

export default {
  themeStyles,
  getTheme,
  getThemeMode,
  saveThemeMode,
  useTheme,
  componentStyles,
};
