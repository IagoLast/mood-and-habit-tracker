import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  createZonedDateTimeString,
  parseZonedDateTimeString,
  getTodayZonedDateTimeString,
} from '@/utils/temporal';
import { useAuth } from '@/contexts/auth.context';
import { daysRepository, type DayData, type DayCategory } from '@/repositories/days.repository';

export function useDayPageController() {
  const { user } = useAuth();
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);

  const dateZts = date
    ? createZonedDateTimeString(
        parseInt(date.split('-')[0]),
        parseInt(date.split('-')[1]),
        parseInt(date.split('-')[2])
      )
    : getTodayZonedDateTimeString();

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const dateParam = date || dateZts.split('T')[0];
      const data = await daysRepository.getByDate({ date: dateParam });
      setDayData(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, date, dateZts]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleToggleCompletion = async (elementId: number) => {
    if (!dayData) return;

    const currentCompleted = dayData.categories
      .flatMap((cat) => cat.elements)
      .find((elem) => elem.id === elementId)?.completed ?? false;

    const updatedElements = dayData.categories
      .flatMap((cat) => cat.elements)
      .map((elem) => ({
        elementId: elem.id,
        completed:
          elem.id === elementId
            ? currentCompleted
              ? ('NOT_COMPLETED' as const)
              : ('COMPLETED' as const)
            : elem.completed
            ? ('COMPLETED' as const)
            : ('NOT_COMPLETED' as const),
      }));

    try {
      const dateParam = date || dateZts.split('T')[0];
      const updated = await daysRepository.update({
        date: dateParam,
        data: {
          score: dayData.score,
          elements: updatedElements,
        },
      });
      setDayData(updated);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      console.error(error);
    }
  };

  const handleScorePress = async (newScore: number) => {
    if (!dayData) return;

    const updatedElements = dayData.categories
      .flatMap((cat) => cat.elements)
      .map((elem) => ({
        elementId: elem.id,
        completed: elem.completed ? ('COMPLETED' as const) : ('NOT_COMPLETED' as const),
      }));

    try {
      const dateParam = date || dateZts.split('T')[0];
      const updated = await daysRepository.update({
        date: dateParam,
        data: {
          score: newScore,
          elements: updatedElements,
        },
      });
      setDayData(updated);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la puntuación');
      console.error(error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatDate = (dateZtsString: string): string => {
    const zonedDateTime = parseZonedDateTimeString(dateZtsString);
    const plainDate = zonedDateTime.toPlainDate();
    const dateFormatter = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const year = plainDate.year;
    const month = plainDate.month - 1;
    const day = plainDate.day;
    const dateObj = new Date(year, month, day);
    return dateFormatter.format(dateObj);
  };

  const isElementCompleted = (elementId: number): boolean => {
    if (!dayData) return false;
    return (
      dayData.categories
        .flatMap((cat) => cat.elements)
        .find((elem) => elem.id === elementId)?.completed ?? false
    );
  };

  const categories = dayData?.categories ?? [];
  const elements: Record<number, DayCategory['elements']> = {};
  if (dayData) {
    dayData.categories.forEach((cat) => {
      elements[cat.id] = cat.elements;
    });
  }

  return {
    loading,
    categories,
    elements,
    score: dayData?.score ?? null,
    dateZts,
    formatDate,
    isElementCompleted,
    handleToggleCompletion,
    handleScorePress,
    handleGoBack,
  };
}
