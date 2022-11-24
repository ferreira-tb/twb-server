import config from '../config.json' assert { type: 'json' };
import express from 'express';
import { updateAllDatabases } from './db/db.js';

const app = express();

app.get('/api', (_request, response) => response.send('Conectado!'));

// Retorna uma array com os mundos disponíveis no banco de dados.
app.get('/api/worlds', (_request, response) => response.send(config.worlds));

////// Interface ("/api/interface/:world/").
app.get('/api/interface/:world/get_conquer', async (request, response) => {
    const world = request.params.world;
    if (!config.worlds.includes(world)) return;

    const { getConquer } = await import('./interface/get_conquer.js');
    const conquests = await getConquer(world, 60);

    if (Array.isArray(conquests) && conquests.length > 1) {
        conquests.sort((a, b) => b.raw.time - a.raw.time);
    };

    response.send(conquests);
});

////// Banco de dados ("/api/query/:world/").
// Jogadores
const playerQuery = '/api/query/:world/player';
app.get(playerQuery, async (request, response) => {
    const { world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getPlayerRanking } = await import('./db/models/player.js');
    const playerRanking = await getPlayerRanking(world);
    response.send(playerRanking);
});

app.get(`${playerQuery}/:id(\\d+)`, async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getPlayerInfo } = await import('./db/models/player.js');
    const playerInfo = await getPlayerInfo(world, id);
    response.send(playerInfo);
});

app.get(`${playerQuery}/:id(\\d+)/villages`, async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getPlayerVillages } = await import('./db/models/village.js');
    const playerVillages = await getPlayerVillages(world, id);
    response.send(playerVillages);
});

// Tribos
const allyQuery = '/api/query/:world/ally';
app.get(allyQuery, async (request, response) => {
    const { world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getAllyRanking } = await import('./db/models/ally.js');
    const allyRanking = await getAllyRanking(world);
    response.send(allyRanking);
});

app.get(`${allyQuery}/:id(\\d+)`, async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getAllyInfo } = await import('./db/models/ally.js');
    const allyInfo = await getAllyInfo(world, id);
    response.send(allyInfo);
});

app.get(`${allyQuery}/:id(\\d+)/members`, async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getAllyMembers } = await import('./db/models/ally.js');
    const allyMembers = await getAllyMembers(world, id);
    response.send(allyMembers);
});

////// Tribal Wars ("/api/game/:world/").
app.get('/api/game/:world/player/:id(\\d+)/profile', async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getPlayerProfilePage } = await import('./game/profile.js');
    const targetPage = await getPlayerProfilePage(world, id);
    response.send(targetPage);
});

app.get('/api/game/:world/ally/:id(\\d+)/profile', async (request, response) => {
    const { id, world } = request.params;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    const { getAllyProfilePage } = await import('./game/profile.js');
    const targetPage = await getAllyProfilePage(world, id);
    response.send(targetPage);
});

// Conecta à porta.
const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Conectado à porta ${port}.`));

// Atualiza o banco de dados.
updateAllDatabases();