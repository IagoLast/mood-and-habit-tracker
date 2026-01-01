import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Temporal } from 'temporal-polyfill';
import { useListScoresQuery } from '@/queries/scores.queries';
import { getTodayZonedDateTimeString } from '@/utils/temporal';
import { useAuth } from '@/contexts/auth.context';

export function useHomePageController() {
  const router = useRouter();
  const { user } = useAuth();
  const today = Temporal.Now.zonedDateTimeISO();
  const [selectedYear, setSelectedYear] = useState(today.year);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const dateRange = useMemo(() => {
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

  const handleDayPress = (dateZts: string) => {
    const zonedDateTime = Temporal.ZonedDateTime.from(dateZts);
    const dateString = zonedDateTime.toPlainDate().toString();
    router.push(`/day/${dateString}`);
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
    const todayZts = getTodayZonedDateTimeString();
    const zonedDateTime = Temporal.ZonedDateTime.from(todayZts);
    const dateString = zonedDateTime.toPlainDate().toString();
    router.push(`/day/${dateString}`);
  };

  const todayZts = getTodayZonedDateTimeString();

  return {
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
  };
}
