import { describe, expect, it } from 'vitest';
import { DocumentoInvalidoError } from '../../../compartido/dominio/erroresPersona';
import type { EncomiendaNueva, EstadoEncomienda } from '../dominio/Encomienda';
import type { CambioDeEstado, EncomiendaDetalle, EncomiendaRepositorio } from '../dominio/EncomiendaRepositorio';
import {
  EncomiendaInvalidaError,
  EstadoCambiadoError,
  TerminalNoValidaError,
  TransicionInvalidaError,
  ViajeNoSirveError,
} from '../dominio/errores';
import { CambiarEstadoEncomienda } from './CambiarEstadoEncomienda';
import { RegistrarEncomienda } from './RegistrarEncomienda';
import { SeguirEncomienda } from './SeguirEncomienda';

const AHORA = new Date('2026-09-30T12:00:00Z');
const LA_PAZ = 'terminal-la-paz';
const ORURO = 'terminal-oruro';
const USUARIO = 'usuario-1';

/** repositorio falso: guarda en memoria y arma el detalle como la base */
class EncomiendasEnMemoria implements EncomiendaRepositorio {
  guardadas: EncomiendaNueva[] = [];
  historial = new Map<string, { estado: EstadoEncomienda; observacion: string | null }[]>();
  cambios: CambioDeEstado[] = [];
  viajes = new Set(['viaje-que-sirve']);
  /** simula que otra persona cambio el estado justo antes */
  otroCambioElEstado = false;

  async terminalesActivas(ids: string[]) {
    return ids.filter((id) => [LA_PAZ, ORURO].includes(id));
  }
  async guardar(encomienda: EncomiendaNueva) {
    this.guardadas.push(encomienda);
    this.historial.set(encomienda.id, [{ estado: 'registrada', observacion: null }]);
  }
  async listar() {
    return [];
  }
  async buscarPorCodigo(codigo: string): Promise<EncomiendaDetalle | null> {
    const e = this.guardadas.find((g) => g.codigo_seguimiento === codigo);
    if (!e) return null;
    const historial = this.historial.get(e.id)!;
    const persona = (p: EncomiendaNueva['remitente']) => ({ ...p });
    return {
      id: e.id,
      codigo_seguimiento: e.codigo_seguimiento,
      estado: historial.at(-1)!.estado,
      descripcion: e.descripcion,
      peso_kg: e.peso_kg,
      costo: e.costo,
      remitente: persona(e.remitente),
      destinatario: persona(e.destinatario),
      terminal_origen: { id: e.terminal_origen_id, nombre: 'Origen', ciudad: 'La Paz' },
      terminal_destino: { id: e.terminal_destino_id, nombre: 'Destino', ciudad: 'Oruro' },
      viaje: null,
      venta: { codigo: e.venta.codigo },
      creado_en: AHORA.toISOString(),
      historial: historial.map((h) => ({ ...h, fecha: AHORA.toISOString(), usuario: 'Ana Quispe' })),
    };
  }
  async viajeSirve(viaje_id: string) {
    return this.viajes.has(viaje_id);
  }
  async registrarCambio(cambio: CambioDeEstado) {
    if (this.otroCambioElEstado) return false;
    this.cambios.push(cambio);
    this.historial.get(cambio.encomienda_id)!.push({ estado: cambio.estado_nuevo, observacion: cambio.observacion });
    return true;
  }
}

const persona = (numero_documento: string) => ({
  tipo_documento: 'ci',
  numero_documento,
  nombres: 'Rosa',
  apellidos: 'Mamani',
  telefono: '71234567',
});

const envio = {
  remitente: persona('4827351'),
  destinatario: persona('6093184'),
  terminal_origen_id: LA_PAZ,
  terminal_destino_id: ORURO,
  descripcion: '  Caja   con repuestos ',
  peso_kg: 4.5,
  costo: 25,
};

function crear() {
  const repositorio = new EncomiendasEnMemoria();
  return {
    repositorio,
    registrar: new RegistrarEncomienda(repositorio, () => AHORA),
    cambiar: new CambiarEstadoEncomienda(repositorio),
  };
}

describe('RegistrarEncomienda', () => {
  it('registra y cobra: código E-, venta V-, descripción limpia y estado registrada', async () => {
    const { registrar } = crear();

    const encomienda = await registrar.ejecutar(envio, USUARIO);

    expect(encomienda.codigo_seguimiento).toMatch(/^E-[A-Z2-9]{8}$/);
    expect(encomienda.venta?.codigo).toMatch(/^V-/);
    expect(encomienda.descripcion).toBe('Caja con repuestos');
    expect(encomienda.estado).toBe('registrada');
    expect(encomienda.siguientes).toEqual(['en_transito', 'cancelada']);
  });

  it('rechaza la misma terminal de origen y destino, peso fuera de rango y costo con 3 decimales', async () => {
    const { registrar } = crear();

    await expect(registrar.ejecutar({ ...envio, terminal_destino_id: LA_PAZ }, USUARIO)).rejects.toThrow(
      EncomiendaInvalidaError,
    );
    await expect(registrar.ejecutar({ ...envio, peso_kg: 0 }, USUARIO)).rejects.toThrow(EncomiendaInvalidaError);
    await expect(registrar.ejecutar({ ...envio, peso_kg: 51 }, USUARIO)).rejects.toThrow(EncomiendaInvalidaError);
    await expect(registrar.ejecutar({ ...envio, costo: 10.555 }, USUARIO)).rejects.toThrow(EncomiendaInvalidaError);
    await expect(registrar.ejecutar({ ...envio, descripcion: '   ' }, USUARIO)).rejects.toThrow(
      EncomiendaInvalidaError,
    );
  });

  it('aplica las reglas bolivianas de persona y exige terminales activas', async () => {
    const { registrar } = crear();

    await expect(
      registrar.ejecutar({ ...envio, destinatario: persona('ABC') }, USUARIO),
    ).rejects.toThrow(DocumentoInvalidoError);
    await expect(
      registrar.ejecutar({ ...envio, terminal_destino_id: 'terminal-inactiva' }, USUARIO),
    ).rejects.toThrow(TerminalNoValidaError);
  });
});

