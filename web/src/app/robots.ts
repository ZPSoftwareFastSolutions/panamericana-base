import type { MetadataRoute } from 'next';
import { SITIO_URL } from '@/compartido/sitio';

/**
 * robots.txt para los buscadores.
 * Sin dominio oficial todo queda cerrado. Con dominio, se indexa el portal publico pero no
 * el panel ni las paginas con datos personales (compras, boletos y encomiendas por codigo).
 */
export default function robots(): MetadataRoute.Robots {
  if (!SITIO_URL) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/compra/', '/boleto/', '/seguimiento/', '/sin-conexion'],
    },
    sitemap: `${SITIO_URL}/sitemap.xml`,
  };
}
