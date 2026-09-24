'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo } from '@/compartido/componentes/Campo';

type Propiedades = {
  etiqueta: string;
  ejemplo: string;
  /** pagina a la que se va con el codigo escrito: "/boleto" lleva a /boleto/<codigo> */
  ruta: string;
};

/** formulario de una linea para consultar algo por su codigo (boleto o encomienda) */
export function ConsultaPorCodigo({ etiqueta, ejemplo, ruta }: Propiedades) {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(evento) => {
        evento.preventDefault();
        const limpio = codigo.trim().toUpperCase();
        if (limpio) router.push(`${ruta}/${encodeURIComponent(limpio)}`);
      }}
    >
      <Campo etiqueta={etiqueta} placeholder={ejemplo} value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
      <Boton type="submit">Consultar</Boton>
    </form>
  );
}
