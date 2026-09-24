'use client';

import { useState } from 'react';
import type { PisoCroquisEntrada } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { PlanoAsientos } from '@/compartido/componentes/PlanoAsientos';
import type { AsientoDelPlano } from '@/compartido/componentes/PlanoAsientos';
import { useTiposAsiento } from '@/modulos/catalogos/hooks/useCatalogos';
import { useCambiarTipoAsiento, useCroquis, useGenerarCroquis } from '../hooks/useCroquis';

/** formulario para generar el croquis estandar de un bus que todavia no tiene asientos */
function GeneradorCroquis({ busId, numeroPisos }: { busId: string; numeroPisos: number }) {
  const tipos = useTiposAsiento();
  const generar = useGenerarCroquis(busId);
  const [pisos, setPisos] = useState<PisoCroquisEntrada[]>(
    Array.from({ length: numeroPisos }, (_, i) => ({ piso: i + 1, filas: 10, asientos_por_fila: 4, tipo: 'semicama' })),
  );
  const opcionesTipo = (tipos.data ?? []).map((t) => ({ valor: t.codigo, texto: t.nombre }));
  const cambiar = (i: number, cambio: Partial<PisoCroquisEntrada>) =>
    setPisos(pisos.map((p, j) => (j === i ? { ...p, ...cambio } : p)));

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        generar.mutate({ pisos });
      }}
    >
      <p className="text-slate-600">El bus todavia no tiene asientos. Genera el croquis estandar y luego ajusta cada asiento.</p>
      {pisos.map((piso, i) => (
        <fieldset key={piso.piso} className="grid gap-2 sm:grid-cols-3">
          <legend className="text-sm font-semibold">Piso {piso.piso}</legend>
          <Campo
            etiqueta="Filas"
            type="number"
            min="1"
            max="20"
            value={piso.filas}
            onChange={(e) => cambiar(i, { filas: Number(e.target.value) })}
          />
          <CampoSeleccion
            etiqueta="Asientos por fila"
            opciones={[
              { valor: '4', texto: '4 (dos y dos)' },
              { valor: '3', texto: '3 (uno y dos)' },
            ]}
            value={String(piso.asientos_por_fila)}
            onChange={(e) => cambiar(i, { asientos_por_fila: e.target.value === '3' ? 3 : 4 })}
          />
          <CampoSeleccion etiqueta="Tipo" opciones={opcionesTipo} value={piso.tipo} onChange={(e) => cambiar(i, { tipo: e.target.value })} />
        </fieldset>
      ))}
      {generar.error && (
        <p role="alert" className="text-red-600">
          {generar.error.message}
        </p>
      )}
      <Boton type="submit" className="w-fit" cargando={generar.isPending}>
        Generar croquis
      </Boton>
    </form>
  );
}

/**
 * EDITOR DE CROQUIS: muestra los asientos del bus; al tocar uno se puede cambiar su tipo.
 * Si el bus tiene viajes programados, la API solo acepta tipos que ya tienen precio en esos viajes.
 */
export function EditorCroquis({ busId }: { busId: string }) {
  const croquis = useCroquis(busId);
  const tipos = useTiposAsiento();
  const cambiarTipo = useCambiarTipoAsiento(busId);
  const [elegido, setElegido] = useState<string | null>(null);

  if (croquis.isPending) return <p className="text-slate-500">Cargando el croquis...</p>;
  if (croquis.error) return <p className="text-red-600">{croquis.error.message}</p>;

  const datos = croquis.data;
  if (datos.asientos.length === 0) return <GeneradorCroquis busId={busId} numeroPisos={datos.numero_pisos} />;

  const asiento = datos.asientos.find((a) => a.id === elegido) ?? null;
  const conteo = datos.asientos.reduce<Record<string, number>>((c, a) => ({ ...c, [a.tipo]: (c[a.tipo] ?? 0) + 1 }), {});
  const asientosDelPlano: AsientoDelPlano[] = datos.asientos.map((a) => ({
    ...a,
    estado: a.id === elegido ? 'seleccionado' : 'libre',
    detalle: a.tipo,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <section className="flex flex-col gap-2">
        <p className="text-sm text-slate-600">
          {datos.asientos.length} asientos · {Object.entries(conteo).map(([tipo, n]) => `${n} ${tipo}`).join(' · ')}
        </p>
        <PlanoAsientos
          numeroPisos={datos.numero_pisos}
          asientos={asientosDelPlano}
          alElegir={(a) => {
            cambiarTipo.reset();
            setElegido(a.id === elegido ? null : a.id);
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        {asiento ? (
          <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
            <h2 className="text-lg font-semibold">
              Asiento {asiento.numero} · piso {asiento.piso}, fila {asiento.fila}
            </h2>
            <CampoSeleccion
              etiqueta="Tipo"
              opciones={(tipos.data ?? []).map((t) => ({ valor: t.codigo, texto: t.nombre }))}
              value={asiento.tipo}
              disabled={cambiarTipo.isPending}
              onChange={(e) => cambiarTipo.mutate({ asientoId: asiento.id, tipo: e.target.value })}
            />
            {cambiarTipo.isPending && <p className="text-sm text-slate-500">Guardando...</p>}
            {cambiarTipo.error && (
              <p role="alert" className="text-sm text-red-600">
                {cambiarTipo.error.message}
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-600">Toca un asiento del croquis para cambiar su tipo.</p>
        )}
      </section>
    </div>
  );
}
