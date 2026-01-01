import type { Element } from '@/types';

interface UseCreateEditHabitDialogControllerParams {
  editingHabit: Element | null;
}

export function useCreateEditHabitDialogController({
  editingHabit,
}: UseCreateEditHabitDialogControllerParams) {
  const title = editingHabit ? 'Editar Hábito' : 'Nuevo Hábito';
  const saveButtonText = editingHabit ? 'Guardar' : 'Crear';

  return {
    title,
    saveButtonText,
  };
}
