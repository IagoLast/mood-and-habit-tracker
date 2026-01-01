import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  categorySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  noElementsText: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  elementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
