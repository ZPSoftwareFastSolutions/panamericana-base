'use client';

import { useRouter } from 'next/navigation';
import { useReservar } from '../hooks/useVentas';
import { SeleccionDeAsientos } from './SeleccionDeAsientos';

/**
 * COMPRA EN EL PORTAL, pasos 1 y 2: elegir asientos y pasajeros.
 * Al continuar se RESERVAN los asientos (quedan retenidos unos minutos) y se pasa al pago.
 */
export function CompraDeAsientos({ viajeId, desde, hasta }: { viajeId: string; desde: number; hasta: number }) {
  const router = useRouter();
  const reservar = useReservar();

  return (
    <SeleccionDeAsientos
      viajeId={viajeId}
      desde={desde}
      hasta={hasta}
      textoBoton="Continuar al pago"
      nota="Al continuar, tus asientos quedan reservados por 10 minutos mientras pagas."
      alConfirmar={async (pasajeros) => {
        const venta = await reservar.mutateAsync({ viaje_id: viajeId, orden_origen: desde, orden_destino: hasta, pasajeros });
        router.push(`/compra/${venta.codigo}`);
      }}
    />
  );
}
