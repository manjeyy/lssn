import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register } from '../lib/api';
import { darkTheme } from '../lib/theme';

export default function Signup() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setIsLoading(true);
    setError(null);

    try {
      await register(name, email, password);
      navigation.navigate('Explore' as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join to access curated LSSNs.</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={darkTheme.mutedForeground}
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={darkTheme.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={darkTheme.mutedForeground}
            secureTextEntry
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Creating...' : 'Create account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.secondaryButtonText}>Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
    padding: 24,
  },
  header: {
    marginTop: 12,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: darkTheme.foreground,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: darkTheme.mutedForeground,
  },
  form: {
    marginBottom: 12,
  },
  errorText: {
    marginBottom: 8,
    color: darkTheme.destructive,
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: darkTheme.mutedForeground,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: darkTheme.foreground,
    backgroundColor: darkTheme.card,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: darkTheme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: darkTheme.primaryForeground,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: darkTheme.primary,
    fontWeight: '600',
  },
});
