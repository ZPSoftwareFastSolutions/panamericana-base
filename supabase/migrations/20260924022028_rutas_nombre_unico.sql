-- el nombre de una ruta es unico sin distinguir mayusculas: la base lo garantiza aunque
-- dos personas registren la misma ruta al mismo tiempo
create unique index rutas_nombre_unico on rutas (lower(nombre));
