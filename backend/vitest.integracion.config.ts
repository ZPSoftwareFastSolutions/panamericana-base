import { defineConfig } from 'vitest/config';

/** Pruebas de INTEGRACION contra la base real (necesitan backend/.env con DATABASE_URL) */
export default defineConfig({
  test: {
    include: ['src/**/*.integracion.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
