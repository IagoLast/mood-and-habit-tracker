import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Temporal } from 'temporal-polyfill';
import { scoresRepository } from '@/repositories/scores.repository';
import { getTodayZonedDateTimeString } from '@/utils/temporal';
import { useAuth } from '@/contexts/auth.context';
import type { DailyScore } from '@/types';

export function useHomePageController() {
  const router = useRouter();
  const { user } = useAuth();
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

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  const todayZts = getTodayZonedDateTimeString();

  return {
    loading,
    scores,
    selectedYear,
    todayZts,
    handleDayPress,
    handlePreviousYear,
    handleNextYear,
  };
}
