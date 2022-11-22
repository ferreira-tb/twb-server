import express from 'express';
import config from '../config.json' assert { type: 'json' };
import { updateAllDatabases } from './db/db.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.get('/api', (_request, response) => response.send('Conectado!'));

// Interface.
app.get('/api/interface/:world/get_conquer', async (request, response) => {
    const world = request.params.world;
    if (!config.worlds.includes(world)) return;

    const { getConquer } = await import('./interface/get_conquer.js');
    const conquests = await getConquer(world, 60 * 20);
    response.send(conquests);
});

// Banco de dados.
/*app.get('/api/query/:world/player/:id((\\d+))', async (request, response) => {
    const world = request.params.world;
    if (!config.worlds.includes(world)) return;

});*/

app.listen(port, () => console.log(`Conectado à porta ${port}.`));

updateAllDatabases();