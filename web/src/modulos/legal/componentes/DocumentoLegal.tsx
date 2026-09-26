import Link from 'next/link';
import { DatoDelNegocio } from '@/compartido/componentes/DatoDelNegocio';
import { formatearFecha } from '@/compartido/utilidades/fechas';
import { DOCUMENTOS_LEGALES, documentoLegal } from '../documentos';
import type { RutaLegal } from '../documentos';

/**
 * MOLDE de los documentos legales: titulo, fecha de actualizacion, el texto y los enlaces
 * a los demas documentos. Los parrafos, listas y enlaces del texto toman el estilo de aqui.
 */
export function DocumentoLegal({ ruta, children }: { ruta: RutaLegal; children: React.ReactNode }) {
  const documento = documentoLegal(ruta);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 leading-relaxed text-slate-800">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{documento.titulo}</h1>
      <p className="text-sm text-slate-600">Última actualización: {formatearFecha(documento.actualizado)}</p>

      <div className="flex flex-col [&_a]:text-blue-700 [&_a]:underline [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>

      <nav aria-label="Otros documentos legales" className="mt-10 border-t border-slate-200 pt-4 text-sm">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {DOCUMENTOS_LEGALES.filter((d) => d.ruta !== ruta).map((d) => (
            <li key={d.ruta}>
              <Link href={d.ruta} className="inline-block py-1 text-blue-700 underline">
                {d.titulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}

/** un apartado del documento con su titulo */
export function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
      {children}
    </section>
  );
}

/** quien presta el servicio y como contactarlo (lo usan varios documentos) */
export function DatosDeLaEmpresa() {
  return (
    <ul>
      <li>
        Razón social: <DatoDelNegocio dato="razon_social" /> (nombre comercial: <DatoDelNegocio dato="nombre_comercial" />)
      </li>
      <li>
        NIT: <DatoDelNegocio dato="nit" />
      </li>
      <li>
        Autorización de la ATT como operador de transporte: <DatoDelNegocio dato="autorizacion_att" />
      </li>
      <li>
        Domicilio: <DatoDelNegocio dato="direccion" />, <DatoDelNegocio dato="ciudad" />
      </li>
      <li>
        Teléfono: <DatoDelNegocio dato="telefono" />
      </li>
      <li>
        Correo: <DatoDelNegocio dato="correo" />
      </li>
    </ul>
  );
}
