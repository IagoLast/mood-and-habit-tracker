import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    paddingBottom: 6,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  todayButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  yearContainer: {
    padding: 8,
    borderRadius: 16,
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 800,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
