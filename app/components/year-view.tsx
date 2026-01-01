import { StyleSheet, View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { Temporal } from 'temporal-polyfill';
import type { ScoreEntry } from '@/types';
import { getTodayPlainDateString } from '@/utils/temporal';
import { Colors } from '@/constants/theme';

interface YearViewProps {
  year: number;
  scores: ScoreEntry[];
  onDayPress: (date: string) => void;
}

const getScoreColor = (score: number | undefined, isDark: boolean): string => {
  if (!score) {
    return isDark ? '#161b22' : '#ebedf0';
  }
  
  // Pastel color scale: 10 colors from red (low) to green (high)
  // Each score (1-10) maps to a specific pastel color (more saturated)
  const pastelColors = {
    light: [
      '#ff9aa2', // 1 - Saturated pink/red
      '#ffb3a3', // 2 - Saturated coral
      '#ffcc9a', // 3 - Saturated peach
      '#ffe59a', // 4 - Saturated orange
      '#fff19a', // 5 - Saturated yellow-orange
      '#ffff9a', // 6 - Saturated yellow
      '#e6ff9a', // 7 - Saturated yellow-green
      '#ccff9a', // 8 - Saturated green-yellow
      '#9affb3', // 9 - Saturated green
      '#9affcc', // 10 - Saturated light green
    ],
    dark: [
      '#cc4a5a', // 1 - Darker saturated red
      '#d45a5a', // 2 - Darker saturated red-orange
      '#e67a4a', // 3 - Darker saturated orange
      '#f29a4a', // 4 - Darker saturated orange-yellow
      '#ffba4a', // 5 - Darker saturated yellow-orange
      '#ffda4a', // 6 - Darker saturated yellow
      '#e6da4a', // 7 - Darker saturated yellow-green
      '#b3da4a', // 8 - Darker saturated green-yellow
      '#7ada5a', // 9 - Darker saturated green
      '#5ada7a', // 10 - Darker saturated medium green
    ],
  };
  
  const colors = pastelColors[isDark ? 'dark' : 'light'];
  const index = Math.min(Math.max(score - 1, 0), colors.length - 1);
  return colors[index];
};

const getTextColorForScore = (score: number | undefined, isDark: boolean, defaultTextColor: string): string => {
  if (!score) return defaultTextColor;
  
  // For pastel colors in the middle range (scores 4-7), use dark text for better contrast
  // Light mode: light pastel backgrounds need dark text
  // Dark mode: darker pastel backgrounds can use light text, but some middle ones need dark text
  if (!isDark) {
    // Light mode: use dark text for lighter pastel colors (scores 3-8)
    if (score >= 3 && score <= 8) {
      return '#000';
    }
  } else {
    // Dark mode: use dark text for lighter pastel colors in the middle range (scores 5-7)
    if (score >= 5 && score <= 7) {
      return '#000';
    }
  }
  
  // For other colors, use the default text color
  return defaultTextColor;
};

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function YearView({ year, scores, onDayPress }: YearViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
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
          <Text key={index} style={[styles.monthLabel, { color: colors.icon }]}>{month}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((day, colIndex) => {
              if (!day) {
                return <View key={`${rowIndex}-${colIndex}`} style={[styles.dayPlaceholder, { backgroundColor: colors.background }]} />;
              }
              
              const dateString = day.toString();
              const score = scoresByDate.get(dateString);
              const isToday = dateString === todayPlainDate;
              const color = getScoreColor(score?.score, isDark);
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
                    <Text style={[styles.dayNumber, { color: textColor }]}>{day.day}</Text>
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
    justifyContent: 'space-around',
    paddingBottom: 2,
    marginBottom: 2,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '500',
  },
  grid: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
    minHeight: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  dayContainer: {
    flex: 1,
    aspectRatio: 1,
  },
  dayPlaceholder: {
    flex: 1,
    aspectRatio: 1,
  },
  daySquare: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  dayNumber: {
    fontSize: 8,
    fontWeight: '500',
  },
  todaySquare: {
    borderWidth: 2,
  },
});
