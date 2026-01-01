import { View, Text, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { styles } from './year-picker-modal.styles';

interface YearPickerModalProps {
  visible: boolean;
  currentYear: number;
  onSelectYear: (year: number) => void;
  onCancel: () => void;
}

export function YearPickerModal({ visible, currentYear, onSelectYear, onCancel }: YearPickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [yearText, setYearText] = useState(currentYear.toString());

  useEffect(() => {
    if (visible) {
      setYearText(currentYear.toString());
    }
  }, [visible, currentYear]);

  const handleConfirm = () => {
    const year = parseInt(yearText, 10);
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      onSelectYear(year);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar año</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.icon + '33',
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Año (1900-2100)"
            placeholderTextColor={colors.icon + '99'}
            value={yearText}
            onChangeText={setYearText}
            keyboardType="numeric"
            autoFocus
          />
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
