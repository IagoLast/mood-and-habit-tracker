import { useMemo } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  createZonedDateTimeString,
  parseZonedDateTimeString,
  getTodayZonedDateTimeString,
} from '@/utils/temporal';
import { useGetDayQuery, useUpdateDayMutation } from '@/queries/days.queries';
import { useCreateCompletionMutation, useDeleteCompletionMutation } from '@/queries/completions.queries';

export function useDayPageController() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();

  const dateZts = date
    ? createZonedDateTimeString(
        parseInt(date.split('-')[0]),
        parseInt(date.split('-')[1]),
        parseInt(date.split('-')[2])
      )
    : getTodayZonedDateTimeString();

  const dateParam = date || dateZts.split('T')[0];
  const { data: dayData, isLoading } = useGetDayQuery({ date: dateParam });
  const updateDayMutation = useUpdateDayMutation();
  const createCompletionMutation = useCreateCompletionMutation();
  const deleteCompletionMutation = useDeleteCompletionMutation();

  const handleToggleCompletion = async (elementId: number) => {
    if (!dayData) return;

    const currentCompleted = dayData.categories
      .flatMap((cat) => cat.elements)
      .find((elem) => elem.id === elementId)?.completed ?? false;

    const newCompleted = !currentCompleted;

    try {
      if (newCompleted) {
        await createCompletionMutation.mutateAsync({
          elementId,
          dateZts: dayData.date_zts,
        });
      } else {
        await deleteCompletionMutation.mutateAsync({
          elementId,
          dateZts: dayData.date_zts,
        });
      }
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
      await updateDayMutation.mutateAsync({
        date: dateParam,
        data: {
          score: newScore,
          elements: updatedElements,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la puntuación');
      console.error(error);
    }
  };

  const handleGoBack = () => {
    router.push('/');
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

  const categories = useMemo(() => dayData?.categories ?? [], [dayData]);

  return {
    loading: isLoading,
    categories,
    score: dayData?.score ?? null,
    dateZts,
    formatDate,
    handleToggleCompletion,
    handleScorePress,
    handleGoBack,
  };
}
