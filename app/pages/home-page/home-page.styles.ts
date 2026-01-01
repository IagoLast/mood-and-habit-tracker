import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  yearContainer: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 800,
  },
  yearButton: {
    padding: 4,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
