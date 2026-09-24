import { FormularioRuta } from '@/modulos/rutas/componentes/FormularioRuta';
import { TablaRutas } from '@/modulos/rutas/componentes/TablaRutas';

/** PAGINA /admin/rutas: recorridos con paradas (lo que permite vender tramos) */
export default function PaginaRutas() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Rutas</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaRutas />
        </div>
        <FormularioRuta />
      </div>
    </section>
  );
}
