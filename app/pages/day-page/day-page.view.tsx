import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { commonStyles } from '@/constants/common.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DayCategoryView } from './components/day-category/day-category.view';
import { useDayPageController } from './day-page.controller';
import { styles } from './day-page.styles';

export function DayPageView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    loading,
    categories,
    score,
    dateZts,
    formatDate,
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
      <View style={[commonStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[commonStyles.headerTitle, { color: colors.text, textTransform: 'capitalize' }]}>{formatDate(dateZts)}</Text>
        <View style={commonStyles.placeholder} />
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
            <DayCategoryView
              key={category.id}
              category={category}
              onElementToggle={handleToggleCompletion}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
