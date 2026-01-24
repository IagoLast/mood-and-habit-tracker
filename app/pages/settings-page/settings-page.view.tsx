import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsPageController } from './settings-page.controller';
import { SettingsCategoryView } from './components/settings-category/settings-category.view';
import { CreateEditCategoryDialogView as CreateEditCategoryDialog } from './components/create-edit-category-dialog/create-edit-category-dialog.view';
import { CreateEditHabitDialogView as CreateEditHabitDialog } from './components/create-edit-habit-dialog/create-edit-habit-dialog.view';
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

  // Gradient colors based on theme
  const gradientColors =
    colorScheme === 'dark'
      ? ([colors.background, '#1F1C19', colors.background] as const)
      : ([colors.background, '#F5F1E8', colors.background] as const);

  if (loading) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: Fonts?.default }]}>Ajustes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openCategoryModal()}>
          <Ionicons name="add-circle-outline" size={26} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={colors.icon + '80'} />
            <Text style={[styles.emptyText, { color: colors.text, fontFamily: Fonts?.default }]}>
              No hay categorías aún
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.icon }]}>
              Crea tu primera categoría para comenzar
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <SettingsCategoryView
              key={category.id}
              category={category}
              elements={elements[category.id] || []}
              isExpanded={expandedCategory === category.id}
              onToggle={() => toggleCategory(category.id)}
              onEditCategory={() => openCategoryModal(category)}
              onDeleteCategory={() => handleDeleteCategory(category.id)}
              onAddElement={() => openElementModal(category.id)}
              onEditElement={(element) => openElementModal(category.id, element)}
              onDeleteElement={(elementId) => handleDeleteElement(elementId, category.id)}
            />
          ))
        )}
      </ScrollView>

      <CreateEditCategoryDialog
        visible={categoryModalVisible}
        editingCategory={editingCategory}
        categoryName={categoryName}
        onCategoryNameChange={setCategoryName}
        onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
        onCancel={closeCategoryModal}
      />

      <CreateEditHabitDialog
        visible={elementModalVisible}
        editingHabit={editingElement}
        habitName={elementName}
        habitIconName={elementIconName}
        onHabitNameChange={setElementName}
        onHabitIconNameChange={setElementIconName}
        onSave={editingElement ? handleUpdateElement : handleCreateElement}
        onCancel={closeElementModal}
      />
    </LinearGradient>
  );
}
