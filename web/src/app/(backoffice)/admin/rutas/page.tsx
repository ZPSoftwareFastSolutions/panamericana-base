import type { Metadata } from 'next';
import { FormularioRuta } from '@/modulos/rutas/componentes/FormularioRuta';
import { TablaRutas } from '@/modulos/rutas/componentes/TablaRutas';

export const metadata: Metadata = {
  title: 'Rutas',
};

/** PAGINA /admin/rutas: recorridos con paradas (lo que permite vender tramos) */
export default function PaginaRutas() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Rutas</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaRutas />
        </div>
        <FormularioRuta />
      </div>
    </section>
  );
}
