'use client';

import { useState } from 'react';
import type { RegistrarTerminalEntrada } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { useCiudades } from '@/modulos/catalogos/hooks/useCatalogos';
import { useRegistrarTerminal } from '../hooks/useRegistrarTerminal';

const VALORES_INICIALES: RegistrarTerminalEntrada = { nombre: '', ciudad_id: '', direccion: '' };

/** formulario para registrar una terminal; la ciudad se elige del catalogo */
export function FormularioTerminal() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const ciudades = useCiudades();
  const registrar = useRegistrarTerminal();

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    registrar.mutate(valores, {
      onSuccess: () => setValores(VALORES_INICIALES),
    });
  }

  const opcionesCiudad = (ciudades.data ?? []).map((ciudad) => ({
    valor: ciudad.id,
    texto: ciudad.nombre,
  }));

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="font-semibold">Registrar terminal</h2>

      <Campo
        etiqueta="Nombre"
        placeholder="Ej. Terminal de Buses Potosí"
        value={valores.nombre}
        onChange={(e) => setValores({ ...valores, nombre: e.target.value })}
        required
      />

      <CampoSeleccion
        etiqueta="Ciudad"
        textoVacio={ciudades.isPending ? 'Cargando ciudades...' : 'Elige una ciudad'}
        opciones={opcionesCiudad}
        value={valores.ciudad_id}
        onChange={(e) => setValores({ ...valores, ciudad_id: e.target.value })}
        error={ciudades.error ? 'No se pudieron cargar las ciudades' : undefined}
        required
      />

      <Campo
        etiqueta="Dirección"
        placeholder="Ej. Av. Universitaria s/n"
        value={valores.direccion}
        onChange={(e) => setValores({ ...valores, direccion: e.target.value })}
        required
      />

      <Boton type="submit" cargando={registrar.isPending}>
        Registrar
      </Boton>

      {registrar.error && (
        <p role="alert" className="text-red-600">
          {registrar.error.message}
        </p>
      )}
    </form>
  );
}
