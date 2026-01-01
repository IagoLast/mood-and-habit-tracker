import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoriesRepository } from '@/repositories/categories.repository';
import { elementsRepository } from '@/repositories/elements.repository';
import { IconPicker, renderIcon } from '@/components/icon-picker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth.context';
import type { Category, Element } from '@/types';

export default function SettingsScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
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
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Se eliminarán también todas sus tareas.')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que quieres eliminar esta categoría? Se eliminarán también todas sus tareas.',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => resolve(true),
              },
            ]
          );
        });

    if (confirmDelete) {
      try {
        await categoriesRepository.delete({ id: categoryId });
        setCategories(categories.filter(c => c.id !== categoryId));
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
        [editingElement.category_id]: (elements[editingElement.category_id] || []).map(
          e => e.id === updated.id ? updated : e
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
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que quieres eliminar esta tarea?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => resolve(true),
              },
            ]
          );
        });

    if (confirmDelete) {
      try {
        await elementsRepository.delete({ id: elementId });
        setElements({
          ...elements,
          [categoryId]: (elements[categoryId] || []).filter(e => e.id !== elementId),
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

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <Text style={[styles.title, { color: colors.text }]}>Ajustes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openCategoryModal()}>
          <Ionicons name="add" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>No hay categorías aún</Text>
            <Text style={[styles.emptySubtext, { color: colors.icon + 'CC' }]}>Crea tu primera categoría para comenzar</Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={[styles.categoryCard, { backgroundColor: colors.background }]}>
              <View style={styles.categoryHeader}>
                <TouchableOpacity
                  style={styles.categoryTitleRow}
                  onPress={() => toggleCategory(category.id)}>
                  <Ionicons
                    name={expandedCategory === category.id ? 'chevron-down' : 'chevron-forward'}
                    size={20}
                    color={colors.icon}
                  />
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                </TouchableOpacity>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => openCategoryModal(category)}>
                    <Ionicons name="create-outline" size={20} color={colors.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDeleteCategory(category.id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>

              {expandedCategory === category.id && (
                <View style={[styles.elementsContainer, { borderTopColor: colors.icon + '33' }]}>
                  <TouchableOpacity
                    style={styles.addElementButton}
                    onPress={() => openElementModal(category.id)}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.tint} />
                    <Text style={[styles.addElementText, { color: colors.tint }]}>Agregar tarea</Text>
                  </TouchableOpacity>

                  {(elements[category.id] || []).length === 0 ? (
                    <Text style={[styles.noElementsText, { color: colors.icon + 'CC' }]}>No hay tareas en esta categoría</Text>
                  ) : (
                    (elements[category.id] || []).map((element) => (
                      <View key={element.id} style={[styles.elementRow, { borderBottomColor: colors.icon + '33' }]}>
                        <View style={styles.elementInfo}>
                          {element.icon_name && (
                            <View style={styles.elementIcon}>
                              {renderIcon(element.icon_name, 20, colors.tint)}
                            </View>
                          )}
                          <Text style={[styles.elementName, { color: colors.text }]}>{element.name}</Text>
                        </View>
                        <View style={styles.elementActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => openElementModal(category.id, element)}>
                            <Ionicons name="create-outline" size={18} color={colors.tint} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeleteElement(element.id, category.id)}>
                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setCategoryModalVisible(false);
          setEditingCategory(null);
          setCategoryName('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.icon + '33', 
                color: colors.text,
                backgroundColor: colors.background 
              }]}
              placeholder="Nombre de la categoría"
              placeholderTextColor={colors.icon + '99'}
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => {
                  setCategoryModalVisible(false);
                  setEditingCategory(null);
                  setCategoryName('');
                }}>
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                <Text style={[styles.saveButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
                  {editingCategory ? 'Guardar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={elementModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setElementModalVisible(false);
          setEditingElement(null);
          setElementName('');
          setElementIconName(null);
          setSelectedCategoryForElement(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingElement ? 'Editar Tarea' : 'Nueva Tarea'}
              </Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.icon + '33', 
                  color: colors.text,
                  backgroundColor: colors.background 
                }]}
                placeholder="Nombre de la tarea"
                placeholderTextColor={colors.icon + '99'}
                value={elementName}
                onChangeText={setElementName}
                autoFocus
              />
              <IconPicker
                selectedIcon={elementIconName}
                onSelectIcon={setElementIconName}
              />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => {
                  setElementModalVisible(false);
                  setEditingElement(null);
                  setElementName('');
                  setElementIconName(null);
                  setSelectedCategoryForElement(null);
                }}>
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={editingElement ? handleUpdateElement : handleCreateElement}>
                <Text style={[styles.saveButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
                  {editingElement ? 'Guardar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  categoryCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  elementsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  addElementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  addElementText: {
    fontSize: 16,
    marginLeft: 8,
  },
  noElementsText: {
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  elementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  elementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  elementIcon: {
    marginRight: 12,
  },
  elementName: {
    fontSize: 16,
    flex: 1,
  },
  elementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  saveButton: {
  },
  saveButtonText: {
    fontWeight: '600',
  },
});
