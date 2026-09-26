'use client';

/**
 * PLANO DE ASIENTOS: dibuja el croquis de un bus, piso por piso, con su fila y columna.
 * Lo usan el portal (elegir asiento), la taquilla y el editor de croquis.
 *
 * No sabe de viajes ni de ventas: recibe cada asiento con su estado y avisa cual se toco.
 * El estado no se distingue solo por el color: el ocupado va tachado y el elegido, relleno;
 * cada boton mide al menos 44 px y dice su estado a los lectores de pantalla.
 */

export type EstadoAsiento = 'libre' | 'ocupado' | 'seleccionado';

export type AsientoDelPlano = {
  id: string;
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  tipo: string;
  estado: EstadoAsiento;
  /** texto corto debajo del numero (por ejemplo el precio) */
  detalle?: string;
  /** el mismo detalle dicho completo para lectores de pantalla (por ejemplo "Bs 47,50") */
  detalleAccesible?: string;
};

type Propiedades = {
  numeroPisos: number;
  asientos: AsientoDelPlano[];
  alElegir?: (asiento: AsientoDelPlano) => void;
};

const ESTILOS: Record<EstadoAsiento, string> = {
  libre: 'border-emerald-600 bg-white text-slate-900 hover:bg-emerald-50',
  seleccionado: 'border-slate-900 bg-slate-900 text-white',
  ocupado: 'cursor-not-allowed border-slate-300 bg-slate-200 text-slate-600 line-through',
};

export function PlanoAsientos({ numeroPisos, asientos, alElegir }: Propiedades) {
  const pisos = Array.from({ length: numeroPisos }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 text-xs text-slate-700">
        <span className="flex items-center gap-1">
          <i aria-hidden="true" className="h-3 w-3 rounded border-2 border-emerald-600 bg-white" /> Libre
        </span>
        <span className="flex items-center gap-1">
          <i aria-hidden="true" className="h-3 w-3 rounded bg-slate-900" /> Elegido
        </span>
        <span className="flex items-center gap-1">
          <i aria-hidden="true" className="h-3 w-3 rounded border border-slate-300 bg-slate-200" /> Ocupado (tachado)
        </span>
      </div>

      {pisos.map((piso) => {
        const delPiso = asientos.filter((a) => a.piso === piso);
        if (delPiso.length === 0) return null;
        const filas = Math.max(...delPiso.map((a) => a.fila));
        const columnas = Math.max(...delPiso.map((a) => a.columna));

        return (
          <section key={piso} aria-label={`Piso ${piso}`} className="flex flex-col gap-2">
            {numeroPisos > 1 && <h3 className="text-sm font-semibold text-slate-700">Piso {piso}</h3>}
            <div
              className="grid w-fit gap-2 rounded-xl border border-slate-300 bg-slate-50 p-3"
              style={{
                gridTemplateColumns: `repeat(${columnas}, minmax(2.75rem, 3.25rem))`,
                gridTemplateRows: `repeat(${filas}, auto)`,
              }}
            >
              {delPiso.map((asiento) => (
                <button
                  key={asiento.id}
                  type="button"
                  disabled={asiento.estado === 'ocupado' || !alElegir}
                  onClick={() => alElegir?.(asiento)}
                  aria-pressed={asiento.estado === 'seleccionado'}
                  aria-label={`Asiento ${asiento.numero}, ${asiento.tipo}, ${asiento.estado}${asiento.detalleAccesible ? `, ${asiento.detalleAccesible}` : ''}`}
                  title={`Asiento ${asiento.numero} · ${asiento.tipo}`}
                  className={`flex min-h-11 flex-col items-center justify-center rounded-lg border-2 px-1 py-1.5 text-sm font-semibold transition-colors ${ESTILOS[asiento.estado]}`}
                  style={{ gridColumn: asiento.columna, gridRow: asiento.fila }}
                >
                  {asiento.numero}
                  {asiento.detalle && <span className="text-xs font-normal leading-tight">{asiento.detalle}</span>}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
