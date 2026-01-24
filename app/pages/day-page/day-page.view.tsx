import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { commonStyles } from '@/constants/common.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DatePicker } from '@/components/date-picker';
import { DayCategoryView } from './components/day-category/day-category.view';
import { useDayPageController } from './day-page.controller';
import { styles } from './day-page.styles';

export function DayPageView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();
  const {
    loading,
    categories,
    score,
    date,
    datePickerVisible,
    formatDate,
    handleToggleCompletion,
    handleScorePress,
    handleGoBack,
    handleSelectDate,
    handleConfirmDate,
    handleCancelDatePicker,
    getCurrentDateString,
  } = useDayPageController();

  const CARD_PADDING = 20;
  const CONTAINER_PADDING = 16;
  const SCORE_GAP = 8;
  const NUM_SCORES = 10;
  const availableWidth = width - (CONTAINER_PADDING * 2) - (CARD_PADDING * 2);
  const totalGapSpace = SCORE_GAP * (NUM_SCORES - 1);
  const buttonSize = Math.max(28, Math.min(36, (availableWidth - totalGapSpace) / NUM_SCORES));
  const fontSize = Math.max(12, Math.min(14, buttonSize * 0.45));

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[commonStyles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.tint} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSelectDate} style={styles.dateContainer}>
          <Text style={[commonStyles.headerTitle, { color: colors.text, textTransform: 'capitalize' }]}>{formatDate(date)}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.tint} />
        </TouchableOpacity>
        <View style={commonStyles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Score Card */}
        <View style={[styles.scoreCard, { backgroundColor: colors.surface }]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreTitle, { color: colors.text }]}>Estado de ánimo</Text>
            <Text style={[styles.scoreValue, { color: score ? colors.tint : colors.icon }]}>
              {score ?? '–'}
            </Text>
          </View>
          <View style={[styles.scoreContainer, { gap: SCORE_GAP }]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.scoreButton,
                  {
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: buttonSize / 2,
                    backgroundColor: colors.background,
                  },
                  score === s && [styles.scoreButtonSelected, { backgroundColor: colors.tint }],
                ]}
                onPress={() => handleScorePress(s)}>
                <Text
                  style={[
                    styles.scoreText,
                    { fontSize, color: colors.icon },
                    score === s && [styles.scoreTextSelected, { color: colorScheme === 'dark' ? '#000' : '#fff' }],
                  ]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
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

      <DatePicker
        visible={datePickerVisible}
        currentDate={date}
        onSelectDate={handleConfirmDate}
        onCancel={handleCancelDatePicker}
      />
    </View>
  );
}
