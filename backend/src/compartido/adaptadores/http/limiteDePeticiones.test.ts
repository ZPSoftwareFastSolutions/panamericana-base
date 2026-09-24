import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it } from 'vitest';
import { DemasiadasPeticionesError, limitarPorIp } from './limiteDePeticiones';

function pedir(limite: ReturnType<typeof limitarPorIp>, ip: string): unknown {
  let resultado: unknown = 'sin llamar';
  const siguiente: NextFunction = (error?: unknown) => {
    resultado = error ?? 'ok';
  };
  limite({ ip } as Request, {} as Response, siguiente);
  return resultado;
}

describe('limitarPorIp', () => {
  it('deja pasar hasta el maximo y despues responde 429', () => {
    const limite = limitarPorIp({ maximo: 2, ventanaMs: 1000, ahora: () => 0 });

    expect(pedir(limite, '1.1.1.1')).toBe('ok');
    expect(pedir(limite, '1.1.1.1')).toBe('ok');
    expect(pedir(limite, '1.1.1.1')).toBeInstanceOf(DemasiadasPeticionesError);
  });

  it('cuenta cada IP por separado', () => {
    const limite = limitarPorIp({ maximo: 1, ventanaMs: 1000, ahora: () => 0 });

    expect(pedir(limite, '1.1.1.1')).toBe('ok');
    expect(pedir(limite, '2.2.2.2')).toBe('ok');
  });

  it('cuando termina la ventana, la IP vuelve a empezar', () => {
    let reloj = 0;
    const limite = limitarPorIp({ maximo: 1, ventanaMs: 1000, ahora: () => reloj });

    expect(pedir(limite, '1.1.1.1')).toBe('ok');
    expect(pedir(limite, '1.1.1.1')).toBeInstanceOf(DemasiadasPeticionesError);
    reloj = 1000;
    expect(pedir(limite, '1.1.1.1')).toBe('ok');
  });
});
