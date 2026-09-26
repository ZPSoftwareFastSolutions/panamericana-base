'use client';

import { useId } from 'react';

/**
 * CAMPOS de formulario reutilizables: cada uno trae su etiqueta, un texto de ayuda opcional
 * y su mensaje de error. La ayuda y el error quedan enlazados al control (aria-describedby):
 * un lector de pantalla los lee al entrar al campo.
 *
 * Ejemplos:
 *   <Campo etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
 *   <CampoSeleccion etiqueta="Ciudad" opciones={[{ valor: 'id', texto: 'Oruro' }]} ... />
 *   <CampoCasilla checked={acepta} onChange={(e) => setAcepta(e.target.checked)} required>Acepto...</CampoCasilla>
 */

// el borde de foco lo pone globals.css (:focus-visible) para que sea igual en todo el sistema
const ESTILO_CONTROL =
  'min-h-11 w-full rounded border border-slate-500 bg-white px-3 py-2 text-base text-slate-900 aria-[invalid=true]:border-red-600';

type Descripcion = { ayuda?: string; error?: string };

/** ids de la ayuda y del error, y el valor de aria-describedby que los enlaza al control */
function useDescripcion(id: string | undefined, { ayuda, error }: Descripcion) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idAyuda = `${idCampo}-ayuda`;
  const idError = `${idCampo}-error`;
  const describidoPor = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ') || undefined;
  return { idCampo, idAyuda, idError, describidoPor };
}

function Mensajes({ ayuda, error, idAyuda, idError }: Descripcion & { idAyuda: string; idError: string }) {
  return (
    <>
      {ayuda && (
        <span id={idAyuda} className="text-xs text-slate-600">
          {ayuda}
        </span>
      )}
      {error && (
        <span id={idError} className="text-red-600">
          {error}
        </span>
      )}
    </>
  );
}

type PropiedadesCampo = React.InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  /** texto gris debajo del campo (por ejemplo, que documento pedir) */
  ayuda?: string;
  /** mensaje en rojo debajo del campo */
  error?: string;
};

export function Campo({ etiqueta, ayuda, error, id, ...resto }: PropiedadesCampo) {
  const { idCampo, idAyuda, idError, describidoPor } = useDescripcion(id, { ayuda, error });

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={idCampo} className="text-slate-700">
        {etiqueta}
      </label>
      <input
        id={idCampo}
        className={ESTILO_CONTROL}
        aria-invalid={Boolean(error)}
        aria-describedby={describidoPor}
        {...resto}
      />
      <Mensajes ayuda={ayuda} error={error} idAyuda={idAyuda} idError={idError} />
    </div>
  );
}

export type OpcionSeleccion = { valor: string; texto: string };

type PropiedadesCampoSeleccion = React.SelectHTMLAttributes<HTMLSelectElement> & {
  etiqueta: string;
  opciones: OpcionSeleccion[];
  /** texto de la primera opcion vacia, por ejemplo "Elige una ciudad" */
  textoVacio?: string;
  ayuda?: string;
  error?: string;
};

export function CampoSeleccion({
  etiqueta,
  opciones,
  textoVacio,
  ayuda,
  error,
  id,
  ...resto
}: PropiedadesCampoSeleccion) {
  const { idCampo, idAyuda, idError, describidoPor } = useDescripcion(id, { ayuda, error });

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={idCampo} className="text-slate-700">
        {etiqueta}
      </label>
      <select
        id={idCampo}
        className={ESTILO_CONTROL}
        aria-invalid={Boolean(error)}
        aria-describedby={describidoPor}
        {...resto}
      >
        {textoVacio && <option value="">{textoVacio}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
      <Mensajes ayuda={ayuda} error={error} idAyuda={idAyuda} idError={idError} />
    </div>
  );
}

type PropiedadesCasilla = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {
  /** texto de la casilla; puede llevar enlaces (por ejemplo, a los Terminos y Condiciones) */
  children: React.ReactNode;
  error?: string;
};

/** casilla de verificacion con su texto al lado (por ejemplo, aceptar los Terminos y Condiciones) */
export function CampoCasilla({ children, error, id, ...resto }: PropiedadesCasilla) {
  const { idCampo, idAyuda, idError, describidoPor } = useDescripcion(id, { error });

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-start gap-3">
        <input
          id={idCampo}
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-slate-900"
          aria-invalid={Boolean(error)}
          aria-describedby={describidoPor}
          {...resto}
        />
        <label htmlFor={idCampo} className="text-slate-700">
          {children}
        </label>
      </div>
      <Mensajes error={error} idAyuda={idAyuda} idError={idError} />
    </div>
  );
}
