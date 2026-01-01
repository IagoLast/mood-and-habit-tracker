import { useState, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { useGetHabitsQuery, useUpsertHabitsMutation } from '@/queries/habits.queries';
import type { Category, Habit } from '@/types';
import type { UpsertHabitsRequest } from '@/repositories/habits.repository';

export function useSettingsPageController() {
  const { data: habitsData, isLoading } = useGetHabitsQuery();
  const upsertHabitsMutation = useUpsertHabitsMutation();

  const categories = useMemo(() => habitsData?.categories ?? [], [habitsData]);
  const elements = useMemo(() => {
    const elementsMap: Record<number, Habit[]> = {};
    for (const cat of categories) {
      elementsMap[cat.id] = cat.elements;
    }
    return elementsMap;
  }, [categories]);

  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [elementModalVisible, setElementModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingElement, setEditingElement] = useState<Habit | null>(null);
  const [selectedCategoryForElement, setSelectedCategoryForElement] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState('');
  const [elementName, setElementName] = useState('');
  const [elementIconName, setElementIconName] = useState<string | null>(null);

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      showError('El nombre de la categoría no puede estar vacío');
      return;
    }

    try {
      const request: UpsertHabitsRequest = {
        categories: [
          ...categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            elements: (elements[cat.id] || []).map((elem) => ({
              id: elem.id,
              name: elem.name,
              iconName: elem.icon_name,
            })),
          })),
          {
            name: categoryName.trim(),
            elements: [],
          },
        ],
      };
      await upsertHabitsMutation.mutateAsync(request);
      setCategoryName('');
      setCategoryModalVisible(false);
    } catch (error) {
      showError('No se pudo crear la categoría');
      console.error(error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      showError('El nombre de la categoría no puede estar vacío');
      return;
    }

    try {
      const request: UpsertHabitsRequest = {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.id === editingCategory.id ? categoryName.trim() : cat.name,
          elements: (elements[cat.id] || []).map((elem) => ({
            id: elem.id,
            name: elem.name,
            iconName: elem.icon_name,
          })),
        })),
      };
      await upsertHabitsMutation.mutateAsync(request);
      setCategoryName('');
      setEditingCategory(null);
      setCategoryModalVisible(false);
    } catch (error) {
      showError('No se pudo actualizar la categoría');
      console.error(error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const confirmDelete =
      Platform.OS === 'web'
        ? window.confirm(
            '¿Estás seguro de que quieres eliminar esta categoría? Se eliminarán también todas sus tareas.'
          )
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Confirmar eliminación',
              '¿Estás seguro de que quieres eliminar esta categoría? Se eliminarán también todas sus tareas.',
              [
                { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
              ]
            );
          });

    if (confirmDelete) {
      try {
        const request: UpsertHabitsRequest = {
          categories: categories
            .filter((c) => c.id !== categoryId)
            .map((cat) => ({
              id: cat.id,
              name: cat.name,
              elements: (elements[cat.id] || []).map((elem) => ({
                id: elem.id,
                name: elem.name,
                iconName: elem.icon_name,
              })),
            })),
        };
        await upsertHabitsMutation.mutateAsync(request);
      } catch (error) {
        showError('No se pudo eliminar la categoría');
        console.error(error);
      }
    }
  };

  const handleCreateElement = async () => {
    if (!selectedCategoryForElement || !elementName.trim()) {
      showError('El nombre de la tarea no puede estar vacío');
      return;
    }

    try {
      const request: UpsertHabitsRequest = {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          elements:
            cat.id === selectedCategoryForElement
              ? [
                  ...(elements[cat.id] || []).map((elem) => ({
                    id: elem.id,
                    name: elem.name,
                    iconName: elem.icon_name,
                  })),
                  {
                    name: elementName.trim(),
                    iconName: elementIconName,
                  },
                ]
              : (elements[cat.id] || []).map((elem) => ({
                  id: elem.id,
                  name: elem.name,
                  iconName: elem.icon_name,
                })),
        })),
      };
      await upsertHabitsMutation.mutateAsync(request);
      setElementName('');
      setElementIconName(null);
      setSelectedCategoryForElement(null);
      setElementModalVisible(false);
    } catch (error) {
      showError('No se pudo crear la tarea');
      console.error(error);
    }
  };

  const handleUpdateElement = async () => {
    if (!editingElement || !elementName.trim()) {
      showError('El nombre de la tarea no puede estar vacío');
      return;
    }

    try {
      const request: UpsertHabitsRequest = {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          elements: (elements[cat.id] || []).map((elem) =>
            elem.id === editingElement.id
              ? {
                  id: elem.id,
                  name: elementName.trim(),
                  iconName: elementIconName,
                }
              : {
                  id: elem.id,
                  name: elem.name,
                  iconName: elem.icon_name,
                }
          ),
        })),
      };
      await upsertHabitsMutation.mutateAsync(request);
      setElementName('');
      setElementIconName(null);
      setEditingElement(null);
      setElementModalVisible(false);
    } catch (error) {
      showError('No se pudo actualizar la tarea');
      console.error(error);
    }
  };

  const handleDeleteElement = async (elementId: number, categoryId: number) => {
    const confirmDelete =
      Platform.OS === 'web'
        ? window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')
        : await new Promise<boolean>((resolve) => {
            Alert.alert('Confirmar eliminación', '¿Estás seguro de que quieres eliminar esta tarea?', [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
            ]);
          });

    if (confirmDelete) {
      try {
        const request: UpsertHabitsRequest = {
          categories: categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            elements:
              cat.id === categoryId
                ? (elements[cat.id] || [])
                    .filter((e) => e.id !== elementId)
                    .map((elem) => ({
                      id: elem.id,
                      name: elem.name,
                      iconName: elem.icon_name,
                    }))
                : (elements[cat.id] || []).map((elem) => ({
                    id: elem.id,
                    name: elem.name,
                    iconName: elem.icon_name,
                  })),
          })),
        };
        await upsertHabitsMutation.mutateAsync(request);
      } catch (error) {
        showError('No se pudo eliminar la tarea');
        console.error(error);
      }
    }
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setCategoryModalVisible(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalVisible(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const openElementModal = (categoryId: number, element?: Habit) => {
    if (element) {
      setEditingElement(element);
      setElementName(element.name);
      setElementIconName(element.icon_name);
      setSelectedCategoryForElement(categoryId);
    } else {
      setEditingElement(null);
      setElementName('');
      setElementIconName(null);
      setSelectedCategoryForElement(categoryId);
    }
    setElementModalVisible(true);
  };

  const closeElementModal = () => {
    setElementModalVisible(false);
    setEditingElement(null);
    setElementName('');
    setElementIconName(null);
    setSelectedCategoryForElement(null);
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return {
    loading: isLoading,
    categories,
    elements,
    expandedCategory,
    categoryModalVisible,
    elementModalVisible,
    editingCategory,
    editingElement,
    categoryName,
    elementName,
    elementIconName,
    setCategoryName,
    setElementName,
    setElementIconName,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleCreateElement,
    handleUpdateElement,
    handleDeleteElement,
    openCategoryModal,
    closeCategoryModal,
    openElementModal,
    closeElementModal,
    toggleCategory,
  };
}
