import { View, Text, TouchableOpacity } from 'react-native';
import { renderIcon } from '@/components/icon-picker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DayCategory } from '@/repositories/days.repository';
import { styles } from './day-category.styles';

interface DayCategoryProps {
  category: DayCategory;
  onElementToggle: (elementId: number) => void;
}

export function DayCategoryView({ category, onElementToggle }: DayCategoryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.categorySection}>
      <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>

      {category.elements.length === 0 ? (
        <Text style={[styles.noElementsText, { color: colors.icon + 'CC' }]}>
          No hay tareas en esta categoría
        </Text>
      ) : (
        <View style={styles.elementsContainer}>
          {category.elements.map((element) => (
            <DayElement
              key={element.id}
              element={element}
              onToggle={() => onElementToggle(element.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface DayElementProps {
  element: DayCategory['elements'][0];
  onToggle: () => void;
}

function DayElement({ element, onToggle }: DayElementProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isPressed = element.completed;

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        {
          borderColor: colors.icon + '33',
          backgroundColor: isPressed ? colors.tint : colors.background,
        },
      ]}
      onPress={onToggle}>
      {element.icon_name && (
        <View style={styles.pillIcon}>
          {renderIcon(
            element.icon_name,
            16,
            isPressed ? (colorScheme === 'dark' ? '#000' : '#fff') : colors.tint
          )}
        </View>
      )}
      <Text
        style={[
          styles.pillText,
          {
            color: isPressed ? (colorScheme === 'dark' ? '#000' : '#fff') : colors.text,
          },
        ]}>
        {element.name}
      </Text>
    </TouchableOpacity>
  );
}
