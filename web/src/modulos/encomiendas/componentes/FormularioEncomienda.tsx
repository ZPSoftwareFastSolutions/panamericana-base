'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Encomienda, PersonaEncomiendaEntrada } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoCasilla, CampoSeleccion } from '@/compartido/componentes/Campo';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { useTiposDocumento } from '@/modulos/catalogos/hooks/useCatalogos';
import { useTerminales } from '@/modulos/terminales/hooks/useTerminales';
import { useRegistrarEncomienda } from '../hooks/useEncomiendas';

const PERSONA_VACIA: PersonaEncomiendaEntrada = {
  tipo_documento: 'ci',
  numero_documento: '',
  nombres: '',
  apellidos: '',
  telefono: '',
};

const VACIO = {
  terminal_origen_id: '',
  terminal_destino_id: '',
  descripcion: '',
  peso_kg: '',
  costo: '',
};

/** datos de una persona (remitente o destinatario) dentro del formulario */
function DatosPersona({
  titulo,
  valor,
  alCambiar,
}: {
  titulo: string;
  valor: PersonaEncomiendaEntrada;
  alCambiar: (persona: PersonaEncomiendaEntrada) => void;
}) {
  const tipos = useTiposDocumento();
  const opciones = (tipos.data ?? []).map((t) => ({ valor: t.codigo, texto: t.nombre }));
  const cambiar = (campo: keyof PersonaEncomiendaEntrada, dato: string) => alCambiar({ ...valor, [campo]: dato });

  return (
    <fieldset className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
      <legend className="px-1 text-sm font-semibold">{titulo}</legend>
      <CampoSeleccion
        etiqueta="Documento"
        opciones={opciones}
        value={valor.tipo_documento}
        onChange={(e) => cambiar('tipo_documento', e.target.value)}
      />
      <Campo
        etiqueta="Número de documento"
        autoComplete="off"
        value={valor.numero_documento}
        onChange={(e) => cambiar('numero_documento', e.target.value)}
        required
      />
      <Campo etiqueta="Nombres" autoComplete="off" value={valor.nombres} onChange={(e) => cambiar('nombres', e.target.value)} required />
      <Campo
        etiqueta="Apellidos"
        autoComplete="off"
        value={valor.apellidos}
        onChange={(e) => cambiar('apellidos', e.target.value)}
        required
      />
      <Campo
        etiqueta="Celular (opcional)"
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        value={valor.telefono ?? ''}
        onChange={(e) => cambiar('telefono', e.target.value)}
      />
    </fieldset>
  );
}

/**
 * REGISTRAR UNA ENCOMIENDA: se cobra en efectivo al registrarla y entrega el codigo de seguimiento.
 * Antes de registrar, el personal confirma que el remitente acepto los Terminos y Condiciones
 * y fue informado de la Politica de Privacidad (sus datos y los del destinatario).
 */
export function FormularioEncomienda() {
  const terminales = useTerminales();
  const registrar = useRegistrarEncomienda();
  const [remitente, setRemitente] = useState(PERSONA_VACIA);
  const [destinatario, setDestinatario] = useState(PERSONA_VACIA);
  const [datos, setDatos] = useState(VACIO);
  const [registrada, setRegistrada] = useState<Encomienda | null>(null);
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false);

  const opciones = (terminales.data ?? [])
    .filter((t) => t.activo)
    .map((t) => ({ valor: t.id, texto: `${t.nombre} (${t.ciudad.nombre})` }));

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const sinTelefonoVacio = (p: PersonaEncomiendaEntrada) => ({ ...p, telefono: p.telefono || null });
    registrar.mutate(
      {
        remitente: sinTelefonoVacio(remitente),
        destinatario: sinTelefonoVacio(destinatario),
        terminal_origen_id: datos.terminal_origen_id,
        terminal_destino_id: datos.terminal_destino_id,
        descripcion: datos.descripcion,
        peso_kg: Number(datos.peso_kg),
        costo: Number(datos.costo),
      },
      {
        onSuccess: (encomienda) => {
          setRegistrada(encomienda);
          setRemitente(PERSONA_VACIA);
          setDestinatario(PERSONA_VACIA);
          setDatos(VACIO);
          setAceptaCondiciones(false);
        },
      },
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="text-lg font-semibold">Registrar encomienda</h2>

      {registrada && (
        <p role="status" className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">
          Cobrado {formatearBs(registrada.costo)} en efectivo. Código de seguimiento:{' '}
          <strong className="font-mono">{registrada.codigo_seguimiento}</strong>
        </p>
      )}

      <DatosPersona titulo="Remitente (paga el envío)" valor={remitente} alCambiar={setRemitente} />
      <DatosPersona titulo="Destinatario" valor={destinatario} alCambiar={setDestinatario} />

      <div className="grid gap-2 sm:grid-cols-2">
        <CampoSeleccion
          etiqueta="Terminal de origen"
          opciones={opciones}
          textoVacio="Elige la terminal"
          value={datos.terminal_origen_id}
          onChange={(e) => setDatos({ ...datos, terminal_origen_id: e.target.value })}
          required
        />
        <CampoSeleccion
          etiqueta="Terminal de destino"
          opciones={opciones}
          textoVacio="Elige la terminal"
          value={datos.terminal_destino_id}
          onChange={(e) => setDatos({ ...datos, terminal_destino_id: e.target.value })}
          required
        />
        <Campo
          etiqueta="Contenido"
          placeholder="Ej. Caja con repuestos"
          value={datos.descripcion}
          onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <Campo
            etiqueta="Peso (kg)"
            type="number"
            min="0.01"
            max="50"
            step="0.01"
            value={datos.peso_kg}
            onChange={(e) => setDatos({ ...datos, peso_kg: e.target.value })}
            required
          />
          <Campo
            etiqueta="Costo (Bs)"
            type="number"
            min="0.01"
            step="0.01"
            value={datos.costo}
            onChange={(e) => setDatos({ ...datos, costo: e.target.value })}
            required
          />
        </div>
      </div>

      <CampoCasilla checked={aceptaCondiciones} onChange={(e) => setAceptaCondiciones(e.target.checked)} required>
        El remitente aceptó los{' '}
        <Link href="/terminos" target="_blank" rel="noopener" className="text-blue-700 underline">
          Términos y Condiciones<span className="sr-only"> (se abre en otra pestaña)</span>
        </Link>{' '}
        y fue informado de la{' '}
        <Link href="/privacidad" target="_blank" rel="noopener" className="text-blue-700 underline">
          Política de Privacidad<span className="sr-only"> (se abre en otra pestaña)</span>
        </Link>
        .
      </CampoCasilla>

      {registrar.error && (
        <p role="alert" className="text-red-600">
          {registrar.error.message}
        </p>
      )}
      <Boton type="submit" cargando={registrar.isPending}>
        Registrar y cobrar en efectivo
      </Boton>
    </form>
  );
}
