import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { renderIcon } from '@/components/icon-picker';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Category, Habit } from '@/types';
import { styles } from './settings-category.styles';

interface SettingsCategoryProps {
  category: Category;
  elements: Habit[];
  isExpanded: boolean;
  onToggle: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddElement: () => void;
  onEditElement: (element: Habit) => void;
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
    <View style={[styles.categoryCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity style={styles.categoryHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.categoryTitleRow}>
          <View style={[styles.categoryIconContainer, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="folder-outline" size={20} color={colors.tint} />
          </View>
          <Text style={[styles.categoryName, { color: colors.text, fontFamily: Fonts?.default }]}>
            {category.name}
          </Text>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity style={styles.iconButton} onPress={onEditCategory}>
            <Ionicons name="pencil" size={18} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onDeleteCategory}>
            <Ionicons name="trash" size={18} color="#C45C4A" />
          </TouchableOpacity>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.icon}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.elementsContainer}>
          {elements.length === 0 ? (
            <Text style={[styles.noElementsText, { color: colors.icon }]}>
              No hay hábitos en esta categoría
            </Text>
          ) : (
            elements.map((element) => (
              <View key={element.id} style={[styles.elementRow, { backgroundColor: colors.background }]}>
                <View style={styles.elementInfo}>
                  {element.icon_name && (
                    <View style={[styles.elementIconContainer, { backgroundColor: colors.tint + '15' }]}>
                      {renderIcon(element.icon_name, 18, colors.tint)}
                    </View>
                  )}
                  <Text style={[styles.elementName, { color: colors.text, fontFamily: Fonts?.default }]}>
                    {element.name}
                  </Text>
                </View>
                <View style={styles.elementActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => onEditElement(element)}>
                    <Ionicons name="pencil" size={16} color={colors.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => onDeleteElement(element.id)}>
                    <Ionicons name="trash" size={16} color="#C45C4A" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addElementButton} onPress={onAddElement} activeOpacity={0.7}>
            <Ionicons name="add" size={18} color={colors.tint} />
            <Text style={[styles.addElementText, { color: colors.tint, fontFamily: Fonts?.default }]}>
              Agregar hábito
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

