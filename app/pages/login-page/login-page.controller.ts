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
      await login(googleLogin);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error de autenticación',
        error instanceof Error ? error.message : 'No se pudo iniciar sesión. Por favor, intenta de nuevo.'
      );
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
