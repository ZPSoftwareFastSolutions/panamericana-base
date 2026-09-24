import Link from 'next/link';

/**
 * Layout del PORTAL PUBLICO (clientes): cabecera y pie comunes.
 * Las paginas publicas se crean dentro de app/(publico)/.
 * El parentesis no cambia la URL: app/(publico)/page.tsx es la direccion "/".
 */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-slate-900 text-white print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold">
            Panamericana
          </Link>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link href="/boleto" className="hover:text-white">
              Mi boleto
            </Link>
            <Link href="/seguimiento" className="hover:text-white">
              Encomiendas
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© 2026 Panamericana · La Paz, Bolivia</p>
          <Link href="/login" className="hover:underline">
            Acceso del personal
          </Link>
        </div>
      </footer>
    </div>
  );
}
