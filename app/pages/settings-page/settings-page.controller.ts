import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { categoriesRepository } from '@/repositories/categories.repository';
import { elementsRepository } from '@/repositories/elements.repository';
import { useAuth } from '@/contexts/auth.context';
import type { Category, Element } from '@/types';

export function useSettingsPageController() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [elements, setElements] = useState<Record<number, Element[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [elementModalVisible, setElementModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [selectedCategoryForElement, setSelectedCategoryForElement] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState('');
  const [elementName, setElementName] = useState('');
  const [elementIconName, setElementIconName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const cats = await categoriesRepository.list();
      setCategories(cats);

      const elementsMap: Record<number, Element[]> = {};
      for (const cat of cats) {
        const elems = await elementsRepository.list({ categoryId: cat.id });
        elementsMap[cat.id] = elems;
      }
      setElements(elementsMap);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('No se pudieron cargar los datos');
      } else {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('El nombre de la categoría no puede estar vacío');
      } else {
        Alert.alert('Error', 'El nombre de la categoría no puede estar vacío');
      }
      return;
    }

    try {
      const category = await categoriesRepository.create({
        name: categoryName.trim(),
      });
      setCategories([...categories, category]);
      setElements({ ...elements, [category.id]: [] });
      setCategoryName('');
      setCategoryModalVisible(false);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('No se pudo crear la categoría');
      } else {
        Alert.alert('Error', 'No se pudo crear la categoría');
      }
      console.error(error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('El nombre de la categoría no puede estar vacío');
      } else {
        Alert.alert('Error', 'El nombre de la categoría no puede estar vacío');
      }
      return;
    }

    try {
      const updated = await categoriesRepository.update({
        id: editingCategory.id,
        name: categoryName.trim(),
      });
      setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
      setCategoryName('');
      setEditingCategory(null);
      setCategoryModalVisible(false);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('No se pudo actualizar la categoría');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la categoría');
      }
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
        await categoriesRepository.delete({ id: categoryId });
        setCategories(categories.filter((c) => c.id !== categoryId));
        const newElements = { ...elements };
        delete newElements[categoryId];
        setElements(newElements);
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('No se pudo eliminar la categoría');
        } else {
          Alert.alert('Error', 'No se pudo eliminar la categoría');
        }
        console.error(error);
      }
    }
  };

  const handleCreateElement = async () => {
    if (!selectedCategoryForElement || !elementName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('El nombre de la tarea no puede estar vacío');
      } else {
        Alert.alert('Error', 'El nombre de la tarea no puede estar vacío');
      }
      return;
    }

    try {
      const element = await elementsRepository.create({
        name: elementName.trim(),
        categoryId: selectedCategoryForElement,
        iconName: elementIconName,
      });
      setElements({
        ...elements,
        [selectedCategoryForElement]: [...(elements[selectedCategoryForElement] || []), element],
      });
      setElementName('');
      setElementIconName(null);
      setSelectedCategoryForElement(null);
      setElementModalVisible(false);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('No se pudo crear la tarea');
      } else {
        Alert.alert('Error', 'No se pudo crear la tarea');
      }
      console.error(error);
    }
  };

  const handleUpdateElement = async () => {
    if (!editingElement || !elementName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('El nombre de la tarea no puede estar vacío');
      } else {
        Alert.alert('Error', 'El nombre de la tarea no puede estar vacío');
      }
      return;
    }

    try {
      const updated = await elementsRepository.update({
        id: editingElement.id,
        name: elementName.trim(),
        iconName: elementIconName,
      });
      setElements({
        ...elements,
        [editingElement.category_id]: (elements[editingElement.category_id] || []).map((e) =>
          e.id === updated.id ? updated : e
        ),
      });
      setElementName('');
      setElementIconName(null);
      setEditingElement(null);
      setElementModalVisible(false);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('No se pudo actualizar la tarea');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la tarea');
      }
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
        await elementsRepository.delete({ id: elementId });
        setElements({
          ...elements,
          [categoryId]: (elements[categoryId] || []).filter((e) => e.id !== elementId),
        });
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('No se pudo eliminar la tarea');
        } else {
          Alert.alert('Error', 'No se pudo eliminar la tarea');
        }
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

  const openElementModal = (categoryId: number, element?: Element) => {
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
    loading,
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
