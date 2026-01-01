import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { renderIcon } from '@/components/icon-picker';
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
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth.context';
import type { Category, Element, DailyCompletion, DailyScore } from '@/types';

export default function DayScreen() {
  const { user } = useAuth();
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{formatDate(dateZts)}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.scoreSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estado de ánimo</Text>
          <View style={styles.scoreContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.scoreButton,
                  { borderColor: colors.icon + '33', backgroundColor: colors.background },
                  score === s && [styles.scoreButtonSelected, { backgroundColor: colors.tint, borderColor: colors.tint }],
                ]}
                onPress={() => handleScorePress(s)}>
                <Text
                  style={[
                    styles.scoreText,
                    { color: colors.icon },
                    score === s && [styles.scoreTextSelected, { color: colorScheme === 'dark' ? '#000' : '#fff' }],
                  ]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>No hay categorías aún</Text>
            <Text style={[styles.emptySubtext, { color: colors.icon + 'CC' }]}>Ve a Ajustes para crear categorías y tareas</Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={[styles.categoryCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>

              {(elements[category.id] || []).length === 0 ? (
                <Text style={[styles.noElementsText, { color: colors.icon + 'CC' }]}>No hay tareas en esta categoría</Text>
              ) : (
                (elements[category.id] || []).map((element) => {
                  const isCompleted = completions[element.id]?.includes(dateZts);
                  return (
                    <TouchableOpacity
                      key={element.id}
                      style={[styles.elementRow, { borderBottomColor: colors.icon + '33' }]}
                      onPress={() => handleToggleCompletion(element.id)}>
                      <View style={[styles.checkbox, { borderColor: colors.tint }]}>
                        {isCompleted && (
                          <Ionicons name="checkmark" size={20} color={colors.tint} />
                        )}
                      </View>
                      {element.icon_name && (
                        <View style={styles.elementIcon}>
                          {renderIcon(element.icon_name, 20, isCompleted ? colors.icon + '99' : colors.tint)}
                        </View>
                      )}
                      <Text
                        style={[
                          styles.elementName,
                          { color: colors.text },
                          isCompleted && [styles.elementNameCompleted, { color: colors.icon + '99' }],
                        ]}>
                        {element.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ))
        )}
      </ScrollView>
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
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scoreSection: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonSelected: {
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreTextSelected: {
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  categoryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noElementsText: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  elementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementIcon: {
    marginRight: 12,
  },
  elementName: {
    fontSize: 16,
    flex: 1,
  },
  elementNameCompleted: {
    textDecorationLine: 'line-through',
  },
});
