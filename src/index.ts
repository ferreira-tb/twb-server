import express from 'express';
import * as database from './db/db.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.get('/api', (_request, response) => response.send('Conectado!'));

app.get('/api/interface/get_conquer', async (_request, response) => {
    const { getConquer } = await import('./interface/get_conquer.js');
    const conquests = await getConquer('116', 60 * 20);
    response.send(conquests);
});

app.listen(port, () => console.log(`Conectado à porta ${port}.`));

database.start();