describe('CambiarEstadoEncomienda', () => {
  it('avanza paso a paso y registra el viaje al despacharla', async () => {
    const { registrar, cambiar, repositorio } = crear();
    const { codigo_seguimiento } = await registrar.ejecutar(envio, USUARIO);

    await cambiar.ejecutar(codigo_seguimiento, { estado: 'en_transito', viaje_id: 'viaje-que-sirve' }, USUARIO);
    await cambiar.ejecutar(codigo_seguimiento, { estado: 'en_destino' }, USUARIO);
    const entregada = await cambiar.ejecutar(
      codigo_seguimiento,
      { estado: 'entregada', observacion: '  Recibio su hermana ' },
      USUARIO,
    );

    expect(entregada.estado).toBe('entregada');
    expect(entregada.historial.map((h) => h.estado)).toEqual(['registrada', 'en_transito', 'en_destino', 'entregada']);
    expect(repositorio.cambios[0]).toMatchObject({ viaje_id: 'viaje-que-sirve', reembolsar: false });
    expect(repositorio.cambios.at(-1)?.observacion).toBe('Recibio su hermana');
  });

  it('no permite saltos ni cambios después de entregada', async () => {
    const { registrar, cambiar } = crear();
    const { codigo_seguimiento } = await registrar.ejecutar(envio, USUARIO);

    await expect(cambiar.ejecutar(codigo_seguimiento, { estado: 'entregada' }, USUARIO)).rejects.toThrow(
      TransicionInvalidaError,
    );
    await cambiar.ejecutar(codigo_seguimiento, { estado: 'en_transito' }, USUARIO);
    await expect(cambiar.ejecutar(codigo_seguimiento, { estado: 'cancelada' }, USUARIO)).rejects.toThrow(
      'puede pasar a en destino',
    );
  });

  it('cancelar antes de salir pide el reembolso', async () => {
    const { registrar, cambiar, repositorio } = crear();
    const { codigo_seguimiento } = await registrar.ejecutar(envio, USUARIO);

    await cambiar.ejecutar(codigo_seguimiento, { estado: 'cancelada' }, USUARIO);

    expect(repositorio.cambios[0]).toMatchObject({ estado_nuevo: 'cancelada', reembolsar: true });
  });

  it('rechaza un viaje que no pasa por las terminales y un viaje fuera del despacho', async () => {
    const { registrar, cambiar } = crear();
    const { codigo_seguimiento } = await registrar.ejecutar(envio, USUARIO);

    await expect(
      cambiar.ejecutar(codigo_seguimiento, { estado: 'en_transito', viaje_id: 'otro-viaje' }, USUARIO),
    ).rejects.toThrow(ViajeNoSirveError);
    await expect(
      cambiar.ejecutar(codigo_seguimiento, { estado: 'cancelada', viaje_id: 'viaje-que-sirve' }, USUARIO),
    ).rejects.toThrow(EncomiendaInvalidaError);
  });

  it('si otra persona cambió el estado mientras tanto, responde estado_cambiado', async () => {
    const { registrar, cambiar, repositorio } = crear();
    const { codigo_seguimiento } = await registrar.ejecutar(envio, USUARIO);
    repositorio.otroCambioElEstado = true;

    await expect(cambiar.ejecutar(codigo_seguimiento, { estado: 'en_transito' }, USUARIO)).rejects.toThrow(
      EstadoCambiadoError,
    );
  });
});

describe('SeguirEncomienda', () => {
  it('el seguimiento público no muestra personas ni observaciones', async () => {
    const { registrar, cambiar, repositorio } = crear();
    const { codigo_seguimiento } = await registrar.ejecutar(envio, USUARIO);
    await cambiar.ejecutar(codigo_seguimiento, { estado: 'en_transito', observacion: 'Con Pedro' }, USUARIO);

    const seguimiento = await new SeguirEncomienda(repositorio).ejecutar(codigo_seguimiento.toLowerCase());

    expect(seguimiento.estado).toBe('en_transito');
    expect(JSON.stringify(seguimiento)).not.toMatch(/Rosa|4827351|Pedro|Ana/);
  });
});
