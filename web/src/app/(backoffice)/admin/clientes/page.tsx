import type { Metadata } from 'next';
import { FormularioCliente } from '@/modulos/clientes/componentes/FormularioCliente';
import { TablaClientes } from '@/modulos/clientes/componentes/TablaClientes';

export const metadata: Metadata = {
  title: 'Clientes',
};

/**
 * PAGINA /admin/clientes: solo arma la pantalla con los componentes del modulo.
 */
export default function PaginaClientes() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaClientes />
        </div>
        <FormularioCliente />
      </div>
    </section>
  );
}
