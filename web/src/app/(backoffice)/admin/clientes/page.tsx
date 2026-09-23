import { FormularioCliente } from '@/modulos/clientes/componentes/FormularioCliente';
import { TablaClientes } from '@/modulos/clientes/componentes/TablaClientes';

/**
 * PAGINA /admin/clientes: solo arma la pantalla con los componentes del modulo.
 */
export default function PaginaClientes() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaClientes />
        </div>
        <FormularioCliente />
      </div>
    </section>
  );
}
