import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconPicker, renderIcon } from '@/components/icon-picker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsPageController } from './settings-page.controller';
import { styles } from './settings-page.styles';

export function SettingsPageView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
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
  } = useSettingsPageController();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <Text style={[styles.title, { color: colors.text }]}>Ajustes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openCategoryModal()}>
          <Ionicons name="add" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>No hay categorías aún</Text>
            <Text style={[styles.emptySubtext, { color: colors.icon + 'CC' }]}>
              Crea tu primera categoría para comenzar
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={[styles.categoryCard, { backgroundColor: colors.background }]}>
              <View style={styles.categoryHeader}>
                <TouchableOpacity style={styles.categoryTitleRow} onPress={() => toggleCategory(category.id)}>
                  <Ionicons
                    name={expandedCategory === category.id ? 'chevron-down' : 'chevron-forward'}
                    size={20}
                    color={colors.icon}
                  />
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                </TouchableOpacity>
                <View style={styles.categoryActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => openCategoryModal(category)}>
                    <Ionicons name="create-outline" size={20} color={colors.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteCategory(category.id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>

              {expandedCategory === category.id && (
                <View style={[styles.elementsContainer, { borderTopColor: colors.icon + '33' }]}>
                  <TouchableOpacity style={styles.addElementButton} onPress={() => openElementModal(category.id)}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.tint} />
                    <Text style={[styles.addElementText, { color: colors.tint }]}>Agregar tarea</Text>
                  </TouchableOpacity>

                  {(elements[category.id] || []).length === 0 ? (
                    <Text style={[styles.noElementsText, { color: colors.icon + 'CC' }]}>
                      No hay tareas en esta categoría
                    </Text>
                  ) : (
                    (elements[category.id] || []).map((element) => (
                      <View key={element.id} style={[styles.elementRow, { borderBottomColor: colors.icon + '33' }]}>
                        <View style={styles.elementInfo}>
                          {element.icon_name && (
                            <View style={styles.elementIcon}>{renderIcon(element.icon_name, 20, colors.tint)}</View>
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

      <Modal visible={categoryModalVisible} animationType="slide" transparent={true} onRequestClose={closeCategoryModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>
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
              onChangeText={setCategoryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
                onPress={closeCategoryModal}>
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

      <Modal visible={elementModalVisible} animationType="slide" transparent={true} onRequestClose={closeElementModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingElement ? 'Editar Tarea' : 'Nueva Tarea'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.icon + '33',
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="Nombre de la tarea"
                placeholderTextColor={colors.icon + '99'}
                value={elementName}
                onChangeText={setElementName}
                autoFocus
              />
              <IconPicker selectedIcon={elementIconName} onSelectIcon={setElementIconName} />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
                onPress={closeElementModal}>
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
