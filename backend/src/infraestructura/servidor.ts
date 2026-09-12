import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import { RUTAS_API } from '@panamericana/shared';
import { manejadorErrores } from '../compartido/adaptadores/http/manejadorErrores';
import { registrarRutas } from '../rutas';
import { config } from './config';

export function crearServidor(): Express {
  const app = express();

  // permite que la web (otro puerto) llame a esta API
  app.use(cors({ origin: config.ALLOWED_ORIGINS.length > 0 ? config.ALLOWED_ORIGINS : true }));
  app.use(express.json());

  app.get(RUTAS_API.salud, (_req, res) => {
    res.json({ estado: 'ok' });
  });

  registrarRutas(app);

  // el manejador de errores va SIEMPRE al final
  app.use(manejadorErrores);

  return app;
}
