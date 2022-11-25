import config from '../config.json' assert { type: 'json' };
import express from 'express';
import { deployGetters } from './api/index.js';
import { updateAllDatabases } from './db/db.js';

export const app = express();

// Retorna uma array com os mundos disponíveis no banco de dados.
app.get('/api/worlds', (_request, response) => response.send(config.worlds));

deployGetters();

// Conecta à porta.
const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Conectado à porta ${port}.`));

// Atualiza o banco de dados.
updateAllDatabases();