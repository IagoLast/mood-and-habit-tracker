import { Alert, Platform } from 'react-native';
import { useAuth } from '@/contexts/auth.context';

export function useProfilePageController() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = Platform.OS === 'web'
      ? window.confirm('¿Estás seguro de que quieres cerrar sesión?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Cerrar sesión', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (confirmLogout) {
      try {
        await logout();
      } catch (error) {
        console.error('Error logging out:', error);
        if (Platform.OS === 'web') {
          window.alert('No se pudo cerrar sesión');
        } else {
          Alert.alert('Error', 'No se pudo cerrar sesión');
        }
      }
    }
  };

  return {
    user,
    handleLogout,
  };
}
