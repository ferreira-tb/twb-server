import express from 'express';
import config from '../config.json' assert { type: 'json' };
import { updateAllDatabases } from './db/db.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.get('/api', (_request, response) => response.send('Conectado!'));

// Interface ("/api/interface/:world/").
app.get('/api/interface/:world/get_conquer', async (request, response) => {
    const world = request.params.world;
    if (!config.worlds.includes(world)) return;

    const { getConquer } = await import('./interface/get_conquer.js');
    const conquests = await getConquer(world, 60 * 20);
    response.send(conquests);
});

// Banco de dados ("/api/query/:world/").
const playerQuery = '/api/query/:world/player/:id(\\d+)';
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

// Tribal Wars ("/api/game/:world/").
app.get('/api/game/:world/player/:id(\\d+)/profile', async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) return;

    const { getPlayerProfilePage } = await import('./game/profile.js');
    const targetPage = await getPlayerProfilePage(world, id);
    response.send(targetPage);
});

app.listen(port, () => console.log(`Conectado à porta ${port}.`));

updateAllDatabases();