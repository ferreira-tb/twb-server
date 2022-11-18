import express from 'express';
import * as db from './db/db.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.get('/api', (_request, response) => response.send('Conectado!'));

app.listen(port, () => console.log(`Conectado à porta ${port}.`));

db.start();