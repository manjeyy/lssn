import { Feather } from '@expo/vector-icons';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { darkTheme } from '../lib/theme';

export const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.backButton} onPress={onPress} activeOpacity={0.7}>
    <Feather name="chevron-left" size={20} color={darkTheme.primary} />
    <Text style={styles.backButtonText}>Back</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingVertical: 4 },
  backButtonText: { color: darkTheme.primary, marginLeft: 2, fontWeight: '600', fontSize: 15 },
});