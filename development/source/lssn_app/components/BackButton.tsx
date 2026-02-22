import { Feather } from '@expo/vector-icons';
import { Text, View, StyleSheet } from 'react-native';
import { darkTheme } from '../lib/theme';

export const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <View style={styles.backButton}>
      <Feather name="chevron-left" size={16} color={darkTheme.primary} />
      <Text style={styles.backButtonText} onPress={onPress}>
        Back
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  backButtonText: {
    color: darkTheme.primary,
    marginLeft: 4,
  },
});
