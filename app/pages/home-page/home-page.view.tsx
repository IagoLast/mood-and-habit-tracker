import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YearView } from '@/components/year-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHomePageController } from './home-page.controller';
import { styles } from './home-page.styles';

export function HomePageView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    loading,
    scores,
    selectedYear,
    todayZts,
    handleDayPress,
    handlePreviousYear,
    handleNextYear,
  } = useHomePageController();

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
        <Text style={[styles.title, { color: colors.text }]}>Habit Tracker</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleDayPress(todayZts)}>
          <Ionicons name="add" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={[styles.yearContainer, { backgroundColor: colors.background }]}>
          <View style={styles.yearHeader}>
            <TouchableOpacity
              style={[styles.yearButton, { backgroundColor: colors.icon + '20' }]}
              onPress={handlePreviousYear}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.yearTitle, { color: colors.text }]}>{selectedYear}</Text>
            <TouchableOpacity
              style={[styles.yearButton, { backgroundColor: colors.icon + '20' }]}
              onPress={handleNextYear}>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <YearView year={selectedYear} scores={scores} onDayPress={handleDayPress} />
        </View>
      </View>
    </View>
  );
}
