import type { Habit } from '@/types';

interface UseCreateEditHabitDialogControllerParams {
  editingHabit: Habit | null;
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
