import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';
import { parsePlainDateString } from '@/utils/temporal';
import { styles } from './date-picker.styles';

interface DatePickerProps {
  visible: boolean;
  currentDate: string;
  onSelectDate: (date: string) => void;
  onCancel: () => void;
}

const generateYears = () => Array.from({ length: 201 }, (_, i) => 1900 + i);
const generateMonths = () => Array.from({ length: 12 }, (_, i) => i + 1);
const generateDays = (year: number, month: number) => {
  const daysInMonth = Temporal.PlainDate.from({ year, month, day: 1 }).daysInMonth;
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function DatePicker({ visible, currentDate, onSelectDate, onCancel }: DatePickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const parseCurrentDate = () => {
    try {
      const plainDate = parsePlainDateString(currentDate);
      return {
        year: plainDate.year,
        month: plainDate.month,
        day: plainDate.day,
      };
    } catch {
      const today = Temporal.Now.plainDateISO();
      return {
        year: today.year,
        month: today.month,
        day: today.day,
      };
    }
  };

  const initialDate = parseCurrentDate();
  const [selectedYear, setSelectedYear] = useState(initialDate.year);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.month);
  const [selectedDay, setSelectedDay] = useState(initialDate.day);

  useEffect(() => {
    if (visible) {
      const date = parseCurrentDate();
      setSelectedYear(date.year);
      setSelectedMonth(date.month);
      setSelectedDay(date.day);
    }
  }, [visible, currentDate]);

  const years = generateYears();
  const months = generateMonths();
  const days = generateDays(selectedYear, selectedMonth);

  useEffect(() => {
    const maxDay = days.length;
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedYear, selectedMonth, days.length, selectedDay]);

  const handleConfirm = () => {
    const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onSelectDate(dateString);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar fecha</Text>
          
          <View style={styles.pickersContainer}>
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: colors.icon }]}>Año</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: year === selectedYear ? colors.tint + '20' : 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedYear(year)}>
                    <Text
                      style={[
                        styles.pickerText,
                        {
                          color: year === selectedYear ? colors.tint : colors.text,
                          fontWeight: year === selectedYear ? 'bold' : 'normal',
                        },
                      ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: colors.icon }]}>Mes</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: month === selectedMonth ? colors.tint + '20' : 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedMonth(month)}>
                    <Text
                      style={[
                        styles.pickerText,
                        {
                          color: month === selectedMonth ? colors.tint : colors.text,
                          fontWeight: month === selectedMonth ? 'bold' : 'normal',
                        },
                      ]}>
                      {MONTH_NAMES[month - 1]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: colors.icon }]}>Día</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: day === selectedDay ? colors.tint + '20' : 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedDay(day)}>
                    <Text
                      style={[
                        styles.pickerText,
                        {
                          color: day === selectedDay ? colors.tint : colors.text,
                          fontWeight: day === selectedDay ? 'bold' : 'normal',
                        },
                      ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
              onPress={onCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleConfirm}>
              <Text style={[styles.saveButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
