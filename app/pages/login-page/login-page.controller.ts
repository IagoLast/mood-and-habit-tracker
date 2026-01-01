import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/contexts/auth.context';
import { useGoogleAuth } from '@/hooks/use-google-auth';

export function useLoginPageController() {
  const router = useRouter();
  const { login } = useAuth();
  const { login: googleLogin, isLoading: isAuthRequestLoading } = useGoogleAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log('[Login Controller] Iniciando login con Google...');
      await login(googleLogin);
      console.log('[Login Controller] Login exitoso, redirigiendo...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[Login Controller] Error completo:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'No se pudo iniciar sesión. Por favor, intenta de nuevo.';
      
      console.error('[Login Controller] Mensaje de error:', errorMessage);
      Alert.alert('Error de autenticación', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || isAuthRequestLoading;

  return {
    loading,
    isAuthRequestLoading,
    isButtonDisabled,
    handleGoogleLogin,
  };
}
