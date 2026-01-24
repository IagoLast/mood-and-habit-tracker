import { useMemo } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTodayPlainDateString, parsePlainDateString } from '@/utils/temporal';
import { useGetDayQuery, useUpdateDayMutation } from '@/queries/days.queries';

export function useDayPageController() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();

  const dateParam = date || getTodayPlainDateString();
  const { data: dayData, isLoading } = useGetDayQuery({ date: dateParam });
  const updateDayMutation = useUpdateDayMutation();

  const handleToggleCompletion = async (elementId: number) => {
    if (!dayData) return;

    const updatedElements = dayData.categories
      .flatMap((cat) => cat.elements)
      .map((elem) => ({
        elementId: elem.id,
        completed:
          elem.id === elementId
            ? elem.completed
              ? ('NOT_COMPLETED' as const)
              : ('COMPLETED' as const)
            : elem.completed
              ? ('COMPLETED' as const)
              : ('NOT_COMPLETED' as const),
      }));

    try {
      await updateDayMutation.mutateAsync({
        date: dateParam,
        data: {
          elements: updatedElements,
        },
      });
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

  const formatDate = (dateString: string): string => {
    const plainDate = parsePlainDateString(dateString);
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
    date: dateParam,
    formatDate,
    handleToggleCompletion,
    handleScorePress,
    handleGoBack,
  };
}
