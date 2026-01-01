# Configurar Redirect URI en Google Console

## Error: redirect_uri_mismatch

Si ves el error **"Error 400: redirect_uri_mismatch"** al intentar hacer login con Google, significa que el redirect URI que está usando tu app no está configurado en Google Cloud Console.

## Cómo encontrar tu Redirect URI exacto

### Método 1: Ver el log en la consola (RECOMENDADO)

1. Inicia la app con `npm start` en la carpeta `app`
2. Intenta iniciar sesión con Google
3. **Revisa la consola** - verás un mensaje destacado con el redirect URI exacto:
   ```
   ═══════════════════════════════════════════════════════════
   🔗 REDIRECT URI PARA GOOGLE CONSOLE:
   ═══════════════════════════════════════════════════════════
   https://auth.expo.io/@TU_USERNAME/books
   ═══════════════════════════════════════════════════════════
   ```
4. **Copia ese URI EXACTAMENTE** (incluyendo mayúsculas/minúsculas)

### Método 2: Formato esperado

El redirect URI usa el scheme personalizado definido en `app.json`:

```
books://
```

Este URI es estable y no cambia con tu IP local o configuración de Expo.

## Configurar en Google Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Selecciona tu proyecto** (el que tiene el OAuth Client ID configurado)
3. Ve a **APIs & Services** > **Credentials**
4. Abre tu **OAuth 2.0 Client ID** (el que tiene el Client ID: `667723889099-26osjtgr67sdcnpb8objumef7b9icbqv.apps.googleusercontent.com`)
5. En la sección **Authorized redirect URIs**, haz clic en **+ ADD URI**
6. **Pega el redirect URI exacto** que copiaste de la consola
7. Haz clic en **SAVE**

⚠️ **IMPORTANTE**: 
- El URI debe coincidir **EXACTAMENTE** (incluyendo mayúsculas/minúsculas)
- No agregues espacios al principio o final
- Asegúrate de que el protocolo sea `https://` (no `http://`)

## Verificar que funcionó

Después de agregar el redirect URI en Google Console:

1. Espera unos segundos para que los cambios se propaguen
2. Intenta hacer login nuevamente
3. El error `redirect_uri_mismatch` debería desaparecer

## Nota sobre el redirect URI

El proyecto usa el scheme personalizado `books://` definido en `app.json`. Este URI es estable y funciona tanto en desarrollo local como en producción, sin depender de la IP local o del proxy de Expo.
