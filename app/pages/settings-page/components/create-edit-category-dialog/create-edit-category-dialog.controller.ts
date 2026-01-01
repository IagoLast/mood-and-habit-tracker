import type { Category } from '@/types';

interface UseCreateEditCategoryDialogControllerParams {
  editingCategory: Category | null;
}

export function useCreateEditCategoryDialogController({
  editingCategory,
}: UseCreateEditCategoryDialogControllerParams) {
  const title = editingCategory ? 'Editar Categoría' : 'Nueva Categoría';
  const saveButtonText = editingCategory ? 'Guardar' : 'Crear';

  return {
    title,
    saveButtonText,
  };
}
