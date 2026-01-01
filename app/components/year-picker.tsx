import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import { styles } from './year-picker.styles';

interface YearPickerProps {
  visible: boolean;
  currentYear: number;
  onSelectYear: (year: number) => void;
  onCancel: () => void;
}

const YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);

export function YearPicker({ visible, currentYear, onSelectYear, onCancel }: YearPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 50;

  useEffect(() => {
    if (visible) {
      setSelectedYear(currentYear);
      setTimeout(() => {
        const index = YEARS.indexOf(currentYear);
        if (index >= 0 && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: index * itemHeight - 100,
            animated: true,
          });
        }
      }, 100);
    }
  }, [visible, currentYear]);

  const handleSelect = (year: number) => {
    setSelectedYear(year);
    onSelectYear(year);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar año</Text>
          <View style={styles.pickerContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              {YEARS.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearItem,
                    {
                      backgroundColor: year === selectedYear ? colors.tint + '20' : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(year)}>
                  <Text
                    style={[
                      styles.yearText,
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
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
              onPress={onCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
