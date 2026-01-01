import { StyleSheet, View, TouchableOpacity, ScrollView, Text, useColorScheme } from 'react-native';
import { Temporal } from 'temporal-polyfill';
import type { ScoreEntry } from '@/types';
import { getTodayPlainDateString, parsePlainDateString } from '@/utils/temporal';
import { Colors } from '@/constants/theme';

interface TimelineProps {
  scores: ScoreEntry[];
  onDayPress: (date: string) => void;
}

const getScoreColor = (score: number | undefined, isDark: boolean): string => {
  if (!score) return isDark ? '#161b22' : '#e0e0e0';
  
  if (score >= 8) return isDark ? '#2ea043' : '#4CAF50';
  if (score >= 6) return isDark ? '#3fb950' : '#8BC34A';
  if (score >= 5) return isDark ? '#d4a017' : '#FFC107'; // Yellow (darker in dark mode)
  if (score >= 4) return isDark ? '#d97706' : '#FF9800'; // Orange (darker in dark mode)
  return isDark ? '#f85149' : '#F44336';
};

const formatDate = (dateString: string): string => {
  const plainDate = parsePlainDateString(dateString);
  return plainDate.day.toString();
};

export function Timeline({ scores, onDayPress }: TimelineProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  
  const scoresByDate = new Map<string, ScoreEntry>();
  scores.forEach((score) => {
    scoresByDate.set(score.date, score);
  });

  const today = Temporal.Now.plainDateISO();
  const days: Temporal.PlainDate[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = today.subtract({ days: i });
    days.push(date);
  }

  const todayDateString = today.toString();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.timeline}>
          {days.map((date) => {
            const dateString = date.toString();
            const score = scoresByDate.get(dateString);
            const isToday = dateString === todayDateString;
            const color = getScoreColor(score?.score, isDark);

            return (
              <TouchableOpacity
                key={dateString}
                style={styles.dayContainer}
                onPress={() => onDayPress(dateString)}>
                <View
                  style={[
                    styles.dayDot,
                    { backgroundColor: color, borderColor: colors.background },
                    isToday && [styles.todayDot, { borderColor: colors.tint }],
                  ]}
                />
                <Text style={[styles.dayLabel, { color: colors.icon }]}>{formatDate(dateString)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  todayDot: {
    borderWidth: 3,
  },
  dayLabel: {
    fontSize: 12,
  },
});
