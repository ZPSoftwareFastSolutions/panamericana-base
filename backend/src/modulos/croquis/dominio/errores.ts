import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class BusNoEncontradoError extends ErrorDeDominio {
  readonly codigo = 'bus_no_encontrado';
  readonly estadoHttp = 404;

  constructor(id: string) {
    super(`No existe un bus con el id ${id}`);
  }
}

export class CroquisExistenteError extends ErrorDeDominio {
  readonly codigo = 'croquis_existente';
  readonly estadoHttp = 409;

  constructor() {
    super('El bus ya tiene asientos: el croquis estándar solo se genera para un bus sin asientos');
  }
}

export class AsientoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'asiento_invalido';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

export class AsientoDuplicadoError extends ErrorDeDominio {
  readonly codigo = 'asiento_duplicado';
  readonly estadoHttp = 409;

  constructor(motivo = 'Ya existe un asiento con ese número o en esa posición') {
    super(motivo);
  }
}

export class AsientoNoEncontradoError extends ErrorDeDominio {
  readonly codigo = 'asiento_no_encontrado';
  readonly estadoHttp = 404;

  constructor(id: string) {
    super(`El bus no tiene un asiento con el id ${id}`);
  }
}

export class CroquisEnUsoError extends ErrorDeDominio {
  readonly codigo = 'croquis_en_uso';
  readonly estadoHttp = 409;

  constructor(placa: string, tipo: string, viajes: number) {
    super(
      `El bus ${placa} tiene ${viajes} viaje(s) programado(s) sin precio para "${tipo}": ` +
        'ese asiento no se podria vender. Usa un tipo que ya tenga precio',
    );
  }
}
