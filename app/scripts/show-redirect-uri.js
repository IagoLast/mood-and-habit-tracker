import { makeRedirectUri } from 'expo-auth-session';

const redirectUri = makeRedirectUri({
  scheme: 'books',
  useProxy: false,
});

console.log('\n🔗 Redirect URI que debes agregar en Google Console:');
console.log(redirectUri);
console.log('\n📝 Instrucciones:');
console.log('1. Ve a https://console.cloud.google.com/apis/credentials');
console.log('2. Selecciona tu proyecto');
console.log('3. Abre tu OAuth 2.0 Client ID (el que tiene el Client ID configurado)');
console.log('4. En la sección "Authorized redirect URIs", haz clic en "+ ADD URI"');
console.log(`5. Agrega exactamente este URI: ${redirectUri}`);
console.log('6. Haz clic en "SAVE"');
console.log('\n⚠️  IMPORTANTE: El URI debe coincidir EXACTAMENTE (incluyendo mayúsculas/minúsculas)');
console.log('\n💡 Alternativa: Si prefieres ver el URI cuando ejecutas la app,');
console.log('   intenta hacer login y revisa la consola - verás el mismo URI ahí.\n');
