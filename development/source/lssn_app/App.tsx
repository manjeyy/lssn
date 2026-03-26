import { DarkTheme } from '@react-navigation/native';
import { useMemo } from 'react';

import 'react-native-gesture-handler';

import Navigation from './navigation';
import { darkTheme } from './lib/theme';

export default function App() {
  // Always use dark theme to match lssn_creator design
  const theme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: darkTheme.primary,
        background: darkTheme.background,
        card: darkTheme.card,
        text: darkTheme.foreground,
        border: darkTheme.border,
      },
    }),
    []
  );

  return <Navigation theme={theme} />;
}
