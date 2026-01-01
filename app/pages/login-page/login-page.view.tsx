import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLoginPageController } from './login-page.controller';
import { styles } from './login-page.styles';

export function LoginPageView() {
  const { loading, isAuthRequestLoading, isButtonDisabled, handleGoogleLogin } = useLoginPageController();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" style={styles.icon} />
        <Text style={styles.title}>Good Choices</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <TouchableOpacity
          style={[styles.googleButton, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isButtonDisabled}>
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
