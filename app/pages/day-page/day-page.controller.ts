import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Temporal } from 'temporal-polyfill';
import { categoriesRepository } from '@/repositories/categories.repository';
import { elementsRepository } from '@/repositories/elements.repository';
import { completionsRepository } from '@/repositories/completions.repository';
import { scoresRepository } from '@/repositories/scores.repository';
import {
  createZonedDateTimeString,
  parseZonedDateTimeString,
  getTodayZonedDateTimeString,
} from '@/utils/temporal';
import { useAuth } from '@/contexts/auth.context';
import type { Category, Element, DailyCompletion } from '@/types';

export function useDayPageController() {
  const { user } = useAuth();
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [elements, setElements] = useState<Record<number, Element[]>>({});
  const [completions, setCompletions] = useState<Record<number, string[]>>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const dateZts = date
    ? createZonedDateTimeString(
        parseInt(date.split('-')[0]),
        parseInt(date.split('-')[1]),
        parseInt(date.split('-')[2])
      )
    : getTodayZonedDateTimeString();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [date, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const cats = await categoriesRepository.list();
      setCategories(cats);

      const elementsMap: Record<number, Element[]> = {};
      const completionsMap: Record<number, string[]> = {};

      for (const cat of cats) {
        const elems = await elementsRepository.list({ categoryId: cat.id });
        elementsMap[cat.id] = elems;

        for (const elem of elems) {
          const comps = await completionsRepository.list({
            elementId: elem.id,
            dateZts: dateZts,
          });
          completionsMap[elem.id] = comps.map((c: DailyCompletion) => c.date_zts);
        }
      }

      setElements(elementsMap);
      setCompletions(completionsMap);

      try {
        const dailyScore = await scoresRepository.getByDate({ dateZts: dateZts });
        setScore(dailyScore.score);
      } catch {
        setScore(null);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async (elementId: number) => {
    const isCompleted = completions[elementId]?.includes(dateZts);

    try {
      if (isCompleted) {
        await completionsRepository.delete({
          elementId,
          dateZts: dateZts,
        });
        setCompletions({
          ...completions,
          [elementId]: (completions[elementId] || []).filter((d) => d !== dateZts),
        });
      } else {
        await completionsRepository.create({
          elementId,
          dateZts: dateZts,
        });
        setCompletions({
          ...completions,
          [elementId]: [...(completions[elementId] || []), dateZts],
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      console.error(error);
    }
  };

  const handleScorePress = async (newScore: number) => {
    try {
      await scoresRepository.create({
        dateZts: dateZts,
        score: newScore,
      });
      setScore(newScore);
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
    return completions[elementId]?.includes(dateZts) ?? false;
  };

  return {
    loading,
    categories,
    elements,
    score,
    dateZts,
    formatDate,
    isElementCompleted,
    handleToggleCompletion,
    handleScorePress,
    handleGoBack,
  };
}
