import { FormularioEncomienda } from '@/modulos/encomiendas/componentes/FormularioEncomienda';
import { TablaEncomiendas } from '@/modulos/encomiendas/componentes/TablaEncomiendas';

/** PAGINA /admin/encomiendas: registrar, cobrar y dar seguimiento a los envios */
export default function PaginaEncomiendas() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Encomiendas</h1>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaEncomiendas />
        </div>
        <FormularioEncomienda />
      </div>
    </section>
  );
}
