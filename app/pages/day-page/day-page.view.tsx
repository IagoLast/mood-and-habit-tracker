import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { renderIcon } from '@/components/icon-picker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDayPageController } from './day-page.controller';
import { styles } from './day-page.styles';

export function DayPageView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    loading,
    categories,
    elements,
    score,
    dateZts,
    formatDate,
    isElementCompleted,
    handleToggleCompletion,
    handleScorePress,
    handleGoBack,
  } = useDayPageController();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{formatDate(dateZts)}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.scoreSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estado de ánimo</Text>
          <View style={styles.scoreContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.scoreButton,
                  { borderColor: colors.icon + '33', backgroundColor: colors.background },
                  score === s && [styles.scoreButtonSelected, { backgroundColor: colors.tint, borderColor: colors.tint }],
                ]}
                onPress={() => handleScorePress(s)}>
                <Text
                  style={[
                    styles.scoreText,
                    { color: colors.icon },
                    score === s && [styles.scoreTextSelected, { color: colorScheme === 'dark' ? '#000' : '#fff' }],
                  ]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>No hay categorías aún</Text>
            <Text style={[styles.emptySubtext, { color: colors.icon + 'CC' }]}>
              Ve a Ajustes para crear categorías y tareas
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={[styles.categoryCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>

              {(elements[category.id] || []).length === 0 ? (
                <Text style={[styles.noElementsText, { color: colors.icon + 'CC' }]}>
                  No hay tareas en esta categoría
                </Text>
              ) : (
                (elements[category.id] || []).map((element) => {
                  const isCompleted = isElementCompleted(element.id);
                  return (
                    <TouchableOpacity
                      key={element.id}
                      style={[styles.elementRow, { borderBottomColor: colors.icon + '33' }]}
                      onPress={() => handleToggleCompletion(element.id)}>
                      <View style={[styles.checkbox, { borderColor: colors.tint }]}>
                        {isCompleted && <Ionicons name="checkmark" size={20} color={colors.tint} />}
                      </View>
                      {element.icon_name && (
                        <View style={styles.elementIcon}>
                          {renderIcon(element.icon_name, 20, isCompleted ? colors.icon + '99' : colors.tint)}
                        </View>
                      )}
                      <Text
                        style={[
                          styles.elementName,
                          { color: colors.text },
                          isCompleted && [styles.elementNameCompleted, { color: colors.icon + '99' }],
                        ]}>
                        {element.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
