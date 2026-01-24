import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const completedCount = category.elements.filter((e) => e.completed).length;

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
        <Text style={[styles.habitCount, { color: colors.icon }]}>
          {completedCount}/{category.elements.length}
        </Text>
      </View>

      {category.elements.length === 0 ? (
        <Text style={[styles.noElementsText, { color: colors.icon + 'CC' }]}>
          No hay tareas en esta categoría
        </Text>
      ) : (
        <View style={styles.elementsContainer}>
          {category.elements.map((element) => (
            <HabitCard
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

interface HabitCardProps {
  element: DayCategory['elements'][0];
  onToggle: () => void;
}

function HabitCard({ element, onToggle }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isCompleted = element.completed;

  return (
    <TouchableOpacity
      style={[
        styles.habitCard,
        {
          backgroundColor: isCompleted ? colors.successLight : colors.surface,
        },
      ]}
      onPress={onToggle}
      activeOpacity={0.7}>
      {element.icon_name && (
        <View
          style={[
            styles.habitIconContainer,
            {
              backgroundColor: isCompleted ? colors.tint + '20' : colors.background,
            },
          ]}>
          {renderIcon(element.icon_name, 22, isCompleted ? colors.tint : colors.icon)}
        </View>
      )}
      <View style={styles.habitContent}>
        <Text
          style={[
            styles.habitName,
            {
              color: isCompleted ? colors.tint : colors.text,
            },
          ]}>
          {element.name}
        </Text>
      </View>
      <View
        style={[
          styles.checkmark,
          {
            backgroundColor: isCompleted ? colors.tint : colors.background,
          },
        ]}>
        {isCompleted && <Ionicons name="checkmark" size={18} color={colorScheme === 'dark' ? '#000' : '#fff'} />}
      </View>
    </TouchableOpacity>
  );
}
