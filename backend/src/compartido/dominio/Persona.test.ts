import { describe, expect, it } from 'vitest';
import { crearPersona, normalizarDocumento } from './Persona';
import { DatoObligatorioError } from './erroresComunes';
import {
  CorreoInvalidoError,
  DocumentoInvalidoError,
  FechaNacimientoInvalidaError,
  TelefonoInvalidoError,
  TipoDocumentoInvalidoError,
} from './erroresPersona';

const HOY = new Date('2026-09-23T12:00:00Z');

const datosValidos = {
  tipo_documento: 'ci',
  numero_documento: '4827351',
  nombres: 'Maria',
  apellidos: 'Flores',
  telefono: '71234567',
};

describe('crearPersona', () => {
  it('limpia los datos: espacios, mayusculas del complemento y celular', () => {
    const persona = crearPersona(
      {
        tipo_documento: ' CI ',
        numero_documento: ' 4827351-1a ',
        nombres: '  Maria   Luisa ',
        apellidos: 'Flores',
        telefono: '712-34567',
        correo: ' Maria@Correo.BO ',
      },
      HOY,
    );

    expect(persona).toEqual({
      tipo_documento: 'ci',
      numero_documento: '4827351-1A',
      nombres: 'Maria Luisa',
      apellidos: 'Flores',
      telefono: '71234567',
      correo: 'maria@correo.bo',
      fecha_nacimiento: null,
    });
  });

  it('acepta los campos opcionales vacios como null', () => {
    const persona = crearPersona({ ...datosValidos, telefono: '', correo: null }, HOY);

    expect(persona.telefono).toBeNull();
    expect(persona.correo).toBeNull();
  });

  it('rechaza un tipo de documento que no existe en Bolivia', () => {
    expect(() => crearPersona({ ...datosValidos, tipo_documento: 'dni' }, HOY)).toThrow(
      TipoDocumentoInvalidoError,
    );
  });

  it('rechaza un ci con letras o con menos de 5 dígitos', () => {
    expect(() => crearPersona({ ...datosValidos, numero_documento: 'ABC123' }, HOY)).toThrow(
      DocumentoInvalidoError,
    );
    expect(() => crearPersona({ ...datosValidos, numero_documento: '1234' }, HOY)).toThrow(
      DocumentoInvalidoError,
    );
  });

  it('acepta un pasaporte alfanumerico', () => {
    const persona = crearPersona(
      { ...datosValidos, tipo_documento: 'pasaporte', numero_documento: 'ab123456' },
      HOY,
    );

    expect(persona.numero_documento).toBe('AB123456');
  });

  it('rechaza un celular que no es boliviano', () => {
    expect(() => crearPersona({ ...datosValidos, telefono: '12345678' }, HOY)).toThrow(
      TelefonoInvalidoError,
    );
  });

  it('rechaza un correo sin formato', () => {
    expect(() => crearPersona({ ...datosValidos, correo: 'maria.correo.bo' }, HOY)).toThrow(
      CorreoInvalidoError,
    );
  });

  it('rechaza nombres vacios', () => {
    expect(() => crearPersona({ ...datosValidos, nombres: '   ' }, HOY)).toThrow(
      DatoObligatorioError,
    );
  });

  it('rechaza una fecha de nacimiento futura', () => {
    expect(() => crearPersona({ ...datosValidos, fecha_nacimiento: '2030-01-01' }, HOY)).toThrow(
      FechaNacimientoInvalidaError,
    );
  });
});

describe('normalizarDocumento', () => {
  it('sirve para buscar: el mismo documento escrito distinto queda igual', () => {
    expect(normalizarDocumento('ci', ' 4827351-1a')).toEqual({
      tipo_documento: 'ci',
      numero_documento: '4827351-1A',
    });
  });
});
