import type { Metadata } from 'next';
import { ConsultaPorCodigo } from '@/compartido/componentes/ConsultaPorCodigo';

export const metadata: Metadata = {
  title: 'Mi boleto',
};

/** PAGINA /boleto: consultar un pasaje con su codigo */
export default function PaginaConsultaBoleto() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Mi boleto</h1>
      <p className="text-slate-600">Escribe el código de tu pasaje (empieza con P-) para ver e imprimir tu boleto.</p>
      <ConsultaPorCodigo etiqueta="Código del pasaje" ejemplo="P-XXXXXXXX" ruta="/boleto" />
    </section>
  );
}
