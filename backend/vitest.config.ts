import { configDefaults, defineConfig } from 'vitest/config';

/**
 * Pruebas UNITARIAS (npm test): rapidas, sin base de datos; las corre la CI.
 * Las pruebas de integracion (*.integracion.test.ts) usan la base real y se corren aparte:
 * npm run test:integracion
 */
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '**/*.integracion.test.ts'],
  },
});
