import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { commonStyles } from '@/constants/common.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfilePageController } from './profile-page.controller';
import { styles } from './profile-page.styles';

export function ProfilePageView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, handleLogout } = useProfilePageController();

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.noUserText, { color: colors.text }]}>No hay usuario logueado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[commonStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon + '33' }]}>
        <View style={commonStyles.placeholder} />
        <Text style={[commonStyles.headerTitle, { color: colors.text }]}>Perfil</Text>
        <TouchableOpacity style={styles.logoutIconButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="person" size={48} color={colors.tint} />
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: colors.icon }]}>{user.email}</Text>
            <Text style={[styles.userId, { color: colors.icon + 'CC' }]}>ID: {user.id}</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]}
            onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
