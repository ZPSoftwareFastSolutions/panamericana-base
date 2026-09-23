import { DatoObligatorioError } from './erroresComunes';
import {
  CorreoInvalidoError,
  DocumentoInvalidoError,
  FechaNacimientoInvalidaError,
  TelefonoInvalidoError,
  TipoDocumentoInvalidoError,
} from './erroresPersona';

/**
 * PERSONA: reglas de los datos personales en Bolivia.
 *
 * En la base de datos una persona se guarda UNA sola vez (tabla personas) y
 * clientes, usuarios y choferes la enlazan con persona_id. Por eso sus reglas
 * viven aqui, en el nucleo compartido, y no se copian en cada modulo.
 */

export const TIPOS_DOCUMENTO = ['ci', 'ce', 'pasaporte'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

/** datos tal como llegan del usuario (sin limpiar) */
export type DatosPersona = {
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  correo?: string | null;
  fecha_nacimiento?: string | null;
};

/** datos ya validados y normalizados: listos para guardarse */
export type Persona = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  fecha_nacimiento: string | null;
};

/** ci: de 5 a 10 digitos con complemento opcional de 2 caracteres (4827351 o 4827351-1A) */
const FORMATO_CI = /^\d{5,10}(-[0-9A-Z]{2})?$/;
/** ce y pasaporte: de 5 a 15 letras o numeros */
const FORMATO_ALFANUMERICO = /^[0-9A-Z]{5,15}$/;
/** celular boliviano: 8 digitos que empiezan con 6 o 7 */
const FORMATO_CELULAR = /^[67]\d{7}$/;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esTipoDocumento(valor: string): valor is TipoDocumento {
  return (TIPOS_DOCUMENTO as readonly string[]).includes(valor);
}

/**
 * valida el tipo y limpia el numero de un documento.
 * Se usa al registrar y tambien al BUSCAR por documento (para que "4827351-1a" encuentre "4827351-1A").
 */
export function normalizarDocumento(
  tipo_documento: string,
  numero_documento: string,
): { tipo_documento: TipoDocumento; numero_documento: string } {
  const tipo = tipo_documento.trim().toLowerCase();
  if (!esTipoDocumento(tipo)) {
    throw new TipoDocumentoInvalidoError(tipo_documento);
  }

  const numero = numero_documento.replace(/\s/g, '').toUpperCase();
  const formato = tipo === 'ci' ? FORMATO_CI : FORMATO_ALFANUMERICO;
  if (!formato.test(numero)) {
    throw new DocumentoInvalidoError(numero_documento);
  }

  return { tipo_documento: tipo, numero_documento: numero };
}

/** celular opcional: vacio = null */
export function normalizarTelefono(telefono?: string | null): string | null {
  const limpio = telefono?.replace(/[\s-]/g, '') ?? '';
  if (limpio === '') return null;
  if (!FORMATO_CELULAR.test(limpio)) {
    throw new TelefonoInvalidoError(telefono ?? '');
  }
  return limpio;
}

/** correo opcional: vacio = null; se guarda en minusculas */
export function normalizarCorreo(correo?: string | null): string | null {
  const limpio = correo?.trim().toLowerCase() ?? '';
  if (limpio === '') return null;
  if (!FORMATO_CORREO.test(limpio)) {
    throw new CorreoInvalidoError(correo ?? '');
  }
  return limpio;
}

function obligatorio(valor: string, campo: string): string {
  const limpio = valor.trim().replace(/\s+/g, ' ');
  if (limpio === '') {
    throw new DatoObligatorioError(campo);
  }
  return limpio;
}

/**
 * valida y normaliza los datos de una persona.
 * @param hoy fecha de referencia (se recibe como parametro para poder probarla)
 */
export function crearPersona(datos: DatosPersona, hoy: Date = new Date()): Persona {
  const documento = normalizarDocumento(datos.tipo_documento, datos.numero_documento);

  const fecha_nacimiento = datos.fecha_nacimiento?.trim() || null;
  // las fechas "AAAA-MM-DD" se comparan como texto sin problemas
  if (fecha_nacimiento && fecha_nacimiento > hoy.toISOString().slice(0, 10)) {
    throw new FechaNacimientoInvalidaError();
  }

  return {
    ...documento,
    nombres: obligatorio(datos.nombres, 'nombres'),
    apellidos: obligatorio(datos.apellidos, 'apellidos'),
    telefono: normalizarTelefono(datos.telefono),
    correo: normalizarCorreo(datos.correo),
    fecha_nacimiento,
  };
}
