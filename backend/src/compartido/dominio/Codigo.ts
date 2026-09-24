/**
 * CODIGOS VISIBLES: los que el cliente lee o dicta (venta, pasaje, encomienda).
 *
 * Se generan al azar con letras y numeros que no se confunden al leerlos
 * (sin 0/O, 1/I/L). Con 8 caracteres hay mas de un billon de combinaciones,
 * asi que no se pueden adivinar; la base igual exige que sean unicos.
 */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generarCodigo(prefijo: string, longitud = 8): string {
  const azar = crypto.getRandomValues(new Uint8Array(longitud));
  const cuerpo = Array.from(azar, (byte) => ALFABETO[byte % ALFABETO.length]).join('');
  return `${prefijo}-${cuerpo}`;
}

/** oculta un documento para mostrarlo en paginas publicas: 4827351-1A -> ****351-1A */
export function enmascararDocumento(numero: string): string {
  const [base = '', complemento] = numero.split('-');
  const visible = base.slice(-3);
  const oculto = '*'.repeat(Math.max(0, base.length - 3));
  return complemento ? `${oculto}${visible}-${complemento}` : `${oculto}${visible}`;
}
