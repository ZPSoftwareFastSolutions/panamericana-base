import { describe, expect, it } from 'vitest';
import { caracteristicasDelDia, NOMBRES_CARACTERISTICAS } from '../dominio/Caracteristicas';
import { domingoDePascua, esFeriado, esVisperaDeFeriado } from '../dominio/FeriadosBolivia';
import { baseDeRuta, evaluarCapacidad, exigirModeloCompatible, pasajesEstimados } from '../dominio/ModeloDemanda';
import type { ModeloDemanda } from '../dominio/ModeloDemanda';
import type { CapacidadDelDia, PrediccionRepositorio } from '../dominio/PrediccionRepositorio';
import { ModeloInvalidoError, PeriodoInvalidoError } from '../dominio/errores';
import { ajustar, metricas, resolverSistema } from '../entrenamiento/regresion';
import { entrenar } from '../entrenamiento/entrenar';
import { PredecirDemanda } from './PredecirDemanda';

// modelo de juguete: indice 1 todos los dias, +0,5 el viernes y +1 si es feriado
const MODELO: ModeloDemanda = {
  tipo: 'prueba',
  version: '0',
  entrenado_en: '2026-09-24',
  datos: 'prueba',
  inicio_serie: '2026-01-01',
  caracteristicas: [...NOMBRES_CARACTERISTICAS],
  coeficientes: [1, 0, 0, 0, 0, 0.5, 0, 1, 0, 0, 0],
  metricas: { mae: 1, rmse: 1, r2: 0.9, n_entrenamiento: 10, n_prueba: 2 },
  base_por_ruta: { 'La Paz - Cochabamba': 40 },
  base_por_defecto: 30,
};

describe('Feriados de Bolivia', () => {
  it('calcula la Pascua y los feriados moviles de 2026', () => {
    expect(domingoDePascua(2026).toISOString().slice(0, 10)).toBe('2026-04-05');
    expect(esFeriado('2026-02-16')).toBe(true); // lunes de Carnaval
    expect(esFeriado('2026-02-17')).toBe(true); // martes de Carnaval
    expect(esFeriado('2026-04-03')).toBe(true); // Viernes Santo
    expect(esFeriado('2026-06-04')).toBe(true); // Corpus Christi
    expect(esFeriado('2026-08-06')).toBe(true); // Independencia
    expect(esVisperaDeFeriado('2026-08-05')).toBe(true);
    expect(esFeriado('2026-08-07')).toBe(false);
  });
});

describe('Caracteristicas del dia', () => {
  it('marca el dia de la semana, el feriado, la temporada alta y la tendencia', () => {
    // 2026-08-06 es jueves, feriado y no temporada alta; 2027-01-01 esta a un año del inicio
    expect(caracteristicasDelDia('2026-08-06', '2025-08-06')).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 365 / 365.25]);
    expect(caracteristicasDelDia('2026-07-19', '2026-07-19')).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]); // domingo de julio
  });
});

describe('Regresion lineal multiple', () => {
  it('resuelve un sistema de ecuaciones', () => {
    expect(resolverSistema([[2, 1], [1, 3]], [3, 5]).map((v) => Math.round(v * 1000) / 1000)).toEqual([0.8, 1.4]);
  });

  it('recupera los coeficientes de datos sin ruido y mide error cero', () => {
    const X = Array.from({ length: 20 }, (_, i) => [1, i, (i * 7) % 5]);
    const y = X.map(([, a, b]) => 3 + 2 * a! - 0.5 * b!);
    const b = ajustar(X, y);
    expect(b.map((v) => Math.round(v * 1000) / 1000)).toEqual([3, 2, -0.5]);
    expect(metricas(y, y)).toEqual({ mae: 0, rmse: 0, r2: 1 });
  });

  it('el modelo entrenado predice los dias de prueba con R² alto y es compatible con el dominio', () => {
    const modelo = entrenar();
    expect(() => exigirModeloCompatible(modelo)).not.toThrow();
    expect(modelo.metricas.r2).toBeGreaterThan(0.85);
    expect(modelo.metricas.n_prueba).toBeGreaterThan(0);
    expect(modelo.datos).toMatch(/^sinteticos/);
  });
});

describe('Reglas del modelo', () => {
  it('pasajes = base × indice, nunca negativos', () => {
    expect(pasajesEstimados(MODELO, 40, '2026-10-02')).toBe(60); // viernes
    expect(pasajesEstimados(MODELO, 40, '2026-10-05')).toBe(40); // lunes
    expect(pasajesEstimados({ ...MODELO, coeficientes: [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, 40, '2026-10-05')).toBe(0);
  });

  it('la base sale de las ventas reales solo si hay suficientes dias', () => {
    const ruta = { nombre: 'La Paz - Cochabamba' };
    expect(baseDeRuta(MODELO, ruta, { dias_con_ventas: 20, promedio: 12.34 }, 14)).toEqual({ pasajes_por_dia: 12.3, fuente: 'ventas_reales' });
    expect(baseDeRuta(MODELO, ruta, { dias_con_ventas: 3, promedio: 12 }, 14)).toEqual({ pasajes_por_dia: 40, fuente: 'modelo' });
    expect(baseDeRuta(MODELO, { nombre: 'Otra' }, undefined, 14)).toEqual({ pasajes_por_dia: 30, fuente: 'modelo' });
  });

  it('sugiere refuerzo por encima del 90 % y avisa si no hay viajes', () => {
    expect(evaluarCapacidad(37, 40)).toEqual({ ocupacion_estimada: 0.925, alerta: 'refuerzo_sugerido' });
    expect(evaluarCapacidad(36, 40)).toEqual({ ocupacion_estimada: 0.9, alerta: null });
    expect(evaluarCapacidad(10, 0)).toEqual({ ocupacion_estimada: null, alerta: 'sin_viajes' });
  });

  it('rechaza un JSON con otras caracteristicas', () => {
    expect(() => exigirModeloCompatible({ ...MODELO, caracteristicas: ['intercepto'] })).toThrow(ModeloInvalidoError);
  });
});

class DatosEnMemoria implements PrediccionRepositorio {
  capacidades: CapacidadDelDia[] = [{ ruta_id: 'r1', fecha: '2026-10-02', capacidad: 50, viajes: 1 }];
  async rutasActivas() {
    return [{ id: 'r1', nombre: 'La Paz - Cochabamba' }];
  }
  async capacidadProgramada() {
    return this.capacidades;
  }
  async historialDeVentas() {
    return [];
  }
}

describe('PredecirDemanda', () => {
  const predecir = () => new PredecirDemanda({ cargar: async () => MODELO }, new DatosEnMemoria(), () => '2026-10-01');

  it('estima cada ruta y dia y compara con la capacidad programada', async () => {
    const resultado = await predecir().ejecutar(3);

    expect(resultado.bases).toEqual([{ ruta: { id: 'r1', nombre: 'La Paz - Cochabamba' }, pasajes_por_dia: 40, fuente: 'modelo' }]);
    expect(resultado.dias.map((d) => [d.fecha, d.pasajes_estimados, d.capacidad_programada, d.alerta])).toEqual([
      ['2026-10-01', 40, 0, 'sin_viajes'],
      ['2026-10-02', 60, 50, 'refuerzo_sugerido'],
      ['2026-10-03', 40, 0, 'sin_viajes'],
    ]);
  });

  it('acepta de 1 a 31 dias', async () => {
    await expect(predecir().ejecutar(0)).rejects.toThrow(PeriodoInvalidoError);
    await expect(predecir().ejecutar(32)).rejects.toThrow(PeriodoInvalidoError);
  });
});
