import type { Metadata } from 'next';
import { PanelIndicadores } from '@/modulos/panel/componentes/PanelIndicadores';
import { PrediccionDemanda } from '@/modulos/panel/componentes/PrediccionDemanda';

export const metadata: Metadata = {
  title: 'Panel de indicadores',
};

/** PAGINA /admin/panel: indicadores del negocio y demanda estimada (solo administradora) */
export default function PaginaPanel() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Panel de indicadores</h1>
      <PrediccionDemanda />
      <PanelIndicadores />
    </section>
  );
}
