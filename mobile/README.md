# Móvil — Expo (React Native)

Todavía no está generada. Se crea en el Sprint 0.

## 1. Generar el proyecto

Desde la raíz del repositorio:

```bash
npx create-expo-app@latest mobile --template default
```

## 2. Dependencias adicionales

```bash
cd mobile && npx expo install @tanstack/react-query @supabase/supabase-js react-native-url-polyfill
```

## 3. Estructura que se debe crear dentro de `mobile/src`

```
app/                    rutas (Expo Router)
modulos/
└── <modulo>/
    ├── pantallas/
    ├── componentes/
    ├── hooks/
    ├── api/
    └── tipos.ts
compartido/
```

Es la **misma organización** que la web, para que el mismo módulo se entienda en ambas plataformas.
Ver `ARQUITECTURA_CLEAN.md`, sección 7.

## 4. Variables de entorno

Crear `mobile/.env` (nunca se sube):

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 5. Ejecutar

```bash
cd mobile && npx expo start
```
