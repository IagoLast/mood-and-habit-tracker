import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  categorySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  elementsContainer: {
    marginTop: 8,
  },
  addElementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  addElementText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  noElementsText: {
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  elementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  elementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  elementIcon: {
    marginRight: 12,
  },
  elementName: {
    fontSize: 16,
    flex: 1,
  },
  elementActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
