import express from 'express';
import * as fs from 'node:fs/promises';

const app = express();
const port = process.env.PORT ?? 3000;

app.get('/api', (_request, response) => response.send('Conectado!'));

app.get('/api/files/village', async (_request, response) => {
    const village = await fs.readFile('dist/village.txt', { encoding: 'utf-8' });
    response.send(village);
});

app.listen(port, () => console.log(`Conectado à porta ${port}`));