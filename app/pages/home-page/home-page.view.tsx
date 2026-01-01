import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YearView } from '@/components/year-view';
import { YearPicker } from '@/components/year-picker';
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
    yearPickerVisible,
    handleDayPress,
    handleYearPress,
    handleSelectYear,
    handleCancelYearPicker,
    handleGoToToday,
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
        <View style={commonStyles.placeholder} />
        <TouchableOpacity onPress={handleYearPress}>
          <Text style={[commonStyles.headerTitle, { color: colors.text }]}>{selectedYear}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.todayButton} onPress={handleGoToToday}>
          <Ionicons name="today" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={[styles.yearContainer, { backgroundColor: colors.background }]}>
          <YearView year={selectedYear} scores={scores} onDayPress={handleDayPress} />
        </View>
      </View>

      <YearPicker
        visible={yearPickerVisible}
        currentYear={selectedYear}
        onSelectYear={handleSelectYear}
        onCancel={handleCancelYearPicker}
      />
    </View>
  );
}
