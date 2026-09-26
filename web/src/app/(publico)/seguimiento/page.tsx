import type { Metadata } from 'next';
import { ConsultaPorCodigo } from '@/compartido/componentes/ConsultaPorCodigo';

export const metadata: Metadata = {
  title: 'Seguimiento de encomiendas',
};

/** PAGINA /seguimiento: consultar una encomienda con su codigo */
export default function PaginaConsultaSeguimiento() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Seguimiento de encomiendas</h1>
      <p className="text-slate-600">Escribe el código de seguimiento (empieza con E-) que te dieron al enviarla.</p>
      <ConsultaPorCodigo etiqueta="Código de seguimiento" ejemplo="E-XXXXXXXX" ruta="/seguimiento" />
    </section>
  );
}
