type PuntoDelTramo = { orden: number; terminal: string; ciudad: string; hora: string };

/** un pasaje con todo lo que se imprime en el boleto */
export type PasajeDetalle = {
  codigo: string;
  estado: string;
  precio: number;
  venta: { codigo: string; canal: string };
  asiento: { numero: number; piso: number; tipo: string };
  tipo_pasajero: { codigo: string; nombre: string; requisito: string | null };
  pasajero: { tipo_documento: string; numero_documento: string; nombres: string; apellidos: string };
  viaje: {
    id: string;
    ruta: { id: string; nombre: string };
    bus: { id: string; placa: string };
    fecha_salida: string;
    origen: PuntoDelTramo;
    destino: PuntoDelTramo;
  };
};

/** lo que el modulo necesita de la base para consultar y anular pasajes */
export interface PasajeRepositorio {
  buscarPorCodigo(codigo: string): Promise<PasajeDetalle | null>;

  /**
   * anula en UNA transaccion: el pasaje pasa a anulado (el asiento queda libre), se registra
   * el reembolso y la venta queda anulada si ya no le queda nada activo.
   * Devuelve false si el pasaje ya no estaba pagado (otra persona lo anulo primero).
   */
  anular(codigo: string, referencia: string): Promise<boolean>;
}
