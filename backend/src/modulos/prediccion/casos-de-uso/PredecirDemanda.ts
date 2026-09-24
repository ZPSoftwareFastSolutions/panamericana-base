import { sumarDias } from '../../../compartido/dominio/Fechas';
import { esFeriado } from '../dominio/FeriadosBolivia';
import { baseDeRuta, evaluarCapacidad, exigirModeloCompatible, pasajesEstimados } from '../dominio/ModeloDemanda';
import type { ModeloDemanda } from '../dominio/ModeloDemanda';
import type { FuenteDelModelo, PrediccionRepositorio } from '../dominio/PrediccionRepositorio';
import { PeriodoInvalidoError } from '../dominio/errores';

export const MAXIMO_DIAS = 31;
/** dias hacia atras que se miran para calcular la demanda real de una ruta */
const DIAS_DE_HISTORIA = 90;
/** con menos dias con ventas que estos, se usa la base del modelo */
const DIAS_MINIMOS_DE_HISTORIA = 14;

type Ruta = { id: string; nombre: string };

export type ResultadoPrediccion = {
  modelo: { tipo: string; version: string; entrenado_en: string; datos: string; metricas: ModeloDemanda['metricas'] };
  bases: { ruta: Ruta; pasajes_por_dia: number; fuente: 'ventas_reales' | 'modelo' }[];
  dias: {
    fecha: string;
    ruta: Ruta;
    feriado: boolean;
    pasajes_estimados: number;
    capacidad_programada: number;
    viajes_programados: number;
    ocupacion_estimada: number | null;
    alerta: 'refuerzo_sugerido' | 'sin_viajes' | null;
  }[];
};

/**
 * Caso de uso: demanda estimada de pasajes por ruta para los proximos dias.
 * Pasos: 1) modelo compatible · 2) base de cada ruta (ventas reales o modelo)
 *        3) pasajes estimados por dia · 4) comparacion con la capacidad ya programada (alerta de refuerzo)
 */
export class PredecirDemanda {
  constructor(
    private readonly fuente: FuenteDelModelo,
    private readonly datos: PrediccionRepositorio,
    private readonly hoy: () => string,
  ) {}

  async ejecutar(dias = 7): Promise<ResultadoPrediccion> {
    if (!Number.isInteger(dias) || dias < 1 || dias > MAXIMO_DIAS) {
      throw new PeriodoInvalidoError(`Se predicen de 1 a ${MAXIMO_DIAS} dias`);
    }
    const modelo = await this.fuente.cargar();
    exigirModeloCompatible(modelo);

    const desde = this.hoy();
    const hasta = sumarDias(desde, dias - 1);
    const [rutas, capacidades, historial] = await Promise.all([
      this.datos.rutasActivas(),
      this.datos.capacidadProgramada(desde, hasta),
      this.datos.historialDeVentas(sumarDias(desde, -DIAS_DE_HISTORIA), sumarDias(desde, -1)),
    ]);

    const bases = rutas.map((ruta) => ({
      ruta,
      ...baseDeRuta(
        modelo,
        ruta,
        historial.find((h) => h.ruta_id === ruta.id),
        DIAS_MINIMOS_DE_HISTORIA,
      ),
    }));

    const resultado: ResultadoPrediccion['dias'] = [];
    for (let i = 0; i < dias; i++) {
      const fecha = sumarDias(desde, i);
      for (const { ruta, pasajes_por_dia } of bases) {
        const estimados = pasajesEstimados(modelo, pasajes_por_dia, fecha);
        const programado = capacidades.find((c) => c.ruta_id === ruta.id && c.fecha === fecha);
        const capacidad = programado?.capacidad ?? 0;
        resultado.push({
          fecha,
          ruta,
          feriado: esFeriado(fecha),
          pasajes_estimados: estimados,
          capacidad_programada: capacidad,
          viajes_programados: programado?.viajes ?? 0,
          ...evaluarCapacidad(estimados, capacidad),
        });
      }
    }

    return {
      modelo: {
        tipo: modelo.tipo,
        version: modelo.version,
        entrenado_en: modelo.entrenado_en,
        datos: modelo.datos,
        metricas: modelo.metricas,
      },
      bases,
      dias: resultado,
    };
  }
}
