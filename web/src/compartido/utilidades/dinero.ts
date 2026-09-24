/** montos en bolivianos: 47.5 -> "Bs 47,50" */
export function formatearBs(monto: number): string {
  return `Bs ${new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto)}`;
}
