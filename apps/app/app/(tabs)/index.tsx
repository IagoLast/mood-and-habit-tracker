import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Temporal } from 'temporal-polyfill';
import { scoresRepository } from '@/repositories/scores.repository';
import { YearView } from '@/components/year-view';
import { getTodayZonedDateTimeString } from '@/utils/temporal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth.context';
import type { DailyScore } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const today = Temporal.Now.zonedDateTimeISO();
  const [selectedYear, setSelectedYear] = useState(today.year);
  const [scores, setScores] = useState<DailyScore[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScores = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const timeZone = Temporal.Now.zonedDateTimeISO().timeZoneId;
      const startDate = Temporal.ZonedDateTime.from({
        year: selectedYear,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        timeZone,
      });
      
      const endDate = Temporal.ZonedDateTime.from({
        year: selectedYear + 1,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        timeZone,
      }).subtract({ days: 1 });
      
      const scoresData = await scoresRepository.list({
        startDate: startDate.toString(),
        endDate: endDate.toString(),
      });
      
      setScores(scoresData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, user]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const handleDayPress = (dateZts: string) => {
    const zonedDateTime = Temporal.ZonedDateTime.from(dateZts);
    const dateString = zonedDateTime.toPlainDate().toString();
    router.push(`/day/${dateString}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Cargando...</Text>
      </View>
    );
  }

  const todayZts = getTodayZonedDateTimeString();

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  yearContainer: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 800,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContainer: {
    margin: 16,
    marginTop: 0,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
