import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { YearView } from '@/components/year-view';
import { YearPicker } from '@/components/year-picker';
import { Colors, Fonts } from '@/constants/theme';
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
    todayDate,
    yearPickerVisible,
    handleDayPress,
    handleYearPress,
    handleSelectYear,
    handleCancelYearPicker,
    handleGoToToday,
  } = useHomePageController();

  // Gradient colors based on theme
  const gradientColors = colorScheme === 'dark'
    ? [colors.background, '#1F1C19', colors.background] as const
    : [colors.background, '#F5F1E8', colors.background] as const;

  if (loading) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleYearPress} style={styles.yearButton}>
          <Text style={[styles.yearText, { color: colors.text, fontFamily: Fonts?.default }]}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.todayButton} onPress={handleGoToToday}>
          <Ionicons name="today-outline" size={22} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.yearContainer}>
          <YearView year={selectedYear} scores={scores} onDayPress={handleDayPress} />
        </View>
      </View>

      <YearPicker
        visible={yearPickerVisible}
        currentYear={selectedYear}
        onSelectYear={handleSelectYear}
        onCancel={handleCancelYearPicker}
      />
    </LinearGradient>
  );
}
