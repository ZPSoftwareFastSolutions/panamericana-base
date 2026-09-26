/**
 * REGRESION LINEAL MULTIPLE por minimos cuadrados (aprendizaje supervisado).
 *
 * Busca los coeficientes b que hacen minima la suma de (y - X·b)². La solucion es el sistema
 * de ecuaciones normales (XᵀX + λI)·b = Xᵀy, que se resuelve con eliminacion de Gauss.
 * λ es muy chico: solo estabiliza el calculo si dos columnas se parecen demasiado.
 */

/** resuelve A·x = b con eliminacion de Gauss y pivoteo parcial */
export function resolverSistema(A: number[][], b: number[]): number[] {
  const n = b.length;
  const m = A.map((fila, i) => [...fila, b[i]!]);
  for (let col = 0; col < n; col++) {
    let pivote = col;
    for (let fila = col + 1; fila < n; fila++) {
      if (Math.abs(m[fila]![col]!) > Math.abs(m[pivote]![col]!)) pivote = fila;
    }
    if (Math.abs(m[pivote]![col]!) < 1e-12) throw new Error('El sistema no tiene solución única');
    [m[col], m[pivote]] = [m[pivote]!, m[col]!];
    for (let fila = 0; fila < n; fila++) {
      if (fila === col) continue;
      const factor = m[fila]![col]! / m[col]![col]!;
      for (let k = col; k <= n; k++) m[fila]![k]! -= factor * m[col]![k]!;
    }
  }
  return m.map((fila, i) => fila[n]! / fila[i]!);
}

/** entrena: devuelve los coeficientes (el primero es el intercepto si X trae una columna de unos) */
export function ajustar(X: number[][], y: number[], lambda = 1e-8): number[] {
  const p = X[0]!.length;
  const XtX = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  const Xty = new Array<number>(p).fill(0);
  X.forEach((fila, r) => {
    for (let i = 0; i < p; i++) {
      Xty[i]! += fila[i]! * y[r]!;
      for (let j = 0; j < p; j++) XtX[i]![j]! += fila[i]! * fila[j]!;
    }
  });
  for (let i = 1; i < p; i++) XtX[i]![i]! += lambda;
  return resolverSistema(XtX, Xty);
}

export function predecir(coeficientes: number[], x: number[]): number {
  return x.reduce((suma, valor, i) => suma + valor * coeficientes[i]!, 0);
}

/** MAE (error absoluto medio), RMSE (raiz del error cuadratico medio) y R² (varianza explicada) */
export function metricas(reales: number[], estimados: number[]): { mae: number; rmse: number; r2: number } {
  const n = reales.length;
  const media = reales.reduce((a, b) => a + b, 0) / n;
  let absoluto = 0;
  let cuadrado = 0;
  let total = 0;
  reales.forEach((real, i) => {
    const error = real - estimados[i]!;
    absoluto += Math.abs(error);
    cuadrado += error * error;
    total += (real - media) ** 2;
  });
  return { mae: absoluto / n, rmse: Math.sqrt(cuadrado / n), r2: total === 0 ? 0 : 1 - cuadrado / total };
}
