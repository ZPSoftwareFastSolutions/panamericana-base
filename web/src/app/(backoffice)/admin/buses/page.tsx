import type { Metadata } from 'next';
import { FormularioBus } from '@/modulos/buses/componentes/FormularioBus';
import { TablaBuses } from '@/modulos/buses/componentes/TablaBuses';

export const metadata: Metadata = {
  title: 'Buses',
};

/**
 * PAGINA: solo arma la pantalla con los componentes del modulo.
 * No pide datos ni llama a la API: de eso se encargan los hooks y los servicios.
 */
export default function PaginaBuses() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Flota de buses</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaBuses />
        </div>
        <FormularioBus />
      </div>
    </section>
  );
}
