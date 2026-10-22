import dotenv from 'dotenv';
import { buildApp } from './app.js';

dotenv.config();

const app = buildApp();
const PORT = Number(process.env.PORT) || 3333;

async function start() {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Servidor ERP da Distribuidora rodando em http://localhost:${PORT}`);
    console.log(`📋 Rotas da API base: http://localhost:${PORT}/api/v1`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

