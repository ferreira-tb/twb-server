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
const playerQuery = '/api/query/:world/player/:id((\\d+))';
app.get(playerQuery, async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) return;

    const { getPlayerInfo } = await import('./db/models/player.js');
    const playerInfo = await getPlayerInfo(world, id);
    response.send(playerInfo);
});

app.get(`${playerQuery}/villages`, async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) return;

    const { getPlayerVillages } = await import('./db/models/village.js');
    const playerVillages = await getPlayerVillages(world, id);
    response.send(playerVillages);
});

app.listen(port, () => console.log(`Conectado à porta ${port}.`));

updateAllDatabases();