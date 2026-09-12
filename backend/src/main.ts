import { config } from './infraestructura/config';
import { crearServidor } from './infraestructura/servidor';

const app = crearServidor();

app.listen(config.PORT, () => {
  console.log(`API Panamericana escuchando en el puerto ${config.PORT}`);
});
