'use client';

import { useState } from 'react';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo } from '@/compartido/componentes/Campo';
import { formatearFecha, hoyEnBolivia } from '@/compartido/utilidades/fechas';

type Busqueda = { origen: string; destino: string; fecha: string };
type Errores = Partial<Record<keyof Busqueda, string>>;

/** reglas del buscador: todo obligatorio, origen distinto del destino y fecha desde hoy */
function validar(busqueda: Busqueda, hoy: string): Errores {
  const errores: Errores = {};
  const origen = busqueda.origen.trim().toLowerCase();
  const destino = busqueda.destino.trim().toLowerCase();

  if (!origen) errores.origen = 'Escribe la ciudad de origen';
  if (!destino) errores.destino = 'Escribe la ciudad de destino';
  if (origen && destino && origen === destino) {
    errores.destino = 'El destino debe ser distinto del origen';
  }
  if (!busqueda.fecha) errores.fecha = 'Elige la fecha del viaje';
  else if (busqueda.fecha < hoy) errores.fecha = 'La fecha no puede ser anterior a hoy';

  return errores;
}

/**
 * BUSCADOR DE VIAJES (maqueta del Sprint 1).
 * Valida los datos en pantalla; la busqueda real contra la API llega en el Sprint 2.
 *
 * Ojo: la portada se genera por adelantado (pagina estatica). Por eso "hoy" se vuelve a
 * calcular al validar, y el atributo min lleva suppressHydrationWarning: el dia de la
 * compilacion puede no ser el dia en que el cliente abre la pagina.
 */
export function BuscadorViajes() {
  const hoy = hoyEnBolivia();
  const [busqueda, setBusqueda] = useState<Busqueda>({ origen: '', destino: '', fecha: '' });
  const [errores, setErrores] = useState<Errores>({});
  const [enviada, setEnviada] = useState<Busqueda | null>(null);

  function cambiar(campo: keyof Busqueda, valor: string) {
    setBusqueda({ ...busqueda, [campo]: valor });
    setErrores({ ...errores, [campo]: undefined });
    setEnviada(null);
  }

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validar(busqueda, hoyEnBolivia());
    setErrores(encontrados);
    setEnviada(Object.keys(encontrados).length === 0 ? busqueda : null);
  }

  return (
    <form
      onSubmit={alEnviar}
      noValidate
      className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-lg sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo
          etiqueta="Origen"
          placeholder="Ej. La Paz"
          value={busqueda.origen}
          onChange={(e) => cambiar('origen', e.target.value)}
          error={errores.origen}
        />
        <Campo
          etiqueta="Destino"
          placeholder="Ej. Cochabamba"
          value={busqueda.destino}
          onChange={(e) => cambiar('destino', e.target.value)}
          error={errores.destino}
        />
        <Campo
          etiqueta="Fecha de viaje"
          type="date"
          min={hoy}
          suppressHydrationWarning
          value={busqueda.fecha}
          onChange={(e) => cambiar('fecha', e.target.value)}
          error={errores.fecha}
        />
      </div>

      <Boton type="submit" className="w-full sm:w-auto sm:self-end">
        Buscar viajes
      </Boton>

      {enviada && (
        <p role="status" className="rounded bg-slate-100 p-3 text-sm text-slate-700">
          Muy pronto podras ver aqui los viajes de <strong>{enviada.origen.trim()}</strong> a{' '}
          <strong>{enviada.destino.trim()}</strong> para el {formatearFecha(enviada.fecha)}.
        </p>
      )}
    </form>
  );
}
