// Theme system matching lssn_creator design
export const lightTheme = {
  primary: '#098fc8',
  primaryForeground: '#081108',
  background: '#ffffff',
  foreground: '#1a1a24',
  card: '#ffffff',
  cardForeground: '#1a1a24',
  secondary: '#f5f5f7',
  secondaryForeground: '#1a1a24',
  muted: '#f5f5f7',
  mutedForeground: '#64748b',
  accent: '#f5f5f7',
  accentForeground: '#1a1a24',
  destructive: '#ef4444',
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#94a3b8',
};

export const darkTheme = {
  primary: '#00a6f4',
  primaryForeground: '#081108',
  background: '#1a1a24',
  foreground: '#fafafa',
  card: '#2a2a38',
  cardForeground: '#fafafa',
  secondary: '#3a3a48',
  secondaryForeground: '#fafafa',
  muted: '#3a3a48',
  mutedForeground: '#94a3b8',
  accent: '#3a3a48',
  accentForeground: '#fafafa',
  destructive: '#ef4444',
  border: '#3a3a48',
  input: '#3a3a48',
  ring: '#64748b',
};

export type Theme = typeof lightTheme;

export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme;
};
