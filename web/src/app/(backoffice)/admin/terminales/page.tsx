import type { Metadata } from 'next';
import { FormularioTerminal } from '@/modulos/terminales/componentes/FormularioTerminal';
import { TablaTerminales } from '@/modulos/terminales/componentes/TablaTerminales';

export const metadata: Metadata = {
  title: 'Terminales',
};

/**
 * PAGINA /admin/terminales: solo arma la pantalla con los componentes del modulo.
 * No pide datos ni llama a la API: de eso se encargan los hooks y los servicios.
 */
export default function PaginaTerminales() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Terminales</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaTerminales />
        </div>
        <FormularioTerminal />
      </div>
    </section>
  );
}
