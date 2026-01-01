import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { commonStyles } from '@/constants/common.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from './stats-page.styles';

export function StatsPageView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[commonStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <View style={commonStyles.placeholder} />
        <Text style={[commonStyles.headerTitle, { color: colors.text }]}>Estadísticas</Text>
        <View style={commonStyles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="stats-chart-outline" size={64} color={colors.tint} />
          </View>
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Próximamente</Text>
          <Text style={[styles.comingSoonText, { color: colors.icon }]}>
            Las estadísticas estarán disponibles pronto
          </Text>
        </View>
      </View>
    </View>
  );
}
