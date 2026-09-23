'use client';

import { useState } from 'react';
import type { RegistrarClienteEntrada, TipoDocumento } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { hoyEnBolivia } from '@/compartido/utilidades/fechas';
import { useTiposDocumento } from '@/modulos/catalogos/hooks/useCatalogos';
import { useRegistrarCliente } from '../hooks/useRegistrarCliente';

// en el formulario todo es texto; al enviar, los campos opcionales vacios se mandan como null
const VALORES_INICIALES = {
  tipo_documento: 'ci',
  numero_documento: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  correo: '',
  fecha_nacimiento: '',
};

type ValoresFormulario = typeof VALORES_INICIALES;

function aEntrada(valores: ValoresFormulario): RegistrarClienteEntrada {
  return {
    tipo_documento: valores.tipo_documento as TipoDocumento,
    numero_documento: valores.numero_documento,
    nombres: valores.nombres,
    apellidos: valores.apellidos,
    telefono: valores.telefono || null,
    correo: valores.correo || null,
    fecha_nacimiento: valores.fecha_nacimiento || null,
  };
}

/**
 * formulario para registrar un cliente.
 * Las reglas (CI boliviano, celular de 8 digitos, documento repetido) las valida la API:
 * si algo esta mal, aqui se muestra su mensaje.
 */
export function FormularioCliente() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const tiposDocumento = useTiposDocumento();
  const registrar = useRegistrarCliente();

  function cambiar(campo: keyof ValoresFormulario, valor: string) {
    setValores({ ...valores, [campo]: valor });
  }

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    registrar.mutate(aEntrada(valores), {
      onSuccess: () => setValores(VALORES_INICIALES),
    });
  }

  const opcionesDocumento = (tiposDocumento.data ?? []).map((tipo) => ({
    valor: tipo.codigo,
    texto: tipo.nombre,
  }));

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="font-semibold">Registrar cliente</h2>

      <CampoSeleccion
        etiqueta="Tipo de documento"
        opciones={opcionesDocumento}
        value={valores.tipo_documento}
        onChange={(e) => cambiar('tipo_documento', e.target.value)}
        error={tiposDocumento.error ? 'No se pudieron cargar los tipos de documento' : undefined}
        required
      />
      <Campo
        etiqueta="Numero de documento"
        placeholder="Ej. 4827351 o 4827351-1A"
        value={valores.numero_documento}
        onChange={(e) => cambiar('numero_documento', e.target.value)}
        required
      />
      <Campo
        etiqueta="Nombres"
        value={valores.nombres}
        onChange={(e) => cambiar('nombres', e.target.value)}
        required
      />
      <Campo
        etiqueta="Apellidos"
        value={valores.apellidos}
        onChange={(e) => cambiar('apellidos', e.target.value)}
        required
      />
      <Campo
        etiqueta="Celular (opcional)"
        placeholder="Ej. 71234567"
        inputMode="numeric"
        value={valores.telefono}
        onChange={(e) => cambiar('telefono', e.target.value)}
      />
      <Campo
        etiqueta="Correo (opcional)"
        type="email"
        value={valores.correo}
        onChange={(e) => cambiar('correo', e.target.value)}
      />
      <Campo
        etiqueta="Fecha de nacimiento (opcional)"
        type="date"
        max={hoyEnBolivia()}
        // la pagina se genera por adelantado: el "hoy" del navegador puede ser otro dia
        suppressHydrationWarning
        value={valores.fecha_nacimiento}
        onChange={(e) => cambiar('fecha_nacimiento', e.target.value)}
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
