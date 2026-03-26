import { StyleSheet, Text, View } from 'react-native';
import { darkTheme } from '../lib/theme';

export default function EditScreenInfo({ path }: { path: string }) {
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  return (
    <View style={styles.getStartedContainer}>
      <Text style={styles.getStartedText}>{title}</Text>
      <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
        <Text style={styles.pathText}>{path}</Text>
      </View>
      <Text style={styles.getStartedText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  codeHighlightContainer: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: darkTheme.card,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    color: darkTheme.foreground,
  },
  pathText: {
    color: darkTheme.primary,
    fontSize: 14,
  },
  helpContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
    color: darkTheme.foreground,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
});
