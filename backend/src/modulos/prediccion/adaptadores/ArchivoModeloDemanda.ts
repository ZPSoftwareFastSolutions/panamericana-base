import { z } from 'zod';
import type { ModeloDemanda } from '../dominio/ModeloDemanda';
import type { FuenteDelModelo } from '../dominio/PrediccionRepositorio';
import { ModeloInvalidoError } from '../dominio/errores';
import modeloEntrenado from './modelo-demanda.json';

const esquemaModelo = z.object({
  tipo: z.string(),
  version: z.string(),
  entrenado_en: z.string(),
  datos: z.string(),
  inicio_serie: z.iso.date(),
  caracteristicas: z.array(z.string()),
  coeficientes: z.array(z.number()),
  metricas: z.object({
    mae: z.number(),
    rmse: z.number(),
    r2: z.number(),
    n_entrenamiento: z.number(),
    n_prueba: z.number(),
  }),
  base_por_ruta: z.record(z.string(), z.number()),
  base_por_defecto: z.number(),
});

/**
 * El modelo entrenado vive en modelo-demanda.json (lo escribe npm run ml:entrenar).
 * Se valida su forma una sola vez; si el archivo esta mal, la prediccion responde un error claro.
 */
export class ArchivoModeloDemanda implements FuenteDelModelo {
  private modelo: ModeloDemanda | null = null;

  async cargar(): Promise<ModeloDemanda> {
    if (!this.modelo) {
      const resultado = esquemaModelo.safeParse(modeloEntrenado);
      if (!resultado.success) throw new ModeloInvalidoError('el archivo modelo-demanda.json no tiene la forma esperada');
      this.modelo = resultado.data;
    }
    return this.modelo;
  }
}
