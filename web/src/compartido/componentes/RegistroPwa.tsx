'use client';

import { useEffect } from 'react';

/**
 * Registra el service worker de la PWA (public/sw.js). Solo en produccion: en desarrollo
 * guardaria archivos viejos y confundiria al programar.
 */
export function RegistroPwa() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      // sin service worker el portal funciona igual; solo no se puede instalar
    });
  }, []);
  return null;
}
