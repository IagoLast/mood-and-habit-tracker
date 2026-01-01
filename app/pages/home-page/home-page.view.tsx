import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YearView } from '@/components/year-view';
import { Colors } from '@/constants/theme';
import { commonStyles } from '@/constants/common.styles';
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
      <View style={[commonStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <TouchableOpacity style={styles.yearButton} onPress={handlePreviousYear}>
          <Ionicons name="chevron-back" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[commonStyles.headerTitle, { color: colors.text }]}>{selectedYear}</Text>
        <TouchableOpacity style={styles.yearButton} onPress={handleNextYear}>
          <Ionicons name="chevron-forward" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={[styles.yearContainer, { backgroundColor: colors.background }]}>
          <YearView year={selectedYear} scores={scores} onDayPress={handleDayPress} />
        </View>
      </View>
    </View>
  );
}
