import type { EstadoEncomienda } from '@panamericana/shared';

export const NOMBRES_ESTADO: Record<EstadoEncomienda, string> = {
  registrada: 'Registrada',
  en_transito: 'En tránsito',
  en_destino: 'En destino',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

const ESTILOS: Record<EstadoEncomienda, string> = {
  registrada: 'bg-slate-200 text-slate-800',
  en_transito: 'bg-blue-100 text-blue-800',
  en_destino: 'bg-amber-100 text-amber-800',
  entregada: 'bg-emerald-100 text-emerald-800',
  cancelada: 'bg-red-100 text-red-800',
};

/** el estado de una encomienda como etiqueta de color (panel y seguimiento publico) */
export function EtiquetaEstado({ estado }: { estado: EstadoEncomienda }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${ESTILOS[estado]}`}>{NOMBRES_ESTADO[estado]}</span>;
}
