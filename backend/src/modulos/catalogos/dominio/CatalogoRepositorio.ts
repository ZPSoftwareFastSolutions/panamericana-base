import type { Ciudad, ElementoCatalogo, TipoPasajero } from './Catalogo';

/** lo que el modulo necesita leer; la implementacion con SQL esta en adaptadores/ */
export interface CatalogoRepositorio {
  listarCiudades(): Promise<Ciudad[]>;
  listarTiposDocumento(): Promise<ElementoCatalogo[]>;
  listarRoles(): Promise<ElementoCatalogo[]>;
  listarTiposAsiento(): Promise<ElementoCatalogo[]>;
  listarTiposPasajero(): Promise<TipoPasajero[]>;
}
