import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, useColorScheme } from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  Feather,
  AntDesign,
  Entypo,
  EvilIcons,
  Fontisto,
  Foundation,
  Octicons,
  SimpleLineIcons,
} from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type IconLibrary = 
  | 'Ionicons'
  | 'MaterialIcons'
  | 'MaterialCommunityIcons'
  | 'FontAwesome'
  | 'Feather'
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Fontisto'
  | 'Foundation'
  | 'Octicons'
  | 'SimpleLineIcons';

const ICON_LIBRARIES: Record<IconLibrary, { component: any; glyphMap: any }> = {
  Ionicons: { component: Ionicons, glyphMap: Ionicons.glyphMap },
  MaterialIcons: { component: MaterialIcons, glyphMap: MaterialIcons.glyphMap },
  MaterialCommunityIcons: { component: MaterialCommunityIcons, glyphMap: MaterialCommunityIcons.glyphMap },
  FontAwesome: { component: FontAwesome, glyphMap: FontAwesome.glyphMap },
  Feather: { component: Feather, glyphMap: Feather.glyphMap },
  AntDesign: { component: AntDesign, glyphMap: AntDesign.glyphMap },
  Entypo: { component: Entypo, glyphMap: Entypo.glyphMap },
  EvilIcons: { component: EvilIcons, glyphMap: EvilIcons.glyphMap },
  Fontisto: { component: Fontisto, glyphMap: Fontisto.glyphMap },
  Foundation: { component: Foundation, glyphMap: Foundation.glyphMap },
  Octicons: { component: Octicons, glyphMap: Octicons.glyphMap },
  SimpleLineIcons: { component: SimpleLineIcons, glyphMap: SimpleLineIcons.glyphMap },
};

const LIBRARY_SHORT_NAMES: Record<IconLibrary, string> = {
  Ionicons: 'Ion',
  MaterialIcons: 'MI',
  MaterialCommunityIcons: 'MCI',
  FontAwesome: 'FA',
  Feather: 'Fea',
  AntDesign: 'Ant',
  Entypo: 'Ent',
  EvilIcons: 'Evil',
  Fontisto: 'Fon',
  Foundation: 'Fou',
  Octicons: 'Oct',
  SimpleLineIcons: 'SL',
};

// Format: "library:iconName" or just "iconName" (defaults to Ionicons for backwards compatibility)
function parseIconString(iconString: string | null): { library: IconLibrary; name: string } | null {
  if (!iconString) return null;
  
  const colonIndex = iconString.indexOf(':');
  if (colonIndex === -1) {
    // Backwards compatibility: assume Ionicons
    return { library: 'Ionicons', name: iconString };
  }
  
  const library = iconString.slice(0, colonIndex) as IconLibrary;
  const name = iconString.slice(colonIndex + 1);
  
  if (ICON_LIBRARIES[library]) {
    return { library, name };
  }
  
  // Invalid library, assume Ionicons
  return { library: 'Ionicons', name: iconString };
}

function serializeIcon(library: IconLibrary, name: string): string {
  // For Ionicons, keep backwards compatibility (no prefix)
  if (library === 'Ionicons') {
    return name;
  }
  return `${library}:${name}`;
}

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (iconName: string | null) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');

  const parsedIcon = parseIconString(selectedIcon);
  const [selectedLibrary, setSelectedLibrary] = useState<IconLibrary>(parsedIcon?.library ?? 'Ionicons');

  const allIcons = useMemo(() => {
    return Object.keys(ICON_LIBRARIES[selectedLibrary].glyphMap);
  }, [selectedLibrary]);

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return allIcons;
    
    try {
      const regex = new RegExp(searchQuery.trim(), 'i');
      return allIcons.filter(icon => regex.test(icon));
    } catch {
      const query = searchQuery.toLowerCase();
      return allIcons.filter(icon => icon.toLowerCase().includes(query));
    }
  }, [searchQuery, allIcons]);

  const IconComponent = ICON_LIBRARIES[selectedLibrary].component;

  const isSelected = (iconName: string) => {
    return parsedIcon?.library === selectedLibrary && parsedIcon?.name === iconName;
  };

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(serializeIcon(selectedLibrary, iconName));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Icono</Text>
      
      {/* Library selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.libraryScroll}
        contentContainerStyle={styles.libraryScrollContent}
      >
        {(Object.keys(ICON_LIBRARIES) as IconLibrary[]).map((lib) => (
          <TouchableOpacity
            key={lib}
            style={[
              styles.libraryButton,
              { borderColor: colors.icon + '33', backgroundColor: colors.background },
              selectedLibrary === lib && { borderColor: colors.tint, backgroundColor: colors.tint + '20' }
            ]}
            onPress={() => setSelectedLibrary(lib)}
          >
            <Text style={[
              styles.libraryButtonText,
              { color: selectedLibrary === lib ? colors.tint : colors.icon }
            ]}>
              {LIBRARY_SHORT_NAMES[lib]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search input */}
      <View style={[styles.searchContainer, { 
        borderColor: colors.icon + '33', 
        backgroundColor: colors.background 
      }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar icono (regex)..."
          placeholderTextColor={colors.icon + '99'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.icon + '99'} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.countText, { color: colors.icon + '99' }]}>
        {filteredIcons.length} de {allIcons.length} iconos en {selectedLibrary}
      </Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* No icon option */}
        <View style={[styles.noIconContainer, { borderBottomColor: colors.icon + '33' }]}>
          <TouchableOpacity
            style={[
              styles.noIconButton, 
              { borderColor: colors.icon + '33', backgroundColor: colors.background },
              !selectedIcon && [styles.noIconButtonSelected, { borderColor: colors.tint, backgroundColor: colors.tint + '20' }]
            ]}
            onPress={() => onSelectIcon(null)}>
            <Text style={[styles.noIconText, { color: colors.text }]}>Sin icono</Text>
          </TouchableOpacity>
        </View>

        {/* Icons grid */}
            <View style={styles.iconsGrid}>
          {filteredIcons.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconButton,
                    { borderColor: colors.icon + '33', backgroundColor: colors.background },
                isSelected(iconName) && [styles.iconButtonSelected, { borderColor: colors.tint, backgroundColor: colors.tint + '20' }],
                  ]}
              onPress={() => handleSelectIcon(iconName)}>
              <IconComponent
                    name={iconName as any}
                    size={24}
                color={isSelected(iconName) ? colors.tint : colors.icon}
                  />
                </TouchableOpacity>
              ))}
            </View>
      </ScrollView>
    </View>
  );
}

// Renders an icon from a serialized string (e.g., "Ionicons:heart" or just "heart")
export function renderIcon(iconString: string | null | undefined, size: number, color: string) {
  if (!iconString) return null;
  
  const parsed = parseIconString(iconString);
  if (!parsed) return null;
  
  const IconComponent = ICON_LIBRARIES[parsed.library]?.component;
  if (!IconComponent) return null;
  
  return <IconComponent name={parsed.name as any} size={size} color={color} />;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  libraryScroll: {
    marginBottom: 12,
  },
  libraryScrollContent: {
    gap: 8,
  },
  libraryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  libraryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  countText: {
    fontSize: 12,
    marginBottom: 12,
  },
  scrollView: {
    maxHeight: 400,
  },
  noIconContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  noIconButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  noIconButtonSelected: {
  },
  noIconText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonSelected: {
    borderWidth: 3,
  },
});
