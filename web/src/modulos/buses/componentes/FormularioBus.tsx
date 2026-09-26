'use client';

import { useState } from 'react';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { useRegistrarBus } from '../hooks/useRegistrarBus';

const VALORES_INICIALES = { placa: '', marca: '', modelo: '', numero_pisos: 1 };

/** formulario para registrar un bus; la placa boliviana (1234ABC) la valida la API */
export function FormularioBus() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const registrar = useRegistrarBus();

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    registrar.mutate(valores, {
      onSuccess: () => setValores(VALORES_INICIALES),
    });
  }

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="font-semibold">Registrar bus</h2>

      <Campo
        etiqueta="Placa"
        placeholder="Ej. 2045KLP"
        autoComplete="off"
        value={valores.placa}
        onChange={(e) => setValores({ ...valores, placa: e.target.value })}
        required
      />
      <Campo
        etiqueta="Marca"
        placeholder="Ej. Volvo"
        value={valores.marca}
        onChange={(e) => setValores({ ...valores, marca: e.target.value })}
        required
      />
      <Campo
        etiqueta="Modelo"
        placeholder="Ej. B420R"
        value={valores.modelo}
        onChange={(e) => setValores({ ...valores, modelo: e.target.value })}
        required
      />
      <CampoSeleccion
        etiqueta="Pisos"
        opciones={[
          { valor: '1', texto: '1 piso' },
          { valor: '2', texto: '2 pisos' },
        ]}
        value={String(valores.numero_pisos)}
        onChange={(e) => setValores({ ...valores, numero_pisos: Number(e.target.value) })}
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
