/**
 * ENTRENAMIENTO del modelo de demanda:  npm run ml:entrenar
 *
 * 1. genera (o, en el futuro, lee) la historia de pasajes por ruta y por dia;
 * 2. separa por tiempo: el 80 % mas antiguo entrena y el 20 % mas reciente evalua
 *    (asi se mide como predice dias que el modelo NUNCA vio);
 * 3. ajusta la regresion lineal multiple sobre el indice de demanda (pasajes / base de la ruta);
 * 4. mide MAE, RMSE y R² en pasajes sobre los dias de prueba;
 * 5. guarda los coeficientes y las metricas en adaptadores/modelo-demanda.json, que lee la API.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { caracteristicasDelDia, NOMBRES_CARACTERISTICAS } from '../dominio/Caracteristicas';
import type { ModeloDemanda } from '../dominio/ModeloDemanda';
import { generarDatosSinteticos, INICIO_SERIE, RUTAS_SINTETICAS } from './datosSinteticos';
import { ajustar, metricas, predecir } from './regresion';

const redondear = (n: number, decimales = 4) => Math.round(n * 10 ** decimales) / 10 ** decimales;

export function entrenar(): ModeloDemanda {
  const datos = generarDatosSinteticos();
  const fechas = [...new Set(datos.map((d) => d.fecha))].sort();
  const corte = fechas[Math.floor(fechas.length * 0.8)]!;
  const entrenamiento = datos.filter((d) => d.fecha < corte);
  const prueba = datos.filter((d) => d.fecha >= corte);

  const X = entrenamiento.map((d) => caracteristicasDelDia(d.fecha, INICIO_SERIE));
  const y = entrenamiento.map((d) => d.pasajes / d.base);
  const coeficientes = ajustar(X, y);

  const estimados = prueba.map((d) => d.base * predecir(coeficientes, caracteristicasDelDia(d.fecha, INICIO_SERIE)));
  const resultado = metricas(
    prueba.map((d) => d.pasajes),
    estimados,
  );

  return {
    tipo: 'regresion lineal multiple (minimos cuadrados)',
    version: '1.0',
    entrenado_en: new Date().toISOString().slice(0, 10),
    datos: `sinteticos: ${Object.keys(RUTAS_SINTETICAS).length} rutas, ${fechas[0]} a ${fechas.at(-1)}`,
    inicio_serie: INICIO_SERIE,
    caracteristicas: [...NOMBRES_CARACTERISTICAS],
    coeficientes: coeficientes.map((c) => redondear(c, 6)),
    metricas: {
      mae: redondear(resultado.mae, 2),
      rmse: redondear(resultado.rmse, 2),
      r2: redondear(resultado.r2, 3),
      n_entrenamiento: entrenamiento.length,
      n_prueba: prueba.length,
    },
    base_por_ruta: { ...RUTAS_SINTETICAS },
    base_por_defecto: Math.round(
      Object.values(RUTAS_SINTETICAS).reduce((a, b) => a + b, 0) / Object.keys(RUTAS_SINTETICAS).length,
    ),
  };
}

// solo cuando se ejecuta como programa (no al importarlo en una prueba)
if (require.main === module) {
  const modelo = entrenar();
  const destino = join(__dirname, '..', 'adaptadores', 'modelo-demanda.json');
  writeFileSync(destino, JSON.stringify(modelo, null, 2) + '\n');
  console.log('Modelo guardado en', destino);
  console.table(Object.fromEntries(modelo.caracteristicas.map((c, i) => [c, modelo.coeficientes[i]])));
  console.log('Métricas en los días de prueba (pasajes por día):', modelo.metricas);
}
