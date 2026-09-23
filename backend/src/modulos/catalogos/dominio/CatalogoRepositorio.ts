import type { Ciudad, ElementoCatalogo } from './Catalogo';

/** lo que el modulo necesita leer; la implementacion con SQL esta en adaptadores/ */
export interface CatalogoRepositorio {
  listarCiudades(): Promise<Ciudad[]>;
  listarTiposDocumento(): Promise<ElementoCatalogo[]>;
  listarRoles(): Promise<ElementoCatalogo[]>;
}
