/** roles internos que pueden entrar al panel administrativo */
export type RolInterno = 'administrador' | 'vendedor' | 'encomiendas';

/** el usuario que inicio sesion, tal como lo devuelve GET /v1/sesion */
export type SesionUsuario = {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
  /** codigos del catalogo roles */
  roles: string[];
};
