'use client';

import type { TipoDocumento, TipoPasajero } from '@panamericana/shared';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { useTiposDocumento } from '@/modulos/catalogos/hooks/useCatalogos';

export type DatosPasajeroFormulario = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  /** tarifa diferenciada: general, adulto_mayor, discapacidad o menor */
  tipo_pasajero: string;
};

export const PASAJERO_VACIO: DatosPasajeroFormulario = {
  tipo_documento: 'ci',
  numero_documento: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  tipo_pasajero: 'general',
};

type Propiedades = {
  /** un bloque por asiento elegido */
  asientos: { id: string; numero: number }[];
  pasajeros: Record<string, DatosPasajeroFormulario>;
  /** tarifas de la ley (catalogo tipos_pasajero) */
  tarifas: TipoPasajero[];
  alCambiar: (asientoId: string, datos: DatosPasajeroFormulario) => void;
};

/** texto de una tarifa en el selector: "Persona adulta mayor (60 años o más) · 20 % menos" */
function textoTarifa(tarifa: TipoPasajero): string {
  return tarifa.descuento_porcentaje > 0 ? `${tarifa.nombre} · ${tarifa.descuento_porcentaje} % menos` : tarifa.nombre;
}

/**
 * datos de cada pasajero: documento boliviano, nombres, tarifa y un celular de contacto (opcional).
 * Solo se piden los datos que exige el boleto; el celular sirve para avisar cambios del viaje.
 */
export function FormularioPasajeros({ asientos, pasajeros, tarifas, alCambiar }: Propiedades) {
  const tipos = useTiposDocumento();
  const opciones = (tipos.data ?? []).map((t) => ({ valor: t.codigo, texto: t.nombre }));
  const opcionesTarifa = tarifas.map((t) => ({ valor: t.codigo, texto: textoTarifa(t) }));

  return (
    <div className="flex flex-col gap-4">
      {asientos.map((asiento) => {
        const datos = pasajeros[asiento.id] ?? PASAJERO_VACIO;
        const cambiar = (campo: keyof DatosPasajeroFormulario, valor: string) =>
          alCambiar(asiento.id, { ...datos, [campo]: valor });
        const requisito = tarifas.find((t) => t.codigo === datos.tipo_pasajero)?.requisito;
        // cada pasajero es una "seccion" distinta para el autocompletado del navegador
        const seccion = `section-asiento${asiento.numero}`;

        return (
          <fieldset key={asiento.id} className="flex flex-col gap-2 rounded-lg border border-slate-300 p-3">
            <legend className="px-1 text-sm font-semibold">Pasajero del asiento {asiento.numero}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <CampoSeleccion
                etiqueta="Documento"
                opciones={opciones}
                value={datos.tipo_documento}
                onChange={(e) => cambiar('tipo_documento', e.target.value)}
              />
              <Campo
                etiqueta="Número de documento"
                placeholder="Ej. 4827351"
                autoComplete="off"
                value={datos.numero_documento}
                onChange={(e) => cambiar('numero_documento', e.target.value)}
                required
              />
              <Campo
                etiqueta="Nombres"
                autoComplete={`${seccion} given-name`}
                value={datos.nombres}
                onChange={(e) => cambiar('nombres', e.target.value)}
                required
              />
              <Campo
                etiqueta="Apellidos"
                autoComplete={`${seccion} family-name`}
                value={datos.apellidos}
                onChange={(e) => cambiar('apellidos', e.target.value)}
                required
              />
              <CampoSeleccion
                etiqueta="Tarifa"
                opciones={opcionesTarifa}
                value={datos.tipo_pasajero}
                onChange={(e) => cambiar('tipo_pasajero', e.target.value)}
                ayuda={requisito ? `Al subir al bus se debe presentar: ${requisito}.` : undefined}
              />
              <Campo
                etiqueta="Celular (opcional)"
                type="tel"
                inputMode="numeric"
                autoComplete={`${seccion} tel-national`}
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
