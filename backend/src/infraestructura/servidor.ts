import express from 'express';
import type { Express } from 'express';
import { manejadorErrores } from '../compartido/adaptadores/http/manejadorErrores';

export function crearServidor(): Express {
  const app = express();

  app.use(express.json());

  app.get('/salud', (_req, res) => {
    res.json({ estado: 'ok' });
  });

  // aqui se registran las rutas de cada modulo:
  // app.use(busRutas(registrarBus));

  app.use(manejadorErrores);

  return app;
}
