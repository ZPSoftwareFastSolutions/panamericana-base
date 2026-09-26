import Link from 'next/link';
import { DatoDelNegocio } from '@/compartido/componentes/DatoDelNegocio';
import { DOCUMENTOS_LEGALES } from '@/modulos/legal/documentos';

/**
 * Layout del PORTAL PUBLICO (clientes): cabecera y pie comunes.
 * Las paginas publicas se crean dentro de app/(publico)/.
 * El parentesis no cambia la URL: app/(publico)/page.tsx es la direccion "/".
 * El pie lleva los datos del operador y los documentos legales en todas las paginas.
 */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-slate-900 text-white print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="py-2 text-lg font-bold">
            Panamericana
          </Link>
          <nav aria-label="Principal">
            <ul className="flex gap-2 text-sm text-slate-200">
              <li>
                <Link href="/boleto" className="inline-block rounded px-2 py-2 hover:bg-slate-800 hover:text-white">
                  Mi boleto
                </Link>
              </li>
              <li>
                <Link href="/seguimiento" className="inline-block rounded px-2 py-2 hover:bg-slate-800 hover:text-white">
                  Encomiendas
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 text-sm text-slate-600">
          <nav aria-label="Documentos legales">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {DOCUMENTOS_LEGALES.map((documento) => (
                <li key={documento.ruta}>
                  <Link href={documento.ruta} className="inline-block py-1 text-slate-700 underline hover:text-slate-900">
                    {documento.titulo}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="inline-block py-1 text-slate-700 underline hover:text-slate-900">
                  Acceso del personal
                </Link>
              </li>
            </ul>
          </nav>
          <address className="flex flex-col gap-1 not-italic">
            <span>
              © 2026 <DatoDelNegocio dato="razon_social" /> · NIT <DatoDelNegocio dato="nit" />
            </span>
            <span>
              <DatoDelNegocio dato="direccion" />, <DatoDelNegocio dato="ciudad" /> · Tel. <DatoDelNegocio dato="telefono" /> ·{' '}
              <DatoDelNegocio dato="correo" />
            </span>
            <span>
              Operador de transporte interdepartamental · Autorización ATT <DatoDelNegocio dato="autorizacion_att" />
            </span>
          </address>
        </div>
      </footer>
    </div>
  );
}
