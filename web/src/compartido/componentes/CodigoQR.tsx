'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * CODIGO QR de un texto (por ejemplo el codigo de un pasaje), dibujado como SVG.
 * El QR solo lleva el codigo: al escanearlo en el bus se consulta el pasaje en la API.
 */
export function CodigoQR({ texto, tamano = 160 }: { texto: string; tamano?: number }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    QRCode.toString(texto, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
      .then((dibujo) => {
        if (vigente) setSvg(dibujo);
      })
      .catch(() => {
        if (vigente) setSvg(null);
      });
    return () => {
      vigente = false;
    };
  }, [texto]);

  if (!svg) return <div style={{ width: tamano, height: tamano }} className="animate-pulse rounded bg-slate-100" />;

  return (
    <div
      role="img"
      aria-label={`Codigo QR de ${texto}`}
      style={{ width: tamano, height: tamano }}
      // el SVG lo genera la libreria a partir del codigo: no contiene datos del usuario
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
