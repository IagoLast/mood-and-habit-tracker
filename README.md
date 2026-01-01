# Habit Tracker

App de seguimiento de hábitos vitales construida con React Native (Expo) y Next.js.

## Características

- **Categorías personalizadas**: Los usuarios pueden crear sus propias categorías de hábitos
- **Elementos dentro de categorías**: Cada categoría puede tener múltiples elementos (hábitos) que se pueden marcar como completados
- **Seguimiento diario**: Marca elementos como realizados cada día
- **Puntuación diaria**: Puntúa tu día del 1 al 10
- **Estadísticas**: Visualiza tu progreso y estadísticas avanzadas

## Estructura del Proyecto

```
good-choices/
├── app/          # App React Native con Expo
├── back/         # Backend Next.js con API REST
└── docker-compose.yml  # Configuración de PostgreSQL
```

## Requisitos

- Node.js 18+
- Docker y Docker Compose
- Expo CLI (opcional, viene con npm install)

## Configuración

### 1. Base de Datos (PostgreSQL)

Inicia PostgreSQL con Docker:

```bash
docker-compose up -d
```

Esto creará una base de datos PostgreSQL con:
- Usuario: `habituser`
- Contraseña: `habitpass`
- Base de datos: `habittracker`
- Puerto: `5433`

### 2. Backend (Next.js)

```bash
cd back
npm install
cp .env.example .env  # Ajusta las variables si es necesario
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 3. App (Expo)

```bash
cd app
npm install
```

Crea un archivo `.env` con:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Para desarrollo local, si estás usando un dispositivo físico, necesitarás usar la IP de tu máquina en lugar de `localhost`.

Luego inicia la app:

```bash
npm start
```

## API Endpoints

### Categorías

- `GET /api/categories?userId={userId}` - Obtener todas las categorías
- `POST /api/categories` - Crear categoría
- `GET /api/categories/{id}` - Obtener categoría por ID
- `PUT /api/categories/{id}` - Actualizar categoría
- `DELETE /api/categories/{id}` - Eliminar categoría

### Elementos

- `GET /api/elements?categoryId={categoryId}` - Obtener elementos de una categoría
- `POST /api/elements` - Crear elemento
- `GET /api/elements/{id}` - Obtener elemento por ID
- `PUT /api/elements/{id}` - Actualizar elemento
- `DELETE /api/elements/{id}` - Eliminar elemento

### Completados

- `GET /api/completions?elementId={elementId}&date={date}` - Obtener completados
- `POST /api/completions` - Marcar como completado
- `DELETE /api/completions?elementId={elementId}&date={date}` - Desmarcar completado

### Puntuaciones

- `GET /api/scores?userId={userId}&startDate={startDate}&endDate={endDate}` - Obtener puntuaciones
- `POST /api/scores` - Crear/actualizar puntuación diaria
- `GET /api/scores/{date}?userId={userId}` - Obtener puntuación por fecha
- `DELETE /api/scores/{date}?userId={userId}` - Eliminar puntuación

## Estructura de la Base de Datos

- `categories`: Categorías de hábitos
- `elements`: Elementos (hábitos) dentro de categorías
- `daily_completions`: Registro de elementos completados por día
- `daily_scores`: Puntuaciones diarias (1-10)

## Desarrollo

### Backend

El backend usa Next.js 16 con App Router. Las APIs están en `back/src/app/api/`.

### Frontend

La app usa Expo Router para navegación basada en archivos. Las pantallas están en `app/app/`.

## Tests E2E

El proyecto incluye tests end-to-end con Playwright para validar los flujos básicos de la API.

### Configuración

```bash
cd e2e
npm install
```

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con UI interactiva
npm run test:ui

# Ejecutar en modo headed (con navegador visible)
npm run test:headed

# Ejecutar en modo debug
npm run test:debug

# Ver reporte de tests
npm run report
```

Los tests validan:
- CRUD de categorías
- CRUD de elementos
- Gestión de completados diarios
- Gestión de puntuaciones diarias
- Flujo completo de integración

### Nota sobre CORS

El middleware de Next.js está configurado para permitir CORS desde cualquier origen en desarrollo. En producción, deberías restringir esto a los dominios específicos de tu aplicación.

## Próximos Pasos

- [ ] Implementar autenticación de usuarios
- [ ] Agregar pantalla de estadísticas
- [ ] Mejorar UI/UX
- [ ] Agregar notificaciones
- [ ] Implementar sincronización offline
