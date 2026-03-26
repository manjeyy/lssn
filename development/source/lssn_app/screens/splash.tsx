import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAccessToken, getMe } from '../lib/api';
import { useAuthStore } from '../store/store';
import { darkTheme } from '../lib/theme';

export default function Splash() {
  const navigation = useNavigation();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const user = await getMe();
          setUser(user);
          navigation.navigate('Explore' as never);
        } else {
          navigation.navigate('Login' as never);
        }
      } catch {
        navigation.navigate('Login' as never);
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBlock}>
        <Text style={styles.logoText}>LSSN</Text>
        <Text style={styles.tagline}>Learn. Slide. Grow.</Text>
      </View>
      <ActivityIndicator size="small" color={darkTheme.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logoBlock: {
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '900',
    color: darkTheme.primary,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 14,
    color: darkTheme.mutedForeground,
    fontWeight: '500',
    letterSpacing: 1,
  },
  loader: {
    position: 'absolute',
    bottom: 60,
  },
});
