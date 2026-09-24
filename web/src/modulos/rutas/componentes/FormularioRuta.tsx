'use client';

import { useState } from 'react';
import type { ParadaRutaEntrada } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { useTerminales } from '@/modulos/terminales/hooks/useTerminales';
import { useRegistrarRuta } from '../hooks/useRutas';

/** en el formulario todo es texto; al enviar se convierte a numeros */
type ParadaFormulario = { terminal_id: string; minutos: string; km: string };

const PARADA_VACIA: ParadaFormulario = { terminal_id: '', minutos: '', km: '' };
const INICIAL = { nombre: '', paradas: [{ ...PARADA_VACIA, minutos: '0', km: '0' }, { ...PARADA_VACIA }] };

function aEntrada(paradas: ParadaFormulario[]): ParadaRutaEntrada[] {
  return paradas.map((p) => ({
    terminal_id: p.terminal_id,
    minutos_desde_origen: Number(p.minutos),
    km_desde_origen: p.km === '' ? null : Number(p.km),
  }));
}

/**
 * Formulario de una ruta con sus paradas EN ORDEN (la primera es el origen).
 * Las reglas (al menos 2 paradas, minutos crecientes desde 0, sin terminales repetidas)
 * las valida la API y aqui se muestra su mensaje.
 */
export function FormularioRuta() {
  const [nombre, setNombre] = useState(INICIAL.nombre);
  const [paradas, setParadas] = useState<ParadaFormulario[]>(INICIAL.paradas);
  const terminales = useTerminales();
  const registrar = useRegistrarRuta();

  const opciones = (terminales.data ?? []).map((t) => ({ valor: t.id, texto: `${t.nombre} (${t.ciudad.nombre})` }));

  /** quita una parada; si era el origen, la siguiente pasa a ser el origen (0 minutos) */
  function quitarParada(indice: number) {
    const restantes = paradas.filter((_, j) => j !== indice);
    setParadas(restantes.map((p, j) => (j === 0 ? { ...p, minutos: '0' } : p)));
  }

  function cambiarParada(indice: number, campo: keyof ParadaFormulario, valor: string) {
    setParadas(paradas.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)));
  }

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    registrar.mutate(
      { nombre, paradas: aEntrada(paradas) },
      {
        onSuccess: () => {
          setNombre(INICIAL.nombre);
          setParadas(INICIAL.paradas);
        },
      },
    );
  }

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="font-semibold">Registrar ruta</h2>
      <Campo etiqueta="Nombre" placeholder="Ej. La Paz - Cochabamba" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm text-slate-700">Paradas en orden (la primera es el origen)</legend>
        {paradas.map((parada, i) => (
          <div key={i} className="flex flex-col gap-2 rounded border border-slate-200 p-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Parada {i + 1}{i === 0 ? ' · origen' : i === paradas.length - 1 ? ' · destino' : ''}</span>
              {paradas.length > 2 && (
                <button type="button" className="text-red-600 underline" onClick={() => quitarParada(i)}>
                  Quitar
                </button>
              )}
            </div>
            <CampoSeleccion
              etiqueta="Terminal"
              textoVacio={terminales.isPending ? 'Cargando...' : 'Elige una terminal'}
              opciones={opciones}
              value={parada.terminal_id}
              onChange={(e) => cambiarParada(i, 'terminal_id', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Campo
                etiqueta="Minutos desde el origen"
                type="number"
                min={0}
                value={parada.minutos}
                disabled={i === 0}
                onChange={(e) => cambiarParada(i, 'minutos', e.target.value)}
                required
              />
              <Campo
                etiqueta="Km desde el origen"
                type="number"
                min={0}
                step="0.1"
                value={parada.km}
                onChange={(e) => cambiarParada(i, 'km', e.target.value)}
              />
            </div>
          </div>
        ))}
        <Boton type="button" variante="secundario" onClick={() => setParadas([...paradas, { ...PARADA_VACIA }])}>
          Agregar parada
        </Boton>
      </fieldset>

      <Boton type="submit" cargando={registrar.isPending}>
        Registrar ruta
      </Boton>
      {registrar.error && (
        <p role="alert" className="text-red-600">
          {registrar.error.message}
        </p>
      )}
    </form>
  );
}
