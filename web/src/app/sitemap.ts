import type { MetadataRoute } from 'next';
import { SITIO_URL } from '@/compartido/sitio';
import { DOCUMENTOS_LEGALES } from '@/modulos/legal/documentos';

/** mapa del sitio: solo las paginas publicas sin datos personales (vacio sin dominio oficial) */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITIO_URL) return [];
  const paginas = ['/', '/boleto', '/seguimiento', ...DOCUMENTOS_LEGALES.map((d) => d.ruta)];
  return paginas.map((ruta) => ({ url: `${SITIO_URL}${ruta}` }));
}
