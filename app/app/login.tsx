import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/contexts/auth.context';
import { useGoogleAuth } from '@/hooks/use-google-auth';

export default function LoginScreen() {
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" style={styles.icon} />
        <Text style={styles.title}>Good Choices</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <TouchableOpacity
          style={[styles.googleButton, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isButtonDisabled}
        >
          {loading || isAuthRequestLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#fff" />
              <Text style={styles.buttonText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
