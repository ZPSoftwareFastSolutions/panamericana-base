'use client';

import { useState } from 'react';
import { useRegistrarBus } from '../hooks/useRegistrarBus';

const VALORES_INICIALES = { placa: '', marca: '', modelo: '', numero_pisos: 1 };

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
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 p-4">
      <h2 className="font-semibold">Registrar bus</h2>

      <input
        className="rounded border border-slate-300 px-3 py-2"
        placeholder="Placa"
        value={valores.placa}
        onChange={(e) => setValores({ ...valores, placa: e.target.value })}
        required
      />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        placeholder="Marca"
        value={valores.marca}
        onChange={(e) => setValores({ ...valores, marca: e.target.value })}
        required
      />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        placeholder="Modelo"
        value={valores.modelo}
        onChange={(e) => setValores({ ...valores, modelo: e.target.value })}
        required
      />
      <select
        className="rounded border border-slate-300 px-3 py-2"
        value={valores.numero_pisos}
        onChange={(e) => setValores({ ...valores, numero_pisos: Number(e.target.value) })}
      >
        <option value={1}>1 piso</option>
        <option value={2}>2 pisos</option>
      </select>

      <button
        type="submit"
        disabled={registrar.isPending}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {registrar.isPending ? 'Guardando...' : 'Registrar'}
      </button>

      {registrar.error && (
        <p role="alert" className="text-red-600">
          {registrar.error.message}
        </p>
      )}
    </form>
  );
}
