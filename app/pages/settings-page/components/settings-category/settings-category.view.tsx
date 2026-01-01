import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { renderIcon } from '@/components/icon-picker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Category, Element } from '@/types';
import { styles } from './settings-category.styles';

interface SettingsCategoryProps {
  category: Category;
  elements: Element[];
  isExpanded: boolean;
  onToggle: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddElement: () => void;
  onEditElement: (element: Element) => void;
  onDeleteElement: (elementId: number) => void;
}

export function SettingsCategoryView({
  category,
  elements,
  isExpanded,
  onToggle,
  onEditCategory,
  onDeleteCategory,
  onAddElement,
  onEditElement,
  onDeleteElement,
}: SettingsCategoryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <TouchableOpacity style={styles.categoryTitleRow} onPress={onToggle}>
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color={colors.icon}
          />
          <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
        </TouchableOpacity>
        <View style={styles.categoryActions}>
          <TouchableOpacity style={styles.iconButton} onPress={onEditCategory}>
            <Ionicons name="create-outline" size={20} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onDeleteCategory}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.elementsContainer}>
          <TouchableOpacity style={styles.addElementButton} onPress={onAddElement}>
            <Ionicons name="add-circle-outline" size={18} color={colors.tint} />
            <Text style={[styles.addElementText, { color: colors.tint }]}>Agregar hábito</Text>
          </TouchableOpacity>

          {elements.length === 0 ? (
            <Text style={[styles.noElementsText, { color: colors.icon + 'CC' }]}>
              No hay hábitos en esta categoría
            </Text>
          ) : (
            elements.map((element) => (
              <View key={element.id} style={[styles.elementRow, { borderBottomColor: colors.icon + '33' }]}>
                <View style={styles.elementInfo}>
                  {element.icon_name && (
                    <View style={styles.elementIcon}>{renderIcon(element.icon_name, 20, colors.tint)}</View>
                  )}
                  <Text style={[styles.elementName, { color: colors.text }]}>{element.name}</Text>
                </View>
                <View style={styles.elementActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => onEditElement(element)}>
                    <Ionicons name="create-outline" size={18} color={colors.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => onDeleteElement(element.id)}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

