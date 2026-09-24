'use client';

import type { TipoDocumento } from '@panamericana/shared';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { useTiposDocumento } from '@/modulos/catalogos/hooks/useCatalogos';

export type DatosPasajeroFormulario = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
};

export const PASAJERO_VACIO: DatosPasajeroFormulario = {
  tipo_documento: 'ci',
  numero_documento: '',
  nombres: '',
  apellidos: '',
  telefono: '',
};

type Propiedades = {
  /** un bloque por asiento elegido */
  asientos: { id: string; numero: number }[];
  pasajeros: Record<string, DatosPasajeroFormulario>;
  alCambiar: (asientoId: string, datos: DatosPasajeroFormulario) => void;
};

/** datos de cada pasajero: documento boliviano, nombres y un celular de contacto (opcional) */
export function FormularioPasajeros({ asientos, pasajeros, alCambiar }: Propiedades) {
  const tipos = useTiposDocumento();
  const opciones = (tipos.data ?? []).map((t) => ({ valor: t.codigo, texto: t.nombre }));

  return (
    <div className="flex flex-col gap-4">
      {asientos.map((asiento) => {
        const datos = pasajeros[asiento.id] ?? PASAJERO_VACIO;
        const cambiar = (campo: keyof DatosPasajeroFormulario, valor: string) =>
          alCambiar(asiento.id, { ...datos, [campo]: valor });

        return (
          <fieldset key={asiento.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
            <legend className="px-1 text-sm font-semibold">Pasajero del asiento {asiento.numero}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <CampoSeleccion
                etiqueta="Documento"
                opciones={opciones}
                value={datos.tipo_documento}
                onChange={(e) => cambiar('tipo_documento', e.target.value)}
              />
              <Campo
                etiqueta="Numero"
                placeholder="Ej. 4827351"
                value={datos.numero_documento}
                onChange={(e) => cambiar('numero_documento', e.target.value)}
                required
              />
              <Campo etiqueta="Nombres" value={datos.nombres} onChange={(e) => cambiar('nombres', e.target.value)} required />
              <Campo etiqueta="Apellidos" value={datos.apellidos} onChange={(e) => cambiar('apellidos', e.target.value)} required />
              <Campo
                etiqueta="Celular (opcional)"
                inputMode="numeric"
                placeholder="Ej. 71234567"
                value={datos.telefono}
                onChange={(e) => cambiar('telefono', e.target.value)}
              />
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
