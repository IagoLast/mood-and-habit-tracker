import { View, Text, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { styles } from './date-picker-modal.styles';

interface DatePickerModalProps {
  visible: boolean;
  currentDate: string;
  onSelectDate: (date: string) => void;
  onCancel: () => void;
}

export function DatePickerModal({ visible, currentDate, onSelectDate, onCancel }: DatePickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [dateText, setDateText] = useState(currentDate);

  useEffect(() => {
    if (visible) {
      setDateText(currentDate);
    }
  }, [visible, currentDate]);

  const handleConfirm = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateText)) {
      onSelectDate(dateText);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar fecha</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.icon + '33',
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Fecha (YYYY-MM-DD)"
            placeholderTextColor={colors.icon + '99'}
            value={dateText}
            onChangeText={setDateText}
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
