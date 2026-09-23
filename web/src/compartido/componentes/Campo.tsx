'use client';

import { useId } from 'react';

/**
 * CAMPOS de formulario reutilizables: cada uno trae su etiqueta y su mensaje de error.
 *
 * Ejemplos:
 *   <Campo etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
 *   <CampoSeleccion etiqueta="Ciudad" opciones={[{ valor: 'id', texto: 'Oruro' }]} ... />
 */

const ESTILO_CONTROL =
  'w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none';

type PropiedadesCampo = React.InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  /** mensaje en rojo debajo del campo */
  error?: string;
};

export function Campo({ etiqueta, error, id, ...resto }: PropiedadesCampo) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;

  return (
    <label htmlFor={idCampo} className="flex flex-col gap-1 text-sm text-slate-700">
      {etiqueta}
      <input id={idCampo} className={ESTILO_CONTROL} aria-invalid={Boolean(error)} {...resto} />
      {error && <span className="text-red-600">{error}</span>}
    </label>
  );
}

export type OpcionSeleccion = { valor: string; texto: string };

type PropiedadesCampoSeleccion = React.SelectHTMLAttributes<HTMLSelectElement> & {
  etiqueta: string;
  opciones: OpcionSeleccion[];
  /** texto de la primera opcion vacia, por ejemplo "Elige una ciudad" */
  textoVacio?: string;
  error?: string;
};

export function CampoSeleccion({
  etiqueta,
  opciones,
  textoVacio,
  error,
  id,
  ...resto
}: PropiedadesCampoSeleccion) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;

  return (
    <label htmlFor={idCampo} className="flex flex-col gap-1 text-sm text-slate-700">
      {etiqueta}
      <select id={idCampo} className={ESTILO_CONTROL} aria-invalid={Boolean(error)} {...resto}>
        {textoVacio && <option value="">{textoVacio}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
      {error && <span className="text-red-600">{error}</span>}
    </label>
  );
}
