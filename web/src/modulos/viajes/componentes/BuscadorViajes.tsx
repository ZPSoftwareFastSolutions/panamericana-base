'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/compartido/componentes/Boton';
import { CampoSeleccion, Campo } from '@/compartido/componentes/Campo';
import { hoyEnBolivia } from '@/compartido/utilidades/fechas';
import { useCiudades } from '@/modulos/catalogos/hooks/useCatalogos';

type Busqueda = { origen: string; destino: string; fecha: string };
type Errores = Partial<Record<keyof Busqueda, string>>;

/** reglas del buscador: todo obligatorio, origen distinto del destino y fecha desde hoy */
function validar(busqueda: Busqueda, hoy: string): Errores {
  const errores: Errores = {};
  if (!busqueda.origen) errores.origen = 'Elige la ciudad de origen';
  if (!busqueda.destino) errores.destino = 'Elige la ciudad de destino';
  if (busqueda.origen && busqueda.origen === busqueda.destino) {
    errores.destino = 'El destino debe ser distinto del origen';
  }
  if (!busqueda.fecha) errores.fecha = 'Elige la fecha del viaje';
  else if (busqueda.fecha < hoy) errores.fecha = 'La fecha no puede ser anterior a hoy';
  return errores;
}

/**
 * BUSCADOR DE VIAJES: ciudad de origen, ciudad de destino y fecha.
 * Al buscar lleva a /viajes?origen=...&destino=...&fecha=... (la URL se puede compartir).
 *
 * Ojo: la portada se genera por adelantado (pagina estatica). Por eso "hoy" se vuelve a
 * calcular al validar, y el atributo min lleva suppressHydrationWarning.
 */
export function BuscadorViajes({ inicial }: { inicial?: Partial<Busqueda> }) {
  const router = useRouter();
  const ciudades = useCiudades();
  const [busqueda, setBusqueda] = useState<Busqueda>({
    origen: inicial?.origen ?? '',
    destino: inicial?.destino ?? '',
    fecha: inicial?.fecha ?? '',
  });
  const [errores, setErrores] = useState<Errores>({});

  const opciones = (ciudades.data ?? []).map((c) => ({ valor: c.id, texto: c.nombre }));
  const textoVacio = ciudades.isPending ? 'Cargando ciudades...' : 'Elige una ciudad';

  function cambiar(campo: keyof Busqueda, valor: string) {
    setBusqueda({ ...busqueda, [campo]: valor });
    setErrores({ ...errores, [campo]: undefined });
  }

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validar(busqueda, hoyEnBolivia());
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    const parametros = new URLSearchParams(busqueda);
    router.push(`/viajes?${parametros.toString()}`);
  }

  return (
    <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CampoSeleccion
          etiqueta="Origen"
          textoVacio={textoVacio}
          opciones={opciones}
          value={busqueda.origen}
          onChange={(e) => cambiar('origen', e.target.value)}
          error={errores.origen ?? (ciudades.error ? 'No se pudieron cargar las ciudades' : undefined)}
        />
        <CampoSeleccion
          etiqueta="Destino"
          textoVacio={textoVacio}
          opciones={opciones}
          value={busqueda.destino}
          onChange={(e) => cambiar('destino', e.target.value)}
          error={errores.destino}
        />
        <Campo
          etiqueta="Fecha de viaje"
          type="date"
          min={hoyEnBolivia()}
          suppressHydrationWarning
          value={busqueda.fecha}
          onChange={(e) => cambiar('fecha', e.target.value)}
          error={errores.fecha}
        />
      </div>
      <Boton type="submit" className="w-full sm:w-auto sm:self-end">
        Buscar viajes
      </Boton>
    </form>
  );
}
