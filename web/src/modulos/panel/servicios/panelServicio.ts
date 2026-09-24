import { RUTAS_API } from '@panamericana/shared';
import type { FiltroIndicadores, Indicadores, PrediccionDemanda } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/** SERVICIO del panel de la administradora: indicadores y demanda estimada */
export const panelServicio = {
  indicadores: (filtro: FiltroIndicadores) => clienteHttp.get<Indicadores>(RUTAS_API.panel.indicadoresCon(filtro)),
  prediccion: (dias: number) => clienteHttp.get<PrediccionDemanda>(RUTAS_API.panel.prediccionDe(dias)),
};
