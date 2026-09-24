'use client';

import { useEffect, useState } from 'react';

/**
 * CUENTA REGRESIVA hasta una fecha (por ejemplo, el fin de la reserva de un asiento).
 * Muestra mm:ss y avisa una sola vez cuando llega a cero.
 */
export function CuentaRegresiva({ hasta, alTerminar }: { hasta: string; alTerminar?: () => void }) {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const limite = new Date(hasta).getTime();
    let avisado = false;

    function actualizar() {
      const segundos = Math.max(0, Math.round((limite - Date.now()) / 1000));
      setRestante(segundos);
      if (segundos === 0 && !avisado) {
        avisado = true;
        alTerminar?.();
      }
    }

    const intervalo = setInterval(actualizar, 1000);
    const primero = setTimeout(actualizar, 0);
    return () => {
      clearInterval(intervalo);
      clearTimeout(primero);
    };
  }, [hasta, alTerminar]);

  if (restante === null) return <span className="font-mono">--:--</span>;
  const minutos = String(Math.floor(restante / 60)).padStart(2, '0');
  const segundos = String(restante % 60).padStart(2, '0');
  return (
    <span className={`font-mono font-semibold ${restante < 60 ? 'text-red-600' : ''}`} role="timer">
      {minutos}:{segundos}
    </span>
  );
}
