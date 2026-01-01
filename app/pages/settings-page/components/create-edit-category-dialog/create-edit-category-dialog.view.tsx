import { View, Text, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCreateEditCategoryDialogController } from './create-edit-category-dialog.controller';
import { styles } from './create-edit-category-dialog.styles';
import type { Category } from '@/types';

interface CreateEditCategoryDialogProps {
  visible: boolean;
  editingCategory: Category | null;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CreateEditCategoryDialogView({
  visible,
  editingCategory,
  categoryName,
  onCategoryNameChange,
  onSave,
  onCancel,
}: CreateEditCategoryDialogProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { title, saveButtonText } = useCreateEditCategoryDialogController({ editingCategory });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
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
            placeholder="Nombre de la categoría"
            placeholderTextColor={colors.icon + '99'}
            value={categoryName}
            onChangeText={onCategoryNameChange}
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
