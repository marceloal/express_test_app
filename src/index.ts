import app from './app';
import { connectToDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  try {
    await connectToDatabase();

    app.listen(env.port, () => {
      console.log(`Servidor ouvindo em http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('[startup] Aplicacao encerrada devido a erro de inicializacao.');
    process.exit(1);
  }
}

void bootstrap();
