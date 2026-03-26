import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { register } from '../lib/api';
import { useAuthStore } from '../store/store';
import { darkTheme } from '../lib/theme';

export default function Signup() {
  const navigation = useNavigation();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      const user = await register(name.trim(), email.trim(), password);
      setUser(user);
      navigation.navigate('Explore' as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.brandLogo}>LSSN</Text>
            <Text style={styles.brandTagline}>Learn. Slide. Grow.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join to access curated LSSNs.</Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={14} color={darkTheme.destructive} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Feather name="user" size={16} color={darkTheme.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor={darkTheme.mutedForeground}
                  autoCapitalize="words"
                  style={styles.input}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Feather name="mail" size={16} color={darkTheme.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={darkTheme.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Feather name="lock" size={16} color={darkTheme.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor={darkTheme.mutedForeground}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.inputFlex]}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={darkTheme.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
              {!isLoading ? <Feather name="arrow-right" size={18} color={darkTheme.primaryForeground} /> : null}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkTheme.background },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  brandBlock: { alignItems: 'center', marginBottom: 36 },
  brandLogo: { fontSize: 42, fontWeight: '900', color: darkTheme.primary, letterSpacing: 6 },
  brandTagline: { fontSize: 13, color: darkTheme.mutedForeground, fontWeight: '500', letterSpacing: 0.5, marginTop: 4 },
  card: { backgroundColor: darkTheme.card, borderWidth: 1, borderColor: darkTheme.border, borderRadius: 24, padding: 24, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: darkTheme.foreground, marginBottom: 4 },
  subtitle: { fontSize: 14, color: darkTheme.mutedForeground, marginBottom: 20 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: darkTheme.destructive + '15', borderWidth: 1, borderColor: darkTheme.destructive + '40', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: darkTheme.destructive, fontSize: 13, flex: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, color: darkTheme.mutedForeground, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: darkTheme.border, borderRadius: 12, backgroundColor: darkTheme.background, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: darkTheme.foreground, paddingVertical: 13 },
  inputFlex: { flex: 1 },
  eyeBtn: { padding: 4 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, backgroundColor: darkTheme.primary, borderRadius: 14, paddingVertical: 15 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: darkTheme.primaryForeground, fontWeight: '700', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  footerText: { color: darkTheme.mutedForeground, fontSize: 14 },
  footerLink: { color: darkTheme.primary, fontWeight: '700', fontSize: 14 },
});