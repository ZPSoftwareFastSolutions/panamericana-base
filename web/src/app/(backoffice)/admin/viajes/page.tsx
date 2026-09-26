import type { Metadata } from 'next';
import { FormularioViaje } from '@/modulos/viajes/componentes/FormularioViaje';
import { TablaViajes } from '@/modulos/viajes/componentes/TablaViajes';

export const metadata: Metadata = {
  title: 'Viajes',
};

/** PAGINA /admin/viajes: programacion de viajes con sus tarifas */
export default function PaginaViajes() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Viajes</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaViajes />
        </div>
        <FormularioViaje />
      </div>
    </section>
  );
}
