import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Temporal } from 'temporal-polyfill';
import {
  createZonedDateTimeString,
  parseZonedDateTimeString,
  getTodayZonedDateTimeString,
} from '@/utils/temporal';
import { useGetDayQuery, useUpdateDayMutation } from '@/queries/days.queries';

export function useDayPageController() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const [datePickerVisible, setDatePickerVisible] = useState(false);

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

  const handleSelectDate = () => {
    setDatePickerVisible(true);
  };

  const handleConfirmDate = (dateString: string) => {
    router.push(`/day/${dateString}`);
    setDatePickerVisible(false);
  };

  const handleCancelDatePicker = () => {
    setDatePickerVisible(false);
  };

  const getCurrentDateString = (): string => {
    const zonedDateTime = parseZonedDateTimeString(dateZts);
    const plainDate = zonedDateTime.toPlainDate();
    return `${plainDate.year}-${String(plainDate.month).padStart(2, '0')}-${String(plainDate.day).padStart(2, '0')}`;
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
    datePickerVisible,
    formatDate,
    handleToggleCompletion,
    handleScorePress,
    handleGoBack,
    handleSelectDate,
    handleConfirmDate,
    handleCancelDatePicker,
    getCurrentDateString,
  };
}
