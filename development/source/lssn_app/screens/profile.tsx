import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { logout, getMe } from '../lib/api';
import { useAuthStore } from '../store/store';
import { darkTheme } from '../lib/theme';

const roleConfig = {
  viewer: { bg: '#1e3a2e', text: '#4ade80', label: 'Viewer' },
  creator: { bg: '#1e2a3a', text: '#60a5fa', label: 'Creator' },
  admin: { bg: '#3a1e2a', text: '#f472b6', label: 'Admin' },
};

export default function Profile() {
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    if (!user) {
      getMe()
        .then((me) => {
          setUser(me);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigation.navigate('Login' as never);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={darkTheme.primary} />
      </View>
    );
  }

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const role = user?.role ?? 'viewer';
  const roleStyle = roleConfig[role];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.heroSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'User'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
            <Feather
              name={role === 'admin' ? 'shield' : role === 'creator' ? 'edit-3' : 'eye'}
              size={11}
              color={roleStyle.text}
            />
            <Text style={[styles.roleText, { color: roleStyle.text }]}>{roleStyle.label}</Text>
          </View>
        </View>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.card}>
            <InfoRow icon="user" label="Full Name" value={user?.name ?? '—'} />
            <Divider />
            <InfoRow icon="mail" label="Email Address" value={user?.email ?? '—'} />
            <Divider />
            <InfoRow icon="shield" label="Role" value={roleStyle.label} />
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <View style={styles.card}>
            <PermissionRow label="Browse lessons" granted />
            <Divider />
            <PermissionRow label="React to slides" granted />
            <Divider />
            <PermissionRow
              label="Create lessons"
              granted={role === 'creator' || role === 'admin'}
            />
            <Divider />
            <PermissionRow label="Admin panel" granted={role === 'admin'} />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color={darkTheme.destructive} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>LSSN App · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Feather name={icon} size={15} color={darkTheme.mutedForeground} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function PermissionRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <View style={styles.permRow}>
      <Text style={styles.permLabel}>{label}</Text>
      <View style={[styles.permBadge, granted ? styles.permGranted : styles.permDenied]}>
        <Feather
          name={granted ? 'check' : 'x'}
          size={11}
          color={granted ? '#4ade80' : darkTheme.mutedForeground}
        />
        <Text
          style={[
            styles.permBadgeText,
            { color: granted ? '#4ade80' : darkTheme.mutedForeground },
          ]}>
          {granted ? 'Allowed' : 'Restricted'}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.background },
  center: {
    flex: 1,
    backgroundColor: darkTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 24, paddingBottom: 48 },
  heroSection: { alignItems: 'center', marginBottom: 32, paddingTop: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: darkTheme.primary + '20',
    borderWidth: 2,
    borderColor: darkTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: darkTheme.primary },
  name: { fontSize: 22, fontWeight: '700', color: darkTheme.foreground, marginBottom: 4 },
  email: { fontSize: 14, color: darkTheme.mutedForeground, marginBottom: 12 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
  },
  roleText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: darkTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: darkTheme.card,
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: darkTheme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: darkTheme.mutedForeground,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: { fontSize: 15, color: darkTheme.foreground, fontWeight: '500' },
  divider: { height: 1, backgroundColor: darkTheme.border, marginLeft: 58 },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  permLabel: { fontSize: 14, color: darkTheme.foreground, fontWeight: '500' },
  permBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  permGranted: { backgroundColor: '#1e3a2e' },
  permDenied: { backgroundColor: darkTheme.secondary },
  permBadgeText: { fontSize: 12, fontWeight: '600' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: darkTheme.destructive + '50',
    borderRadius: 14,
    paddingVertical: 15,
    backgroundColor: darkTheme.destructive + '10',
    marginBottom: 20,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: darkTheme.destructive },
  version: { textAlign: 'center', fontSize: 12, color: darkTheme.mutedForeground },
});
