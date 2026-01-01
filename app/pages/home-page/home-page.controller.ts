import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Temporal } from 'temporal-polyfill';
import { useListScoresQuery } from '@/queries/scores.queries';
import { getTodayPlainDateString } from '@/utils/temporal';

export function useHomePageController() {
  const router = useRouter();
  const today = Temporal.Now.plainDateISO();
  const [selectedYear, setSelectedYear] = useState(today.year);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const dateRange = useMemo(() => {
    const startDate = Temporal.PlainDate.from({ year: selectedYear, month: 1, day: 1 });
    const endDate = Temporal.PlainDate.from({ year: selectedYear + 1, month: 1, day: 1 }).subtract({ days: 1 });

    return {
      startDate: startDate.toString(),
      endDate: endDate.toString(),
    };
  }, [selectedYear]);

  const { data: scores, isLoading } = useListScoresQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const loading = isLoading;
  const scoresArray = scores ?? [];

  const handleDayPress = (date: string) => {
    router.push(`/day/${date}`);
  };

  const handleYearPress = () => {
    setYearPickerVisible(true);
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setYearPickerVisible(false);
  };

  const handleCancelYearPicker = () => {
    setYearPickerVisible(false);
  };

  const handleGoToToday = () => {
    const todayDate = getTodayPlainDateString();
    router.push(`/day/${todayDate}`);
  };

  const todayDate = getTodayPlainDateString();

  return {
    loading,
    scores: scoresArray,
    selectedYear,
    todayDate,
    yearPickerVisible,
    handleDayPress,
    handleYearPress,
    handleSelectYear,
    handleCancelYearPicker,
    handleGoToToday,
  };
}
