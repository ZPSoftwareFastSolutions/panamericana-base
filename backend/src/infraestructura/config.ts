import 'dotenv/config';

function requerido(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisa el archivo .env`);
  }
  return valor;
}

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean),
  DATABASE_URL: requerido('DATABASE_URL'),
  MINUTOS_RESERVA_ASIENTO: Number(process.env.MINUTOS_RESERVA_ASIENTO ?? 10),
};
