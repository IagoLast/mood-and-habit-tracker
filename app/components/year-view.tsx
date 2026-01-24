import { StyleSheet, View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { Temporal } from 'temporal-polyfill';
import type { ScoreEntry } from '@/types';
import { getTodayPlainDateString } from '@/utils/temporal';
import { Colors, Fonts } from '@/constants/theme';

interface YearViewProps {
  year: number;
  scores: ScoreEntry[];
  onDayPress: (date: string) => void;
}

const getScoreColor = (score: number | undefined, isDark: boolean, emptyColor: string): string => {
  if (!score) {
    return emptyColor;
  }

  // Warm color scale from muted terracotta/coral (low) to sage green (high)
  const warmColors = {
    light: [
      '#E8A598', // 1 - Muted terracotta
      '#EAAD9C', // 2 - Soft coral
      '#ECB8A5', // 3 - Peachy
      '#EEC9B0', // 4 - Warm sand
      '#E8D5B5', // 5 - Cream
      '#DFE0B8', // 6 - Pale olive
      '#D0DDB5', // 7 - Sage hint
      '#BFDAB5', // 8 - Light sage
      '#A7D4B4', // 9 - Sage
      '#8FCFB5', // 10 - Full sage green
    ],
    dark: [
      '#8B5A50', // 1 - Dark terracotta
      '#8E6355', // 2 - Dark coral
      '#916B5A', // 3 - Dark peach
      '#937560', // 4 - Dark sand
      '#8E8060', // 5 - Dark cream
      '#868865', // 6 - Dark olive
      '#7A8B68', // 7 - Dark sage hint
      '#6E8F6A', // 8 - Dark light sage
      '#62926D', // 9 - Dark sage
      '#569670', // 10 - Dark full sage
    ],
  };

  const colors = warmColors[isDark ? 'dark' : 'light'];
  const index = Math.min(Math.max(score - 1, 0), colors.length - 1);
  return colors[index];
};

const getTextColorForScore = (score: number | undefined, isDark: boolean, defaultTextColor: string): string => {
  if (!score) return defaultTextColor + '80'; // More transparent for empty cells

  // Warm text colors for better readability
  if (!isDark) {
    // Light mode: use warm dark brown for all scores
    return '#3D3833';
  } else {
    // Dark mode: use warm light color
    return '#F5F2ED';
  }
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function YearView({ year, scores, onDayPress }: YearViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const emptyColor = isDark ? colors.surface : colors.surface;

  const scoresByDate = new Map<string, ScoreEntry>();
  scores.forEach((score) => {
    scoresByDate.set(score.date, score);
  });

  const todayPlainDate = getTodayPlainDateString();

  const grid: (Temporal.PlainDate | null)[][] = [];

  for (let day = 1; day <= 31; day++) {
    const row: (Temporal.PlainDate | null)[] = [];
    for (let month = 1; month <= 12; month++) {
      try {
        const date = Temporal.PlainDate.from({ year, month, day });
        if (date.month === month && date.day === day) {
          row.push(date);
        } else {
          row.push(null);
        }
      } catch {
        row.push(null);
      }
    }
    grid.push(row);
  }

  return (
    <View style={styles.container}>
      <View style={styles.monthLabels}>
        {MONTHS.map((month, index) => (
          <Text key={index} style={[styles.monthLabel, { color: colors.text, fontFamily: Fonts?.default }]}>
            {month}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((day, colIndex) => {
              if (!day) {
                return (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={[styles.dayPlaceholder, { backgroundColor: 'transparent' }]}
                  />
                );
              }

              const dateString = day.toString();
              const score = scoresByDate.get(dateString);
              const isToday = dateString === todayPlainDate;
              const color = getScoreColor(score?.score, isDark, emptyColor);
              const textColor = getTextColorForScore(score?.score, isDark, colors.text);

              return (
                <TouchableOpacity
                  key={dateString}
                  style={styles.dayContainer}
                  onPress={() => onDayPress(dateString)}>
                  <View
                    style={[
                      styles.daySquare,
                      { backgroundColor: color },
                      isToday && [styles.todaySquare, { borderColor: colors.tint }],
                    ]}>
                    <Text style={[styles.dayNumber, { color: textColor, fontFamily: Fonts?.default }]}>
                      {day.day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  monthLabels: {
    flexDirection: 'row',
    gap: 5,
    paddingBottom: 4,
    marginBottom: 4,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  grid: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    minHeight: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  dayContainer: {
    flex: 1,
    aspectRatio: 1,
  },
  dayPlaceholder: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
  },
  daySquare: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  dayNumber: {
    fontSize: 8,
    fontWeight: '600',
  },
  todaySquare: {
    borderWidth: 2,
  },
});
