import { FormularioTerminal } from '@/modulos/terminales/componentes/FormularioTerminal';
import { TablaTerminales } from '@/modulos/terminales/componentes/TablaTerminales';

/**
 * PAGINA /admin/terminales: solo arma la pantalla con los componentes del modulo.
 * No pide datos ni llama a la API: de eso se encargan los hooks y los servicios.
 */
export default function PaginaTerminales() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Terminales</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaTerminales />
        </div>
        <FormularioTerminal />
      </div>
    </section>
  );
}
