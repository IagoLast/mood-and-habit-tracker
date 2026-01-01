import { StyleSheet, View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { Temporal } from 'temporal-polyfill';
import type { DailyScore } from '@/types';
import { createZonedDateTimeString } from '@/utils/temporal';
import { Colors } from '@/constants/theme';

interface YearViewProps {
  year: number;
  scores: DailyScore[];
  onDayPress: (dateZts: string) => void;
}

const getScoreColor = (score: number | undefined, isDark: boolean): string => {
  if (!score) {
    return isDark ? '#161b22' : '#ebedf0';
  }
  
  // RdYlGn (Red-Yellow-Green) scale similar to D3
  // Red (low) -> Yellow (medium) -> Green (high)
  if (score >= 9) return isDark ? '#2ea043' : '#1a9850'; // Dark green
  if (score >= 7) return isDark ? '#3fb950' : '#66bd63'; // Light green
  if (score >= 5) return isDark ? '#d4a017' : '#fee08b'; // Yellow (darker in dark mode for better contrast)
  if (score >= 3) return isDark ? '#d97706' : '#fdae61'; // Orange/Yellow-orange (darker in dark mode)
  if (score >= 1) return isDark ? '#f85149' : '#d73027'; // Red
  return isDark ? '#161b22' : '#ebedf0';
};

const getTextColorForScore = (score: number | undefined, isDark: boolean, defaultTextColor: string): string => {
  if (!score) return defaultTextColor;
  
  // For yellow and orange scores, use black text for better contrast
  // Light mode: light backgrounds (#fee08b, #fdae61) -> black text
  // Dark mode: dark backgrounds (#d4a017, #d97706) -> black text
  if (score >= 5 && score < 7) {
    return '#000'; // Yellow - always black text
  }
  if (score >= 3 && score < 5) {
    return '#000'; // Light orange - always black text
  }
  
  // For other colors, use the default text color
  return defaultTextColor;
};

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function YearView({ year, scores, onDayPress }: YearViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const timeZone = Temporal.Now.zonedDateTimeISO().timeZoneId;
  const scoresByDate = new Map<string, DailyScore>();
  scores.forEach((score) => {
    const existing = scoresByDate.get(score.date_zts);
    if (!existing || score.updated_at_timestamp_ms > existing.updated_at_timestamp_ms) {
      scoresByDate.set(score.date_zts, score);
    }
  });

  const today = Temporal.Now.zonedDateTimeISO();
  const todayZts = createZonedDateTimeString(today.year, today.month, today.day);

  const grid: (Temporal.ZonedDateTime | null)[][] = [];
  
  for (let day = 1; day <= 31; day++) {
    const row: (Temporal.ZonedDateTime | null)[] = [];
    for (let month = 1; month <= 12; month++) {
      try {
        const date = Temporal.ZonedDateTime.from({
          year,
          month,
          day,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
          timeZone,
        });
        
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
              
              const dateZts = createZonedDateTimeString(day.year, day.month, day.day);
              const score = scoresByDate.get(dateZts);
              const isToday = dateZts === todayZts;
              const color = getScoreColor(score?.score, isDark);
              const textColor = getTextColorForScore(score?.score, isDark, colors.text);

              return (
                <TouchableOpacity
                  key={dateZts}
                  style={styles.dayContainer}
                  onPress={() => onDayPress(dateZts)}>
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
    paddingBottom: 4,
    marginBottom: 4,
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
  },
  dayNumber: {
    fontSize: 8,
    fontWeight: '500',
  },
  todaySquare: {
    borderWidth: 2,
  },
});
