import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { IconPicker } from '@/components/icon-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCreateEditHabitDialogController } from './create-edit-habit-dialog.controller';
import { styles } from './create-edit-habit-dialog.styles';
import type { Habit } from '@/types';

interface CreateEditHabitDialogProps {
  visible: boolean;
  editingHabit: Habit | null;
  habitName: string;
  habitIconName: string | null;
  onHabitNameChange: (name: string) => void;
  onHabitIconNameChange: (iconName: string | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CreateEditHabitDialogView({
  visible,
  editingHabit,
  habitName,
  habitIconName,
  onHabitNameChange,
  onHabitIconNameChange,
  onSave,
  onCancel,
}: CreateEditHabitDialogProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { title, saveButtonText } = useCreateEditHabitDialogController({ editingHabit });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.icon + '33',
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Nombre del hábito"
              placeholderTextColor={colors.icon + '99'}
              value={habitName}
              onChangeText={onHabitNameChange}
              autoFocus
            />
            <IconPicker selectedIcon={habitIconName} onSelectIcon={onHabitIconNameChange} />
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
              onPress={onCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={onSave}>
              <Text style={[styles.saveButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
                {saveButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
